import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, professionalsTable } from "@workspace/db";
import { hashPassword, comparePassword, signToken, requireAuth } from "../lib/auth";
import { notifyAdminNewUser } from "../lib/email";
import { RegisterBody, LoginBody, SetRoleBody } from "@workspace/api-zod";
import crypto from "crypto";

const router = Router();

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password, name } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    email,
    name,
    passwordHash,
    isAdmin: false,
  }).returning();

  const token = signToken({ userId: user.id, email: user.email, role: user.role, isAdmin: user.isAdmin });

  // Notify admin in background
  notifyAdminNewUser({ name: user.name, email: user.email, role: user.role || "pending" }).catch(() => {});

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      country: user.country,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  if (!user.passwordHash) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role, isAdmin: user.isAdmin });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      country: user.country,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

// POST /api/auth/logout
router.post("/auth/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/auth/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, user.userId)).limit(1);
  if (!dbUser) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    country: dbUser.country,
    isAdmin: dbUser.isAdmin,
    createdAt: dbUser.createdAt.toISOString(),
  });
});

// POST /api/auth/set-role
router.post("/auth/set-role", requireAuth, async (req, res) => {
  const parsed = SetRoleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }
  const { role } = parsed.data;
  const authUser = (req as any).user;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, authUser.userId)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (existing.role) {
    res.status(400).json({ error: "Role has already been set and cannot be changed" });
    return;
  }

  const [updated] = await db.update(usersTable)
    .set({ role })
    .where(eq(usersTable.id, authUser.userId))
    .returning();

  // If professional, create a professional profile
  if (role === "professional") {
    const passportId = crypto.randomUUID();
    await db.insert(professionalsTable).values({
      userId: updated.id,
      verificationStatus: "not_submitted",
      projectsCompleted: 0,
      passportId,
      portfolioLinks: [],
    }).onConflictDoNothing();
  }

  // Notify admin
  notifyAdminNewUser({ name: updated.name, email: updated.email, role }).catch(() => {});

  // Issue a FRESH token so the new role is encoded in the JWT
  const newToken = signToken({ userId: updated.id, email: updated.email, role: updated.role, isAdmin: updated.isAdmin });

  res.json({
    token: newToken,
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      country: updated.country,
      isAdmin: updated.isAdmin,
      createdAt: updated.createdAt.toISOString(),
    },
  });
});

export default router;
