import { Router } from "express";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db, usersTable, professionalsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../lib/auth";
import { notifyAdminNewVerification } from "../lib/email";
import { SubmitVerificationBody, ListProfessionalsQueryParams, GetPassportParams } from "@workspace/api-zod";

const router = Router();

// GET /api/professionals/me
router.get("/professionals/me", requireAuth, requireRole("professional"), async (req, res) => {
  const authUser = (req as any).user;
  const [prof] = await db
    .select()
    .from(professionalsTable)
    .where(eq(professionalsTable.userId, authUser.userId))
    .limit(1);

  if (!prof) {
    res.status(404).json({ error: "Professional profile not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authUser.userId)).limit(1);

  res.json({
    ...prof,
    name: user?.name || "",
    email: user?.email || "",
    country: user?.country || null,
    portfolioLinks: prof.portfolioLinks || [],
    createdAt: undefined,
  });
});

// GET /api/professionals/passport/:passportId
router.get("/professionals/passport/:passportId", async (req, res) => {
  const { passportId } = req.params;

  const [prof] = await db
    .select()
    .from(professionalsTable)
    .where(eq(professionalsTable.passportId, passportId))
    .limit(1);

  if (!prof || prof.verificationStatus !== "verified") {
    res.status(404).json({ error: "Trust Passport not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, prof.userId)).limit(1);
  const nameParts = (user?.name || "").split(" ");
  const displayName = nameParts.length > 1
    ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`
    : nameParts[0] || "Professional";

  res.json({
    passportId: prof.passportId,
    displayName,
    userId: prof.userId,
    country: null,
    trustScore: prof.trustScore,
    tier: prof.tier,
    skillsCategory: prof.skillsCategory,
    projectsCompleted: prof.projectsCompleted,
    deliveryRate: prof.deliveryRate,
    clientSatisfaction: prof.clientSatisfaction,
    identityVerified: true,
    skillsAssessed: true,
    backgroundCleared: true,
    integrityConfirmed: true,
  });
});

// GET /api/professionals/directory — PUBLIC, no auth required
router.get("/professionals/directory", async (req, res) => {
  const page = parseInt(String(req.query.page || "1"));
  const limit = parseInt(String(req.query.limit || "12"));
  const offset = (page - 1) * limit;
  const skillsCategory = req.query.skillsCategory as string | undefined;
  const tier = req.query.tier as string | undefined;

  const results = await db
    .select({ prof: professionalsTable, user: usersTable })
    .from(professionalsTable)
    .innerJoin(usersTable, eq(professionalsTable.userId, usersTable.id))
    .where(eq(professionalsTable.verificationStatus, "verified"))
    .limit(200);

  const filtered = results.filter(r => {
    if (skillsCategory && r.prof.skillsCategory !== skillsCategory) return false;
    if (tier && r.prof.tier !== tier) return false;
    return true;
  });

  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  const professionals = paginated.map(r => {
    const nameParts = (r.user.name || "").split(" ");
    const displayName = nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`
      : nameParts[0] || "Professional";
    return {
      passportId: r.prof.passportId,
      displayName,
      skillsCategory: r.prof.skillsCategory,
      tier: r.prof.tier,
      trustScore: r.prof.trustScore,
      projectsCompleted: r.prof.projectsCompleted,
      deliveryRate: r.prof.deliveryRate,
      clientSatisfaction: r.prof.clientSatisfaction,
    };
  });

  res.json({ professionals, total, page, limit });
});

// GET /api/professionals
router.get("/professionals", requireAuth, async (req, res) => {
  const parsed = ListProfessionalsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  const page = params.page || 1;
  const limit = params.limit || 12;
  const offset = (page - 1) * limit;

  const results = await db
    .select({ prof: professionalsTable, user: usersTable })
    .from(professionalsTable)
    .innerJoin(usersTable, eq(professionalsTable.userId, usersTable.id))
    .where(eq(professionalsTable.verificationStatus, "verified"))
    .$dynamic();

  const allResults = await results.limit(limit).offset(offset);

  const filtered = allResults.filter(r => {
    if (params.skillsCategory && r.prof.skillsCategory !== params.skillsCategory) return false;
    if (params.tier && r.prof.tier !== params.tier) return false;
    return true;
  });

  const professionals = filtered.map(r => ({
    id: r.prof.id,
    userId: r.prof.userId,
    bio: r.prof.bio,
    skillsCategory: r.prof.skillsCategory,
    proficiencyLevel: r.prof.proficiencyLevel,
    portfolioLinks: r.prof.portfolioLinks || [],
    workHistory: r.prof.workHistory,
    verificationStatus: r.prof.verificationStatus,
    trustScore: r.prof.trustScore,
    tier: r.prof.tier,
    projectsCompleted: r.prof.projectsCompleted,
    deliveryRate: r.prof.deliveryRate,
    clientSatisfaction: r.prof.clientSatisfaction,
    passportId: r.prof.passportId,
    country: r.user.country,
    name: r.user.name,
    email: r.user.email,
  }));

  res.json({ professionals, total: professionals.length, page, limit });
});

// POST /api/verification/submit
router.post("/verification/submit", requireAuth, requireRole("professional"), async (req, res) => {
  const parsed = SubmitVerificationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid verification data" });
    return;
  }
  const authUser = (req as any).user;
  const data = parsed.data;

  if (data.country) {
    await db.update(usersTable).set({ country: data.country }).where(eq(usersTable.id, authUser.userId));
  }

  const [existing] = await db
    .select()
    .from(professionalsTable)
    .where(eq(professionalsTable.userId, authUser.userId))
    .limit(1);

  let prof;
  if (existing) {
    const [updated] = await db.update(professionalsTable)
      .set({
        bio: data.bio,
        skillsCategory: data.skillsCategory,
        proficiencyLevel: data.proficiencyLevel,
        portfolioLinks: data.portfolioLinks || [],
        workHistory: data.workHistory,
        verificationStatus: "pending",
      })
      .where(eq(professionalsTable.userId, authUser.userId))
      .returning();
    prof = updated;
  } else {
    const { randomUUID } = await import("crypto");
    const [created] = await db.insert(professionalsTable).values({
      userId: authUser.userId,
      bio: data.bio,
      skillsCategory: data.skillsCategory,
      proficiencyLevel: data.proficiencyLevel,
      portfolioLinks: data.portfolioLinks || [],
      workHistory: data.workHistory,
      verificationStatus: "pending",
      projectsCompleted: 0,
      passportId: randomUUID(),
    }).returning();
    prof = created;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authUser.userId)).limit(1);

  notifyAdminNewVerification({
    name: user?.name || "",
    email: user?.email || "",
    skillsCategory: data.skillsCategory || null,
    country: data.country || null,
  }).catch(() => {});

  res.status(201).json({
    ...prof,
    name: user?.name || "",
    email: user?.email || "",
    country: data.country || null,
    portfolioLinks: prof.portfolioLinks || [],
    createdAt: undefined,
  });
});

// GET /api/verification/my-status
router.get("/verification/my-status", requireAuth, requireRole("professional"), async (req, res) => {
  const authUser = (req as any).user;
  const [prof] = await db
    .select()
    .from(professionalsTable)
    .where(eq(professionalsTable.userId, authUser.userId))
    .limit(1);

  if (!prof) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, authUser.userId)).limit(1);

  res.json({
    ...prof,
    name: user?.name || "",
    email: user?.email || "",
    country: user?.country || null,
    portfolioLinks: prof.portfolioLinks || [],
    createdAt: undefined,
  });
});

export default router;
