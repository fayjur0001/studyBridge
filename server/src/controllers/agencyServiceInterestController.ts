import { Request, Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { agencyServiceInterests, agencyServices, notifications, users } from "@/db/schema";
import { AppError } from "@/utils/AppError";

export async function requestAgencyService(req: Request, res: Response) {
  const service = await db.query.agencyServices.findFirst({ where: and(eq(agencyServices.id, req.params.serviceId), eq(agencyServices.isActive, true)) });
  if (!service) throw new AppError("This program is no longer available.", 404);
  const [interest] = await db.insert(agencyServiceInterests).values({ agencyId: service.agencyId, serviceId: service.id, studentId: req.user!.id }).onConflictDoNothing().returning();
  if (interest) {
    const student = await db.query.users.findFirst({ where: eq(users.id, req.user!.id) });
    await db.insert(notifications).values({ userId: service.agencyId, type: "service_interest", title: "New program request", body: `${student?.fullName ?? "A student"} wants to join ${service.name}.` });
  }
  res.status(interest ? 201 : 200).json({ requested: true, alreadyRequested: !interest });
}

export async function listMyServiceInterests(req: Request, res: Response) {
  const rows = await db.select({ id: agencyServiceInterests.id, status: agencyServiceInterests.status, createdAt: agencyServiceInterests.createdAt, studentId: users.id, studentName: users.fullName, studentEmail: users.email, serviceName: agencyServices.name })
    .from(agencyServiceInterests).innerJoin(users, eq(agencyServiceInterests.studentId, users.id)).innerJoin(agencyServices, eq(agencyServiceInterests.serviceId, agencyServices.id))
    .where(eq(agencyServiceInterests.agencyId, req.user!.id)).orderBy(desc(agencyServiceInterests.createdAt));
  res.json({ data: rows });
}
