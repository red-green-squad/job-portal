import { config } from "dotenv";
config({ path: ".env.local" });

import { Client } from "pg";
import { db } from "../db";
import { adminUsers, categories, jobs } from "../db/schema";

async function main() {
  const neonUrl = process.env.NEON_DATABASE_URL;
  if (!neonUrl) throw new Error("NEON_DATABASE_URL is not set in .env.local");

  const client = new Client({ connectionString: neonUrl });
  await client.connect();
  console.log("Connected to Neon.");

  // Categories first — jobs foreign-key into them
  const { rows: cats } = await client.query<{
    id: string; type: string; label: string; value: string; created_at: Date;
  }>("SELECT * FROM categories ORDER BY created_at ASC");

  for (const cat of cats) {
    await db.insert(categories).values({
      id: cat.id,
      type: cat.type,
      label: cat.label,
      value: cat.value,
      createdAt: new Date(cat.created_at),
    }).onConflictDoNothing();
  }
  console.log(`  categories: ${cats.length}`);

  // Admin users
  const { rows: users } = await client.query<{
    id: string; email: string; name: string; password_hash: string;
    is_active: boolean; created_at: Date;
  }>("SELECT * FROM admin_users ORDER BY created_at ASC");

  for (const user of users) {
    await db.insert(adminUsers).values({
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash: user.password_hash,
      isActive: user.is_active,
      createdAt: new Date(user.created_at),
    }).onConflictDoNothing();
  }
  console.log(`  admin_users: ${users.length}`);

  // Jobs last — they reference categories
  const { rows: jobRows } = await client.query<{
    id: string; title: string; company: string; description: string;
    role_id: string | null; experience_id: string | null;
    location: string | null; salary: string | null; type: string;
    apply_url: string | null; last_date: Date | null;
    company_logo: string | null; is_active: boolean;
    created_at: Date; updated_at: Date;
  }>("SELECT * FROM jobs ORDER BY created_at ASC");

  for (const job of jobRows) {
    await db.insert(jobs).values({
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      roleId: job.role_id,
      experienceId: job.experience_id,
      location: job.location,
      salary: job.salary,
      type: job.type,
      applyUrl: job.apply_url,
      lastDate: job.last_date ? new Date(job.last_date) : null,
      companyLogo: job.company_logo,
      isActive: job.is_active,
      createdAt: new Date(job.created_at),
      updatedAt: new Date(job.updated_at),
    }).onConflictDoNothing();
  }
  console.log(`  jobs: ${jobRows.length}`);

  await client.end();
  console.log("Migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
