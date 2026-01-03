// lib/db.js
import { PrismaClient } from "@prisma/client";

// Connection pool management for Supabase
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error"],
    // Optimize for serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL + "?pgbouncer=true&connection_limit=5",
      },
    },
  });
} else {
  // Development - reuse connection
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "error", "warn"],
    });
  }
  prisma = global.prisma;
}

// Helper function to safely execute queries
export async function withConnection(fn) {
  try {
    return await fn(prisma);
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    // In production, we need to disconnect to avoid pool exhaustion
    if (process.env.NODE_ENV === "production") {
      await prisma.$disconnect().catch(() => {});
    }
  }
}

export default prisma;
