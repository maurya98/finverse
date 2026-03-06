/* eslint-disable no-console */
import "dotenv/config";
import { prisma } from "../src/databases/client";
import { Role } from "../src/databases/generated/prisma";
import * as bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "priyanshu.bharti@buddyloan.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123!";
  const adminName = process.env.ADMIN_NAME || "Priyanshu Bharti";

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`✅ Admin user already exists: ${adminEmail}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: Role.ADMIN,
        isActive: true,
      },
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log("🎉 Seed completed!");
    process.exit(0);
  })
  .catch((e) => {
    console.error("🚨 Seed failed:", e);
    process.exit(1);
  });
