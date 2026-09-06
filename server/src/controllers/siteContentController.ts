import { Request, Response } from "express";
import { z } from "zod";
import { db } from "@/db";
import { siteContent } from "@/db/schema";

export async function listSiteContent(_req: Request, res: Response) {
  const rows = await db.select().from(siteContent);
  res.json({ data: rows });
}

const upsertSchema = z.object({
  key: z.string().min(1).max(120),
  title: z.string().optional(),
  body: z.string().optional(),
});

export async function upsertSiteContent(req: Request, res: Response) {
  const data = upsertSchema.parse(req.body);

  const [row] = await db
    .insert(siteContent)
    .values({ key: data.key, title: data.title, body: data.body, updatedBy: req.user!.id })
    .onConflictDoUpdate({
      target: siteContent.key,
      set: { title: data.title, body: data.body, updatedBy: req.user!.id, updatedAt: new Date() },
    })
    .returning();

  res.json(row);
}
