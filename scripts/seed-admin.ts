import { config } from "dotenv";
config({ path: ".env.local" });

import { hash } from "bcryptjs";

const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
const name = process.env.SEED_ADMIN_NAME ?? "Admin";

async function main() {
  const { db } = await import("../db");
  const { adminUsers } = await import("../db/schema");

  const passwordHash = await hash(password, 12);

  await db
    .insert(adminUsers)
    .values({ email, name, passwordHash })
    .onConflictDoNothing();

  console.log(`Admin user ready: ${email}`);
}

main().catch(console.error);
