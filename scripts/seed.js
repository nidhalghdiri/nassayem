import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (optional - only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("🧹 Clearing existing data...");
      await prisma.inquiry.deleteMany();
      await prisma.booking.deleteMany();
      await prisma.property.deleteMany();
      await prisma.session.deleteMany();
      await prisma.user.deleteMany();
    }

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@nassayem.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

    console.log(`👤 Creating admin user: ${adminEmail}`);

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        role: "ADMIN",
      },
      create: {
        email: adminEmail,
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("✅ Admin user created/updated!");

    // Create sample properties
    console.log("🏠 Creating sample properties...");

    const properties = [
      {
        title: "Luxury Villa with Sea View",
        description:
          "Beautiful villa with panoramic sea view, 4 bedrooms, private pool, and modern amenities. Perfect for family vacations.",
        price: 350.0,
        location: "Al Mughsail, Salalah",
        bedrooms: 4,
        bathrooms: 3,
        area: 300,
        status: "AVAILABLE",
        images: [
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w-800&auto=format&fit=crop",
        ],
        amenities: [
          "Swimming Pool",
          "Free WiFi",
          "Parking",
          "Air Conditioning",
          "Kitchen",
          "Washing Machine",
          "TV",
          "Sea View",
        ],
        userId: admin.id,
      },
      {
        title: "Modern Apartment Downtown",
        description:
          "Fully furnished apartment in city center, perfect for business travelers. Close to restaurants and shopping malls.",
        price: 150.0,
        location: "City Center, Salalah",
        bedrooms: 2,
        bathrooms: 2,
        area: 120,
        status: "AVAILABLE",
        images: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop",
        ],
        amenities: [
          "Free WiFi",
          "Parking",
          "Air Conditioning",
          "Gym",
          "Laundry",
          "Elevator",
          "Security",
        ],
        userId: admin.id,
      },
      {
        title: "Beachfront Studio",
        description:
          "Cozy studio apartment with direct beach access. Perfect for couples or solo travelers.",
        price: 120.0,
        location: "Taqah Beach, Salalah",
        bedrooms: 1,
        bathrooms: 1,
        area: 80,
        status: "RENTED",
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
        ],
        amenities: [
          "Beach Access",
          "Free WiFi",
          "Parking",
          "Air Conditioning",
          "Kitchenette",
          "Balcony",
        ],
        userId: admin.id,
      },
      {
        title: "Family Villa with Garden",
        description:
          "Spacious villa with large garden, 5 bedrooms, and traditional Omani architecture.",
        price: 450.0,
        location: "Awqad, Salalah",
        bedrooms: 5,
        bathrooms: 4,
        area: 400,
        status: "AVAILABLE",
        images: [
          "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800&auto=format&fit=crop",
        ],
        amenities: [
          "Garden",
          "Swimming Pool",
          "Free WiFi",
          "Parking",
          "Air Conditioning",
          "Full Kitchen",
          "Maid Service",
        ],
        userId: admin.id,
      },
    ];

    for (const property of properties) {
      await prisma.property.create({ data: property });
    }

    console.log(`✅ ${properties.length} properties created!`);

    // Create sample bookings
    console.log("📅 Creating sample bookings...");

    const sampleProperties = await prisma.property.findMany();

    const bookings = [
      {
        propertyId: sampleProperties[0].id,
        userId: admin.id,
        checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        checkOut: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        totalPrice: 2450.0,
        status: "CONFIRMED",
        guests: 4,
      },
      {
        propertyId: sampleProperties[1].id,
        userId: admin.id,
        checkIn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        totalPrice: 1050.0,
        status: "CONFIRMED",
        guests: 2,
      },
    ];

    for (const booking of bookings) {
      await prisma.booking.create({ data: booking });
    }

    console.log(`✅ ${bookings.length} bookings created!`);

    // Create sample inquiries
    console.log("📞 Creating sample inquiries...");

    const inquiries = [
      {
        name: "Ahmed Al-Balushi",
        email: "ahmed@example.com",
        phone: "+968 1234 5678",
        message:
          "Interested in the Luxury Villa. Is it available for Khareef season?",
        propertyId: sampleProperties[0].id,
        status: "PENDING",
      },
      {
        name: "Fatima Al-Siyabi",
        email: "fatima@example.com",
        phone: "+968 8765 4321",
        message:
          "Looking for long-term rental in City Center. Do you have any 3-bedroom apartments?",
        status: "PENDING",
      },
    ];

    for (const inquiry of inquiries) {
      await prisma.inquiry.create({ data: inquiry });
    }

    console.log(`✅ ${inquiries.length} inquiries created!`);

    // Create additional users
    console.log("👥 Creating additional users...");

    const users = [
      {
        email: "editor@nassayem.com",
        name: "Editor User",
        password: await bcrypt.hash("Editor123!", 10),
        role: "EDITOR",
      },
      {
        email: "viewer@nassayem.com",
        name: "Viewer User",
        password: await bcrypt.hash("Viewer123!", 10),
        role: "VIEWER",
      },
    ];

    for (const user of users) {
      await prisma.user.create({ data: user });
    }

    console.log(`✅ ${users.length} additional users created!`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n🔐 Login Credentials:");
    console.log("=====================");
    console.log("Admin:");
    console.log("- Email: admin@nassayem.com");
    console.log("- Password: Admin123!");
    console.log("\nEditor:");
    console.log("- Email: editor@nassayem.com");
    console.log("- Password: Editor123!");
    console.log("\nViewer:");
    console.log("- Email: viewer@nassayem.com");
    console.log("- Password: Viewer123!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
