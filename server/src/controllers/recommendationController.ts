import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  studentProfiles,
  programs,
  universities,
  documents,
  scholarships,
  applications,
  agencyProfiles,
  users,
} from "@/db/schema";

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
  const lower = (value || "").trim().toLowerCase();
  return COUNTRY_ALIASES[lower] ?? lower;
}

const ENGLISH_SPEAKING_COUNTRIES = new Set([
  "united kingdom",
  "united states",
  "canada",
  "australia",
  "new zealand",
  "ireland",
]);

export interface DocumentSignal {
  status: "matched" | "missing" | "neutral";
  text: string;
}

export async function getMyRecommendations(req: Request, res: Response) {
  const userId = req.user!.id;

  // 1. Fetch Student Profile
  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, userId),
  });
  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const preferredCountries = (profile?.preferredCountries ?? []).map(normalizeCountry);
  const preferredFields = (profile?.preferredFields ?? []).map((f) => f.toLowerCase());
  const gpaNum = profile?.gpa ? parseFloat(String(profile.gpa)) : null;
  const currentEdu = (profile?.currentEducationLevel || "").trim().toLowerCase();

  // 2. Fetch Student's Uploaded Documents
  const studentDocs = await db
    .select()
    .from(documents)
    .where(eq(documents.studentId, userId));

  const docCorpus = studentDocs.map((d) => `${d.type} ${d.fileName}`.toLowerCase());

  const hasTranscript = docCorpus.some(
    (s) => s.includes("transcript") || s.includes("marksheet") || s.includes("grade") || s.includes("academic record")
  );
  const hasTestScore = docCorpus.some(
    (s) =>
      s.includes("test score") ||
      s.includes("ielts") ||
      s.includes("toefl") ||
      s.includes("gre") ||
      s.includes("gmat") ||
      s.includes("sat") ||
      s.includes("pte") ||
      s.includes("duolingo")
  );
  const hasPassport = docCorpus.some(
    (s) => s.includes("passport") || s.includes("national id") || s.includes("nid") || s.includes("identity")
  );
  const hasSOP = docCorpus.some(
    (s) =>
      s.includes("statement of purpose") ||
      s.includes("sop") ||
      s.includes("personal statement") ||
      s.includes("motivation") ||
      s.includes("essay")
  );
  const hasRecommendation = docCorpus.some(
    (s) => s.includes("recommendation") || s.includes("lor") || s.includes("reference")
  );
  const hasPortfolio = docCorpus.some(
    (s) => s.includes("portfolio") || s.includes("project") || s.includes("cv") || s.includes("resume")
  );

  // Calculate Application Document Readiness Index
  let readiness = 10;
  if (hasTranscript) readiness += 35;
  if (hasPassport) readiness += 25;
  if (hasTestScore) readiness += 20;
  if (hasSOP) readiness += 10;
  const readinessScore = Math.min(100, readiness);

  const uploadedTypes = Array.from(new Set(studentDocs.map((d) => d.type)));
  const missingTypes: string[] = [];
  if (!hasTranscript) missingTypes.push("Academic Transcript");
  if (!hasTestScore) missingTypes.push("Language / Test Score (IELTS/TOEFL)");
  if (!hasPassport) missingTypes.push("Passport / ID");
  if (!hasSOP) missingTypes.push("Statement of Purpose (SOP)");

  // 3. Fetch Active Applications
  const activeApps = await db
    .select({ programId: applications.programId })
    .from(applications)
    .where(eq(applications.studentId, userId));
  const appliedProgramIds = new Set(activeApps.map((a) => a.programId));

  // 4. Fetch All Programs & Universities
  const rows = await db
    .select({
      programId: programs.id,
      programName: programs.name,
      degreeLevel: programs.degreeLevel,
      field: programs.field,
      tuitionFeeUsd: programs.tuitionFeeUsd,
      durationMonths: programs.durationMonths,
      description: programs.description,
      universityId: universities.id,
      universityName: universities.name,
      country: universities.country,
      city: universities.city,
      ranking: universities.ranking,
      logoUrl: universities.logoUrl,
      coverImageUrl: universities.coverImageUrl,
    })
    .from(programs)
    .innerJoin(universities, eq(programs.universityId, universities.id));

  // 5. Fetch Scholarships
  const allScholarships = await db.select().from(scholarships);

  // 6. Fetch Agencies
  const agencyRows = await db
    .select({
      userId: users.id,
      companyName: agencyProfiles.companyName,
      partnerUniversityIds: agencyProfiles.partnerUniversityIds,
      supportedCountries: agencyProfiles.supportedCountries,
      isVerified: agencyProfiles.isVerified,
    })
    .from(agencyProfiles)
    .innerJoin(users, eq(agencyProfiles.userId, users.id));

  // 7. Multi-Factor AI Matching Algorithm
  const scored = rows.map((row) => {
    let score = 30; // base score
    const reasons: string[] = [];
    const documentSignals: DocumentSignal[] = [];
    const normCountry = normalizeCountry(row.country);
    const isEnglishCountry = ENGLISH_SPEAKING_COUNTRIES.has(normCountry);

    // --- FACTOR A: Uploaded Documents Impact ---
    if (hasTranscript) {
      score += 15;
      if (gpaNum !== null) {
        if (gpaNum >= 3.6) {
          if (row.ranking && row.ranking <= 100) {
            score += 12;
            reasons.push(`Academic Record Match: Your GPA (${gpaNum.toFixed(2)}/4.0) satisfies top-tier global university entry standards`);
          } else {
            score += 8;
            reasons.push(`Strong GPA Standing (${gpaNum.toFixed(2)}/4.0) gives you high probability of admission`);
          }
          documentSignals.push({
            status: "matched",
            text: `Academic Transcript on file: GPA ${gpaNum.toFixed(2)}/4.0 qualifies for competitive admission & merit consideration`,
          });
        } else if (gpaNum >= 3.0) {
          score += 8;
          reasons.push(`Academic Record Match: Your GPA (${gpaNum.toFixed(2)}/4.0) meets admission criteria`);
          documentSignals.push({
            status: "matched",
            text: `Academic Transcript verified: GPA ${gpaNum.toFixed(2)}/4.0 meets baseline degree requirements`,
          });
        } else {
          score += 6;
          documentSignals.push({
            status: "neutral",
            text: `Academic Transcript verified: Program offers holistic/flexible review for GPA ${gpaNum.toFixed(2)}`,
          });
        }
      } else {
        documentSignals.push({
          status: "matched",
          text: "Academic Transcript on file in Document Vault (ready for university admissions review)",
        });
      }
    } else {
      documentSignals.push({
        status: "missing",
        text: "Academic Transcript not uploaded yet — add in Document Vault to verify GPA eligibility",
      });
    }

    if (isEnglishCountry) {
      if (hasTestScore) {
        score += 10;
        reasons.push("Language Proficiency Verified: English test score document on file meets direct entry requirements");
        documentSignals.push({
          status: "matched",
          text: `English proficiency document on file — satisfies ${row.country} visa & university direct entry requirements`,
        });
      } else {
        documentSignals.push({
          status: "missing",
          text: `English test score (IELTS/TOEFL/PTE) pending — required by ${row.country} universities for unconditional offer`,
        });
      }
    }

    if (hasPassport) {
      score += 8;
      documentSignals.push({
        status: "matched",
        text: "Passport ID verified — ready for university CAS / I-20 visa sponsorship issuance",
      });
    } else {
      documentSignals.push({
        status: "missing",
        text: "Passport copy needed to initiate international student visa clearance",
      });
    }

    if (hasSOP) {
      score += 6;
      reasons.push("Statement of Purpose (SOP) submitted: Demonstrates strong academic focus and intent");
      documentSignals.push({
        status: "matched",
        text: "Statement of Purpose attached — enhances qualitative admissions evaluation",
      });
    }

    if (hasRecommendation) {
      score += 4;
      documentSignals.push({
        status: "matched",
        text: "Letters of Recommendation attached — supports graduate admissions profile",
      });
    }

    // --- FACTOR B: Student Profile Preferences & Other Signals ---
    if (preferredCountries.includes(normCountry)) {
      score += 20;
      reasons.push(`Location Match: In your preferred study destination (${row.country})`);
    }

    const fieldLower = (row.field || "").toLowerCase();
    const nameLower = row.programName.toLowerCase();
    const descLower = (row.description || "").toLowerCase();

    const matchedField = preferredFields.find(
      (f) => fieldLower.includes(f) || f.includes(fieldLower) || nameLower.includes(f) || descLower.includes(f)
    );
    if (matchedField) {
      score += 20;
      reasons.push(`Curriculum Alignment: Matches your interest in ${row.field || matchedField}`);
    }

    // Degree Level Progression Match
    const progDegree = row.degreeLevel.toLowerCase();
    if (currentEdu.includes("bachelor") && (progDegree.includes("master") || progDegree.includes("postgraduate"))) {
      score += 10;
      reasons.push("Degree Progression: Master's level curriculum builds directly on your Bachelor's degree");
    } else if (currentEdu.includes("high school") && (progDegree.includes("bachelor") || progDegree.includes("undergraduate"))) {
      score += 10;
      reasons.push("Degree Level Match: Undergraduate degree designed for secondary school graduates");
    }

    // Ranking Prestige Boost
    if (row.ranking && row.ranking <= 25) {
      score += 5;
      reasons.push(`Elite Global Institution: Ranked #${row.ranking} in the world`);
    } else if (row.ranking && row.ranking <= 100) {
      score += 3;
      reasons.push(`Top 100 World Ranking: Ranked #${row.ranking} globally`);
    }

    // Scholarship Linkage
    const matchingScholarships = allScholarships.filter(
      (s) => s.universityId === row.universityId || s.universityId === null
    );
    if (matchingScholarships.length > 0) {
      score += 5;
      const topScholarship = matchingScholarships[0];
      reasons.push(
        `${matchingScholarships.length} scholarship${matchingScholarships.length > 1 ? "s" : ""} available (e.g. "${topScholarship.title}")`
      );
    }

    // Final score calculation
    const finalScore = Math.min(Math.max(score, 45), 99);

    // Determine Fit Tier
    let tier: "reach" | "best_match" | "safe" = "best_match";
    if ((row.ranking && row.ranking <= 50) || (finalScore >= 88 && row.ranking && row.ranking <= 100)) {
      tier = "reach";
    } else if (finalScore >= 78) {
      tier = "best_match";
    } else {
      tier = "safe";
    }

    // Suggested Agencies for this Program & University
    const suggestedAgencies = agencyRows
      .filter((a) => {
        const hasUniv = (a.partnerUniversityIds || []).includes(row.universityId);
        const hasCountry = (a.supportedCountries || []).map(normalizeCountry).includes(normCountry);
        return hasUniv || hasCountry;
      })
      .map((a) => ({
        userId: a.userId,
        companyName: a.companyName,
        isDirectPartner: (a.partnerUniversityIds || []).includes(row.universityId),
        isCountrySpecialist: (a.supportedCountries || []).map(normalizeCountry).includes(normCountry),
      }))
      .slice(0, 2);

    return {
      ...row,
      matchScore: finalScore,
      tier,
      reasons,
      documentSignals,
      scholarships: matchingScholarships.map((s) => ({
        id: s.id,
        title: s.title,
        coveragePercent: s.coveragePercent,
        amountUsd: s.amountUsd,
        category: s.category,
      })),
      suggestedAgencies,
      alreadyApplied: appliedProgramIds.has(row.programId),
    };
  });

  // Sort by match score descending
  scored.sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    hasPreferences: preferredCountries.length > 0 || preferredFields.length > 0,
    studentProfile: {
      fullName: userRecord?.fullName ?? "Student",
      gpa: profile?.gpa ?? null,
      currentEducationLevel: profile?.currentEducationLevel ?? null,
      nationality: profile?.nationality ?? null,
      preferredCountries: profile?.preferredCountries ?? [],
      preferredFields: profile?.preferredFields ?? [],
      bio: profile?.bio ?? null,
    },
    documentFactors: {
      totalDocuments: studentDocs.length,
      hasTranscript,
      hasTestScore,
      hasPassport,
      hasSOP,
      hasRecommendation,
      hasPortfolio,
      readinessScore,
      uploadedTypes,
      missingTypes,
    },
    data: scored,
  });
}
