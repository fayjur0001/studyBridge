import { db, pool } from "./index";
import { users, studentProfiles, agencyProfiles, universities, programs, scholarships } from "./schema";
import { hashPassword } from "@/utils/password";

async function main() {
  console.log("Seeding database...");

  const passwordHash = await hashPassword("Password123!");

  const [student] = await db
    .insert(users)
    .values({ email: "student@example.com", passwordHash, fullName: "Amina Rahman", role: "student" })
    .returning();
  await db.insert(studentProfiles).values({
    userId: student.id,
    nationality: "Bangladeshi",
    currentEducationLevel: "Bachelor's",
    gpa: "3.80",
    preferredCountries: ["UK", "Canada"],
    preferredFields: ["Computer Science"],
  });

  const [agency] = await db
    .insert(users)
    .values({ email: "agency@example.com", passwordHash, fullName: "Karim Hossain", role: "agency" })
    .returning();
  await db.insert(agencyProfiles).values({
    userId: agency.id,
    companyName: "Bridge Education Consultants",
    licenseNumber: "BD-EDU-1029",
    website: "https://bridge-edu.example.com",
    isVerified: true,
  });

  await db
    .insert(users)
    .values({ email: "admin@example.com", passwordHash, fullName: "Platform Admin", role: "admin" });

  const [oxford] = await db
    .insert(universities)
    .values({
      name: "University of Oxford",
      country: "United Kingdom",
      region: "Europe",
      city: "Oxford",
      ranking: 1,
      description: "One of the world's oldest and most prestigious research universities.",
      websiteUrl: "https://www.ox.ac.uk",
      isFeatured: true,
    })
    .returning();

  const [nus] = await db
    .insert(universities)
    .values({
      name: "National University of Singapore",
      country: "Singapore",
      region: "Asia-Pacific",
      city: "Singapore",
      ranking: 8,
      description: "Singapore's flagship university, known for innovation and research.",
      websiteUrl: "https://www.nus.edu.sg",
    })
    .returning();

  await db.insert(programs).values([
    {
      universityId: oxford.id,
      name: "MSc Computer Science",
      degreeLevel: "Master's",
      field: "Computer Science",
      durationMonths: 12,
      tuitionFeeUsd: "42000",
      intakeMonths: ["September"],
      description: "Advanced study in algorithms, AI, and systems.",
    },
    {
      universityId: nus.id,
      name: "MComp Digital Innovation",
      degreeLevel: "Master's",
      field: "Computer Science",
      durationMonths: 18,
      tuitionFeeUsd: "35000",
      intakeMonths: ["August", "January"],
      description: "Interdisciplinary program blending computing and business innovation.",
    },
  ]);

  await db.insert(scholarships).values([
    {
      universityId: oxford.id,
      title: "Global Excellence Scholarship",
      provider: "International Education Trust",
      category: "Merit Based",
      amountUsd: "45000",
      coveragePercent: 100,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      eligibility: "Minimum GPA of 3.8/4.0. Open to international students from any country.",
      description: "Awarded to outstanding students demonstrating academic excellence and leadership potential.",
    },
    {
      title: "Women in STEM Leadership Grant",
      provider: "TechForward Foundation",
      category: "Need Based",
      amountUsd: "25000",
      coveragePercent: 60,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      eligibility: "Women pursuing STEM degrees with demonstrated financial need.",
      description: "Supports women in science, technology, engineering, or mathematics.",
    },
  ]);

  console.log("Seed complete. Demo accounts (password: Password123!):");
  console.log("  student@example.com / agency@example.com / admin@example.com");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
