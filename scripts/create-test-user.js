// scripts/create-test-user.js
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestUser() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  try {
    const user = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("Test user created:", user);
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

createTestUser();
