// /lib/db.js
import prisma from "./prisma";

export async function withConnection(callback) {
  // Use the singleton instance
  return await callback(prisma);
}
