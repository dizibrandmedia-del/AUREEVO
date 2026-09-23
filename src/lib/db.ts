import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./dev.db";
  }

  const DEFAULT_TURSO_URL = "libsql://aurevo-dizibrandmedia-del.aws-ap-south-1.turso.io";
  const DEFAULT_TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTAxMDQyMDksImlkIjoiMDFhMGNhODYtMmIwMS03MTJjLWI1YTYtMDMxZjNkOWUzZmQ5Iiwia2lkIjoibXpldXhwVzJ0aDZNUG1KVzRxQlB6LUhCTHlMaWw0VXVOX2dCeUJoQTQzWSIsInJpZCI6IjE5YjVkYjYyLTc0NjQtNDQxOS1hNjRhLWQ5YTZmOTM1ZDkwMiJ9.rNllR5H5zSYS58o_PGw-IgJRS49MGreKioPh-D6L48dOJNKfDNlGkF3EOpOdL0HTmKAnNb5RJ5VY87BJkySeAA";

  const tursoUrl = process.env.TURSO_DATABASE_URL || DEFAULT_TURSO_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || DEFAULT_TURSO_TOKEN;

  if (tursoUrl && (tursoUrl.startsWith("libsql:") || tursoUrl.startsWith("https:"))) {
    try {
      const libsql = createClient({
        url: tursoUrl,
        authToken: tursoAuthToken || undefined,
      });
      const adapter = new PrismaLibSQL(libsql);
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });
    } catch (err) {
      console.error("Failed to initialize Turso LibSQL adapter, falling back to local SQLite:", err);
    }
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
