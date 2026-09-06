import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { studentProfiles, programs, universities } from "@/db/schema";

// Common short-form/alias variants so "UK" in a student's preferences
// matches a university listed with the full country name "United Kingdom",
// rather than requiring an exact string match.
const COUNTRY_ALIASES: Record<string, string> = {
  uk: "united kingdom",
  "u.k.": "united kingdom",
  usa: "united states",
  "u.s.a.": "united states",
  us: "united states",
  "u.s.": "united states",
  uae: "united arab emirates",
};

function normalizeCountry(value: string): string {
  const lower = value.trim().toLowerCase();
  return COUNTRY_ALIASES[lower] ?? lower;
}

// This is a transparent, rule-based match — NOT a machine-learning
// prediction. The score is built from real signals the student provided
// (preferred countries/fields) plus university ranking, so every point is
// explainable rather than an invented percentage.
export async function getMyRecommendations(req: Request, res: Response) {
  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, req.user!.id),
  });

  const preferredCountries = (profile?.preferredCountries ?? []).map(normalizeCountry);
  const preferredFields = (profile?.preferredFields ?? []).map((f) => f.toLowerCase());

  const rows = await db
    .select({
      programId: programs.id,
      programName: programs.name,
      degreeLevel: programs.degreeLevel,
      field: programs.field,
      universityId: universities.id,
      universityName: universities.name,
      country: universities.country,
      ranking: universities.ranking,
      logoUrl: universities.logoUrl,
    })
    .from(programs)
    .innerJoin(universities, eq(programs.universityId, universities.id));

  const scored = rows.map((row) => {
    let score = 40; // baseline so every listed program has some relevance
    const reasons: string[] = [];

    if (preferredCountries.includes(normalizeCountry(row.country))) {
      score += 30;
      reasons.push(`In one of your preferred countries: ${row.country}`);
    }
    if (row.field && preferredFields.some((f) => row.field!.toLowerCase().includes(f) || f.includes(row.field!.toLowerCase()))) {
      score += 25;
      reasons.push(`Matches your interest in ${row.field}`);
    }
    if (row.ranking && row.ranking <= 100) {
      score += 5;
      reasons.push(`Ranked in the global top ${row.ranking <= 50 ? 50 : 100}`);
    }

    return { ...row, matchScore: Math.min(score, 99), reasons };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    hasPreferences: preferredCountries.length > 0 || preferredFields.length > 0,
    data: scored.slice(0, 20),
  });
}
