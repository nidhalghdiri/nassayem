// lib/prisma.js - SIMPLIFIED VERSION
import { PrismaClient } from "@prisma/client";

// Remove the accelerate extension
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const globalForPrisma = globalThis;

export const prismaClient = globalForPrisma.prisma || prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}

export default prismaClient;
