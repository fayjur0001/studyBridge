import { Request, Response } from "express";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { savedItems } from "@/db/schema";
import { AppError } from "@/utils/AppError";

export async function listMySavedItems(req: Request, res: Response) {
  const rows = await db.select().from(savedItems).where(eq(savedItems.userId, req.user!.id));
  res.json({ data: rows });
}

const saveItemSchema = z.object({
  itemType: z.enum(["university", "program", "scholarship"]),
  itemId: z.string().uuid(),
});

export async function saveItem(req: Request, res: Response) {
  const data = saveItemSchema.parse(req.body);

  const existing = await db.query.savedItems.findFirst({
    where: and(
      eq(savedItems.userId, req.user!.id),
      eq(savedItems.itemType, data.itemType),
      eq(savedItems.itemId, data.itemId)
    ),
  });
  if (existing) {
    return res.status(200).json(existing);
  }

  const [row] = await db
    .insert(savedItems)
    .values({ userId: req.user!.id, itemType: data.itemType, itemId: data.itemId })
    .returning();

  res.status(201).json(row);
}

export async function unsaveItem(req: Request, res: Response) {
  const { itemType, itemId } = req.params as { itemType: "university" | "program" | "scholarship"; itemId: string };

  const [row] = await db
    .delete(savedItems)
    .where(
      and(
        eq(savedItems.userId, req.user!.id),
        eq(savedItems.itemType, itemType),
        eq(savedItems.itemId, itemId)
      )
    )
    .returning();

  if (!row) throw new AppError("Saved item not found.", 404);
  res.status(204).send();
}
