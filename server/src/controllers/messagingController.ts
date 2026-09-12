import { Request, Response } from "express";
import { z } from "zod";
import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  conversations,
  conversationParticipants,
  messages,
  users,
} from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { notifyUser, notifyUsers, getUserFullName } from "@/services/notificationService";

async function assertParticipant(conversationId: string, userId: string) {
  const row = await db.query.conversationParticipants.findFirst({
    where: and(
      eq(conversationParticipants.conversationId, conversationId),
      eq(conversationParticipants.userId, userId)
    ),
  });
  if (!row) throw new AppError("Conversation not found.", 404);
  return row;
}

export async function listMyConversations(req: Request, res: Response) {
  const myParticipations = await db
    .select({ conversationId: conversationParticipants.conversationId, lastReadAt: conversationParticipants.lastReadAt })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, req.user!.id));

  if (!myParticipations.length) {
    return res.json({ data: [] });
  }

  const results = await Promise.all(
    myParticipations.map(async (p) => {
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, p.conversationId),
      });

      const otherParticipants = await db
        .select({ userId: users.id, fullName: users.fullName, role: users.role, avatarUrl: users.avatarUrl })
        .from(conversationParticipants)
        .innerJoin(users, eq(conversationParticipants.userId, users.id))
        .where(
          and(
            eq(conversationParticipants.conversationId, p.conversationId),
            ne(conversationParticipants.userId, req.user!.id)
          )
        );

      const lastMessage = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, p.conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      const unreadRows = await db
        .select({ id: messages.id, createdAt: messages.createdAt })
        .from(messages)
        .where(and(eq(messages.conversationId, p.conversationId), ne(messages.senderId, req.user!.id)));
      const unreadCount = p.lastReadAt
        ? unreadRows.filter((m) => m.createdAt > p.lastReadAt!).length
        : unreadRows.length;

      return {
        id: p.conversationId,
        subject: conversation?.subject ?? null,
        participants: otherParticipants,
        lastMessage: lastMessage[0] ?? null,
        unreadCount,
      };
    })
  );

  results.sort((a, b) => {
    const at = a.lastMessage?.createdAt?.getTime() ?? 0;
    const bt = b.lastMessage?.createdAt?.getTime() ?? 0;
    return bt - at;
  });

  res.json({ data: results });
}

const startConversationSchema = z.object({
  recipientId: z.string().uuid(),
  subject: z.string().optional(),
  message: z.string().min(1),
});

export async function startConversation(req: Request, res: Response) {
  const data = startConversationSchema.parse(req.body);

  if (data.recipientId === req.user!.id) {
    throw new AppError("You cannot start a conversation with yourself.", 422);
  }
  const recipient = await db.query.users.findFirst({ where: eq(users.id, data.recipientId) });
  if (!recipient) throw new AppError("Recipient not found.", 404);

  // Reuse an existing 1:1 conversation between these two users instead of
  // creating a new thread every time someone hits "message" again.
  const myConversationIds = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, req.user!.id));

  let conversationId: string | null = null;
  if (myConversationIds.length) {
    const shared = await db
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.userId, data.recipientId),
          inArray(
            conversationParticipants.conversationId,
            myConversationIds.map((c) => c.conversationId)
          )
        )
      )
      .limit(1);
    conversationId = shared[0]?.conversationId ?? null;
  }

  let conversation;
  if (conversationId) {
    [conversation] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
  } else {
    [conversation] = await db.insert(conversations).values({ subject: data.subject }).returning();
    await db.insert(conversationParticipants).values([
      { conversationId: conversation.id, userId: req.user!.id, lastReadAt: new Date() },
      { conversationId: conversation.id, userId: data.recipientId },
    ]);
  }

  const [message] = await db
    .insert(messages)
    .values({ conversationId: conversation.id, senderId: req.user!.id, body: data.message })
    .returning();

  await db
    .update(conversationParticipants)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationParticipants.conversationId, conversation.id),
        eq(conversationParticipants.userId, req.user!.id)
      )
    );

  const senderName = await getUserFullName(req.user!.id);

  await notifyUser(data.recipientId, {
    type: "new_message",
    title: `New Message from ${senderName}`,
    body: data.message.length > 100 ? `${data.message.slice(0, 100)}...` : data.message,
  });

  res.status(201).json({ conversation, message });
}

export async function listMessages(req: Request, res: Response) {
  await assertParticipant(req.params.id, req.user!.id);

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, req.params.id))
    .orderBy(asc(messages.createdAt));

  await db
    .update(conversationParticipants)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationParticipants.conversationId, req.params.id),
        eq(conversationParticipants.userId, req.user!.id)
      )
    );

  res.json({ data: rows });
}

const sendMessageSchema = z.object({
  body: z.string().min(1),
});

export async function sendMessage(req: Request, res: Response) {
  await assertParticipant(req.params.id, req.user!.id);
  const data = sendMessageSchema.parse(req.body);

  const [row] = await db
    .insert(messages)
    .values({ conversationId: req.params.id, senderId: req.user!.id, body: data.body })
    .returning();

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, req.params.id));

  await db
    .update(conversationParticipants)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationParticipants.conversationId, req.params.id),
        eq(conversationParticipants.userId, req.user!.id)
      )
    );

  const others = await db
    .select({ userId: conversationParticipants.userId })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, req.params.id),
        ne(conversationParticipants.userId, req.user!.id)
      )
    );

  if (others.length) {
    const senderName = await getUserFullName(req.user!.id);
    await notifyUsers(
      others.map((o) => o.userId),
      {
        type: "new_message",
        title: `New Message from ${senderName}`,
        body: data.body.length > 100 ? `${data.body.slice(0, 100)}...` : data.body,
      }
    );
  }

  res.status(201).json(row);
}
