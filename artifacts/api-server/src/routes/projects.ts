import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../lib/auth";
import { CreateProjectBody, ListProjectsQueryParams, GetProjectParams } from "@workspace/api-zod";

const router = Router();

function formatProject(p: typeof projectsTable.$inferSelect) {
  return {
    id: p.id,
    clientId: p.clientId,
    title: p.title,
    description: p.description,
    skillsRequired: p.skillsRequired || [],
    duration: p.duration,
    budgetMin: p.budgetMin,
    budgetMax: p.budgetMax,
    preferredTier: p.preferredTier,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  };
}

// GET /api/projects
router.get("/projects", requireAuth, async (req, res) => {
  const parsed = ListProjectsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  const page = params.page || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  let projects = await db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt)).limit(limit).offset(offset);

  if (params.status) {
    projects = projects.filter(p => p.status === params.status);
  }
  if (params.preferredTier) {
    projects = projects.filter(p => p.preferredTier === params.preferredTier);
  }

  res.json({ projects: projects.map(formatProject), total: projects.length, page });
});

// POST /api/projects
router.post("/projects", requireAuth, requireRole("client"), async (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid project data" });
    return;
  }
  const authUser = (req as any).user;
  const data = parsed.data;

  const [project] = await db.insert(projectsTable).values({
    clientId: authUser.userId,
    title: data.title,
    description: data.description,
    skillsRequired: data.skillsRequired || [],
    duration: data.duration,
    budgetMin: data.budgetMin,
    budgetMax: data.budgetMax,
    preferredTier: data.preferredTier,
    status: "open",
  }).returning();

  res.status(201).json(formatProject(project));
});

// GET /api/projects/my
router.get("/projects/my", requireAuth, requireRole("client"), async (req, res) => {
  const authUser = (req as any).user;
  const projects = await db.select().from(projectsTable).where(eq(projectsTable.clientId, authUser.userId)).orderBy(desc(projectsTable.createdAt));
  res.json(projects.map(formatProject));
});

// GET /api/projects/:projectId
router.get("/projects/:projectId", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.projectId));
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(formatProject(project));
});

export default router;
