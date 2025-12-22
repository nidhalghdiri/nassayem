// diagnose-auth.js
const { PrismaClient } = require("@prisma/client");

async function diagnose() {
  console.log("🔍 Starting authentication diagnosis...\n");

  try {
    // 1. Check environment
    console.log("1. Checking environment variables:");
    console.log("   NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "NOT SET");
    console.log(
      "   NEXTAUTH_SECRET:",
      process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET"
    );
    console.log(
      "   DATABASE_URL:",
      process.env.DATABASE_URL
        ? "SET (first 50 chars): " +
            process.env.DATABASE_URL.substring(0, 50) +
            "..."
        : "NOT SET"
    );

    // 2. Test database connection
    console.log("\n2. Testing database connection:");
    const prisma = new PrismaClient();
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log("   ✅ Database connection successful");
    } catch (dbError) {
      console.log("   ❌ Database connection failed:", dbError.message);
      console.log("   Code:", dbError.code);
      if (dbError.code === "P1001") {
        console.log(
          "   🔧 Fix: Check DATABASE_URL and network access to Supabase"
        );
      }
    }

    // 3. Test user lookup
    console.log("\n3. Testing user lookup:");
    const testEmail = "ghdiri.nidhal@gmail.com";
    try {
      const user = await prisma.user.findUnique({
        where: { email: testEmail },
      });

      if (user) {
        console.log("   ✅ User found:");
        console.log("      ID:", user.id);
        console.log("      Email:", user.email);
        console.log("      Name:", user.name);
        console.log("      isActive:", user.isActive);
        console.log("      Has password:", !!user.password);

        // Test password
        console.log("\n4. Password test:");
        console.log('   Input password: "nidhal123"');
        console.log("   Stored password:", user.password);
        console.log("   Match:", user.password === "nidhal123");
      } else {
        console.log("   ❌ User not found in database");
        console.log("   🔧 Fix: Create user or check email spelling");
      }
    } catch (queryError) {
      console.log("   ❌ Query failed:", queryError.message);
    }

    // 4. Check Prisma client location
    console.log("\n5. Checking Prisma client:");
    const fs = require("fs");
    const path = require("path");

    const prismaPaths = [
      "node_modules/@prisma/client",
      "node_modules/.prisma/client",
      "app/generated/prisma/client",
    ];

    prismaPaths.forEach((p) => {
      const fullPath = path.join(__dirname, p);
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ Found: ${p}`);
      } else {
        console.log(`   ❌ Missing: ${p}`);
      }
    });

    await prisma.$disconnect();
  } catch (error) {
    console.log("💥 Diagnosis failed:", error);
  }

  console.log("\n🎯 Recommendation:");
  console.log('   1. Fix schema.prisma to use env("DATABASE_URL")');
  console.log("   2. Remove webpack aliases from next.config.js");
  console.log("   3. Regenerate Prisma client: npx prisma generate");
  console.log("   4. Set DATABASE_URL in .env.local");
}

diagnose();
