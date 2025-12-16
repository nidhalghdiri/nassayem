import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DB_URL}`;

const globalForPrisma = globalThis;

const adapter = new PrismaPg({ connectionString });
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

export { prisma };
