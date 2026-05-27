import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { type Request, type Response, type NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.SESSION_SECRET || "veritas-secret-key-change-in-production";
const SALT_ROUNDS = 10;

export interface JwtPayload {
  userId: number;
  email: string;
  role: string | null;
  isAdmin: boolean;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user as JwtPayload | undefined;
  if (!user?.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

export function requireRole(role: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user as JwtPayload | undefined;
    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Fast path: JWT already has the correct role
    if (user.role === role || user.isAdmin) {
      next();
      return;
    }

    // Fallback: JWT may be stale (role was set after token was issued).
    // Re-check the live role from the database.
    try {
      const [dbUser] = await db.select({ role: usersTable.role })
        .from(usersTable)
        .where(eq(usersTable.id, user.userId))
        .limit(1);

      if (dbUser?.role === role) {
        // Patch the request user so downstream handlers see the correct role
        (req as any).user = { ...user, role: dbUser.role };
        next();
        return;
      }
    } catch {
      // DB lookup failed — fall through to 403
    }

    res.status(403).json({ error: `Access restricted to ${role}s` });
  };
}
