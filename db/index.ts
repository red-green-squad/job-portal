import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, {
  schema,
  logger: {
    logQuery(query, params) {
      const table = query.match(/from "(\w+)"/i)?.[1] ?? "?";
      console.log(`[db:query] table=${table} params=${JSON.stringify(params)}`);
    },
  },
});
