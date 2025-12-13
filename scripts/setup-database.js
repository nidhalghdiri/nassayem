#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

console.log("🚀 Starting database setup...");
console.log("===============================");

try {
  // Step 1: Start Docker containers
  console.log("🐳 Starting Docker containers...");
  execSync("docker-compose up -d", { stdio: "inherit" });
  console.log("✅ Docker containers started successfully!");

  // Wait for PostgreSQL to be ready
  console.log("⏳ Waiting for PostgreSQL to be ready...");
  setTimeout(() => {
    console.log("✅ PostgreSQL should be ready now!");
  }, 5000);

  // Step 2: Generate Prisma Client
  console.log("🔧 Generating Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✅ Prisma Client generated successfully!");

  // Step 3: Push schema to database
  console.log("📤 Pushing schema to database...");
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
  console.log("✅ Schema pushed successfully!");

  // Step 4: Seed the database
  console.log("🌱 Seeding database...");
  execSync("node scripts/seed.js", { stdio: "inherit" });
  console.log("✅ Database seeded successfully!");

  console.log("\n🎉 Database setup completed successfully!");
  console.log("\n📊 Access Information:");
  console.log("===============================");
  console.log("PostgreSQL Database:");
  console.log("- Host: localhost:5432");
  console.log("- Database: nassayem_db");
  console.log("- Username: nassayem_user");
  console.log("- Password: nassayem_password");

  console.log("\n📈 pgAdmin (Database GUI):");
  console.log("- URL: http://localhost:5050");
  console.log("- Email: admin@nassayem.com");
  console.log("- Password: admin123");

  console.log("\n🔐 Admin Dashboard:");
  console.log("- URL: http://localhost:3000/admin/login");
  console.log("- Email: admin@nassayem.com");
  console.log("- Password: Admin123!");

  console.log("\n🚀 Prisma Studio:");
  console.log("- Run: npx prisma studio");
  console.log("- URL: http://localhost:5555");

  console.log("\n📝 Commands:");
  console.log("- Stop containers: docker-compose down");
  console.log("- View logs: docker-compose logs -f");
  console.log("- Reset database: npm run db:reset");
} catch (error) {
  console.error("❌ Error during setup:", error.message);
  process.exit(1);
}
