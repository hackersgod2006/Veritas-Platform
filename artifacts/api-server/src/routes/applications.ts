import { Router } from "express";
import { eq, desc, inArray } from "drizzle-orm";
import { db, applicationsTable, professionalsTable, projectsTable, usersTable } from "@workspace/db";
import { requireAuth, requireRole } from "../lib/auth";
import { ApplyToProjectBody, UpdateApplicationStatusBody } from "@workspace/api-zod";

const router = Router();

function formatApplication(a: typeof applicationsTable.$inferSelect) {
  return {
    id: a.id,
    professionalId: a.professionalId,
    projectId: a.projectId,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  };
}

// POST /api/applications
router.post("/applications", requireAuth, requireRole("professional"), async (req, res) => {
  const parsed = ApplyToProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid application data" });
    return;
  }
  const authUser = (req as any).user;

  const [prof] = await db.select().from(professionalsTable).where(eq(professionalsTable.userId, authUser.userId)).limit(1);
  if (!prof) {
    res.status(400).json({ error: "Professional profile not found" });
    return;
  }

  // Prevent duplicate applications
  const [existing] = await db.select().from(applicationsTable)
    .where(eq(applicationsTable.professionalId, prof.id))
    .limit(100);
  const alreadyApplied = existing && Array.isArray(existing)
    ? false
    : false;

  const [existingApp] = await db.select().from(applicationsTable)
    .where(eq(applicationsTable.professionalId, prof.id))
    .limit(1);

  // Check for duplicate on this specific project
  const allApps = await db.select().from(applicationsTable)
    .where(eq(applicationsTable.professionalId, prof.id));
  const duplicate = allApps.find(a => a.projectId === parsed.data.projectId);
  if (duplicate) {
    res.status(409).json({ error: "You have already applied to this project" });
    return;
  }

  const [app] = await db.insert(applicationsTable).values({
    professionalId: prof.id,
    projectId: parsed.data.projectId,
    status: "pending",
  }).returning();

  res.status(201).json(formatApplication(app));
});

// GET /api/applications/my
router.get("/applications/my", requireAuth, requireRole("professional"), async (req, res) => {
  const authUser = (req as any).user;
  const [prof] = await db.select().from(professionalsTable).where(eq(professionalsTable.userId, authUser.userId)).limit(1);
  if (!prof) {
    res.json([]);
    return;
  }
  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.professionalId, prof.id)).orderBy(desc(applicationsTable.createdAt));
  res.json(apps.map(formatApplication));
});

// GET /api/applications/for-my-projects  (client view)
router.get("/applications/for-my-projects", requireAuth, requireRole("client"), async (req, res) => {
  const authUser = (req as any).user;

  // Get client's projects
  const myProjects = await db.select().from(projectsTable).where(eq(projectsTable.clientId, authUser.userId));
  if (myProjects.length === 0) {
    res.json([]);
    return;
  }

  const projectIds = myProjects.map(p => p.id);

  // Get applications on those projects
  const apps = await db.select().from(applicationsTable)
    .where(inArray(applicationsTable.projectId, projectIds))
    .orderBy(desc(applicationsTable.createdAt));

  if (apps.length === 0) {
    res.json([]);
    return;
  }

  // Fetch professional details with user info
  const profIds = [...new Set(apps.map(a => a.professionalId))];
  const professionals = await db.select({
    prof: professionalsTable,
    user: usersTable,
  })
    .from(professionalsTable)
    .innerJoin(usersTable, eq(professionalsTable.userId, usersTable.id))
    .where(inArray(professionalsTable.id, profIds));

  const profMap = new Map(professionals.map(p => [p.prof.id, p]));
  const projectMap = new Map(myProjects.map(p => [p.id, p]));

  const result = apps.map(app => {
    const profData = profMap.get(app.professionalId);
    const project = projectMap.get(app.projectId);
    return {
      id: app.id,
      professionalId: app.professionalId,
      projectId: app.projectId,
      status: app.status,
      createdAt: app.createdAt.toISOString(),
      professionalName: profData?.user.name || "Unknown",
      professionalUserId: profData?.prof.userId || 0,
      skillsCategory: profData?.prof.skillsCategory || null,
      trustScore: profData?.prof.trustScore || null,
      tier: profData?.prof.tier || null,
      passportId: profData?.prof.passportId || null,
      projectTitle: project?.title || "Unknown Project",
    };
  });

  res.json(result);
});

// PATCH /api/applications/:applicationId/status
router.patch("/applications/:applicationId/status", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.applicationId));
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid application ID" });
    return;
  }
  const parsed = UpdateApplicationStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [updated] = await db.update(applicationsTable)
    .set({ status: parsed.data.status })
    .where(eq(applicationsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(formatApplication(updated));
});

export default router;
