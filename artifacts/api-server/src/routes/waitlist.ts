import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, waitlistTable } from "@workspace/db";
import { JoinWaitlistBody } from "@workspace/api-zod";

const router = Router();

// POST /api/waitlist
router.post("/waitlist", async (req, res) => {
  const parsed = JoinWaitlistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A valid email address is required" });
    return;
  }
  const { email } = parsed.data;

  const existing = await db.select().from(waitlistTable).where(eq(waitlistTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "This email is already on the waitlist" });
    return;
  }

  await db.insert(waitlistTable).values({ email });
  res.status(201).json({ message: "You have been added to the waitlist. We will be in touch." });
});

export default router;
