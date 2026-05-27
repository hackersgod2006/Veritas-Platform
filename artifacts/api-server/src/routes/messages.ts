import { Router } from "express";
import { eq, or, and, desc, sql } from "drizzle-orm";
import { db, messagesTable, usersTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import { SendMessageBody } from "@workspace/api-zod";

const router = Router();

// Patterns that are not allowed in messages (contact info, external platform references)
const BLOCKED_PATTERNS = [
  /(\+?[\d][\d\s\-\(\)\.]{7,}[\d])/,                        // Phone numbers
  /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/,  // Email addresses
  /\b(skype|discord|telegram|whatsapp|signal|instagram|snapchat|facebook|wechat|viber)\b/i, // External apps
  /\b(call me|text me|my number|phone me|reach me at|contact me at|outside (this|the) platform|off-platform)\b/i,
];

function containsBlockedContent(text: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(text));
}

function formatMessage(m: typeof messagesTable.$inferSelect) {
  return {
    id: m.id,
    senderId: m.senderId,
    receiverId: m.receiverId,
    content: m.content,
    isRead: m.isRead,
    createdAt: m.createdAt.toISOString(),
  };
}

// POST /api/messages
router.post("/messages", requireAuth, async (req, res) => {
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid message data" });
    return;
  }

  const authUser = (req as any).user;
  const { receiverId, content } = parsed.data;

  if (containsBlockedContent(content)) {
    // In a real system, we'd flag/ban the user here
    res.status(400).json({
      error: "Your message contains contact information or external platform references. This is not permitted on Veritas. Repeated violations will result in a permanent ban."
    });
    return;
  }

  if (authUser.userId === receiverId) {
    res.status(400).json({ error: "Cannot send a message to yourself" });
    return;
  }

  // Check receiver exists
  const [receiver] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, receiverId)).limit(1);
  if (!receiver) {
    res.status(404).json({ error: "Recipient not found" });
    return;
  }

  const [msg] = await db.insert(messagesTable).values({
    senderId: authUser.userId,
    receiverId,
    content,
  }).returning();

  res.status(201).json(formatMessage(msg));
});

// GET /api/messages/conversations
router.get("/messages/conversations", requireAuth, async (req, res) => {
  const authUser = (req as any).user;
  const userId = authUser.userId;

  // Get all messages involving this user, grouped by the other party
  const msgs = await db
    .select()
    .from(messagesTable)
    .where(or(
      eq(messagesTable.senderId, userId),
      eq(messagesTable.receiverId, userId)
    ))
    .orderBy(desc(messagesTable.createdAt));

  // Build conversation map
  const convMap = new Map<number, { lastMessage: string; lastMessageAt: Date; unreadCount: number }>();
  for (const msg of msgs) {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!convMap.has(otherId)) {
      convMap.set(otherId, {
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        unreadCount: (!msg.isRead && msg.receiverId === userId) ? 1 : 0,
      });
    } else {
      if (!msg.isRead && msg.receiverId === userId) {
        convMap.get(otherId)!.unreadCount++;
      }
    }
  }

  if (convMap.size === 0) {
    res.json([]);
    return;
  }

  // Fetch names
  const otherIds = Array.from(convMap.keys());
  const users = await db.select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable)
    .where(sql`${usersTable.id} = ANY(${otherIds})`);

  const conversations = users.map((u) => {
    const conv = convMap.get(u.id)!;
    return {
      userId: u.id,
      name: u.name,
      lastMessage: conv.lastMessage,
      lastMessageAt: conv.lastMessageAt.toISOString(),
      unreadCount: conv.unreadCount,
    };
  }).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  res.json(conversations);
});

// GET /api/messages/conversation/:userId
router.get("/messages/conversation/:userId", requireAuth, async (req, res) => {
  const authUser = (req as any).user;
  const myId = authUser.userId;
  const otherId = parseInt(String(req.params.userId));

  if (isNaN(otherId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const [otherUser] = await db.select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable).where(eq(usersTable.id, otherId)).limit(1);

  if (!otherUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const msgs = await db.select().from(messagesTable)
    .where(or(
      and(eq(messagesTable.senderId, myId), eq(messagesTable.receiverId, otherId)),
      and(eq(messagesTable.senderId, otherId), eq(messagesTable.receiverId, myId))
    ))
    .orderBy(messagesTable.createdAt);

  // Mark unread messages as read
  await db.update(messagesTable)
    .set({ isRead: true })
    .where(and(eq(messagesTable.receiverId, myId), eq(messagesTable.senderId, otherId)));

  res.json({
    messages: msgs.map(formatMessage),
    otherUser: { id: otherUser.id, name: otherUser.name },
  });
});

export default router;
