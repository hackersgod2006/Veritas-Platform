import { Router } from "express";
import { eq, count } from "drizzle-orm";
import { db, usersTable, professionalsTable, projectsTable, applicationsTable, waitlistTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../lib/auth";
import { notifyProfessionalApproved, notifyProfessionalRejected } from "../lib/email";
import { RejectVerificationBody } from "@workspace/api-zod";

const router = Router();

// GET /api/admin/verifications
router.get("/admin/verifications", requireAuth, requireAdmin, async (req, res) => {
  const results = await db
    .select({
      prof: professionalsTable,
      user: usersTable,
    })
    .from(professionalsTable)
    .innerJoin(usersTable, eq(professionalsTable.userId, usersTable.id))
    .where(eq(professionalsTable.verificationStatus, "pending"));

  const verifications = results.map(r => ({
    id: r.prof.id,
    userId: r.prof.userId,
    name: r.user.name,
    email: r.user.email,
    country: r.user.country,
    skillsCategory: r.prof.skillsCategory,
    proficiencyLevel: r.prof.proficiencyLevel,
    bio: r.prof.bio,
    workHistory: r.prof.workHistory,
    portfolioLinks: r.prof.portfolioLinks || [],
    verificationStatus: r.prof.verificationStatus,
    createdAt: r.prof.createdAt.toISOString(),
  }));

  res.json(verifications);
});

// POST /api/admin/verifications/:professionalId/approve
router.post("/admin/verifications/:professionalId/approve", requireAuth, requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.professionalId));
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const trustScore = Math.floor(Math.random() * 200) + 600; // 600-800 range for new approvals
  let tier = "Trusted";
  if (trustScore >= 801) tier = "Elite";
  else if (trustScore >= 601) tier = "Advanced";
  else if (trustScore >= 401) tier = "Trusted";
  else tier = "Emerging";

  const [updated] = await db.update(professionalsTable)
    .set({ verificationStatus: "verified", trustScore, tier })
    .where(eq(professionalsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Professional not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId)).limit(1);

  // Notify professional
  notifyProfessionalApproved({
    name: user?.name || "",
    email: user?.email || "",
    trustScore: updated.trustScore,
    tier: updated.tier,
    passportId: updated.passportId,
  }).catch(() => {});

  res.json({ message: "Verification approved successfully" });
});

// POST /api/admin/verifications/:professionalId/reject
router.post("/admin/verifications/:professionalId/reject", requireAuth, requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.professionalId));
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = RejectVerificationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A rejection reason is required" });
    return;
  }

  const [updated] = await db.update(professionalsTable)
    .set({ verificationStatus: "rejected" })
    .where(eq(professionalsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Professional not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId)).limit(1);

  // Notify professional
  notifyProfessionalRejected({
    name: user?.name || "",
    email: user?.email || "",
    reason: parsed.data.reason,
  }).catch(() => {});

  res.json({ message: "Verification rejected and applicant notified" });
});

// GET /api/admin/stats
router.get("/admin/stats", requireAuth, requireAdmin, async (req, res) => {
  const [totalUsersResult] = await db.select({ count: count() }).from(usersTable);
  const [totalProfResult] = await db.select({ count: count() }).from(professionalsTable);
  const [totalProjectsResult] = await db.select({ count: count() }).from(projectsTable);
  const [waitlistResult] = await db.select({ count: count() }).from(waitlistTable);

  const allProfs = await db.select({ status: professionalsTable.verificationStatus }).from(professionalsTable);
  const pendingVerifications = allProfs.filter(p => p.status === "pending").length;
  const verifiedProfessionals = allProfs.filter(p => p.status === "verified").length;

  const allUsers = await db.select({ role: usersTable.role }).from(usersTable);
  const totalClients = allUsers.filter(u => u.role === "client").length;
  const totalProfessionals = allUsers.filter(u => u.role === "professional").length;

  res.json({
    totalUsers: totalUsersResult?.count || 0,
    totalProfessionals,
    totalClients,
    totalProjects: totalProjectsResult?.count || 0,
    pendingVerifications,
    verifiedProfessionals,
    waitlistCount: waitlistResult?.count || 0,
  });
});

// GET /api/admin/users
router.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  const users = await db.select().from(usersTable);
  res.json(users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    country: u.country,
    isAdmin: u.isAdmin,
    createdAt: u.createdAt.toISOString(),
  })));
});

export default router;
