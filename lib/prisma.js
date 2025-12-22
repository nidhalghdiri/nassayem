import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

const globalForPrisma = global;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
