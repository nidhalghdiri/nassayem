// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create a default receptionist user
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "receptionist@example.com" },
    update: {},
    create: {
      email: "receptionist@example.com",
      name: "Default Receptionist",
      password: hashedPassword,
      role: "receptionist",
    },
  });

  console.log("Default user created:");
  console.log("Email: receptionist@example.com");
  console.log("Password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
