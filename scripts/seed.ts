#!/usr/bin/env node
import mongoose from "mongoose";
import { config } from "dotenv";
import path from "path";
import {
  generateMockUsers,
  generateMockHangouts,
  generateMockRSVPs,
} from "../src/lib/mockData";
import User from "../src/models/User";
import Hangout from "../src/models/Hangout";
import RSVP from "../src/models/RSVP";

config({ path: path.resolve(process.cwd(), ".env.local") });
config();

async function connectToDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function checkExistingAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: "admin@hangout.com" });
    return existingAdmin;
  } catch (error) {
    console.error("Error checking for existing admin:", error);
    return null;
  }
}

async function seedUsers(preserveAdmin = true) {
  try {
    console.log("🌱 Seeding users...");

    let adminUser = null;
    if (preserveAdmin) {
      adminUser = await checkExistingAdmin();
      if (adminUser) {
        console.log("✅ Found existing admin user, preserving...");
      }
    }

    const mockUsers = generateMockUsers();
    const createdUsers: any[] = [];

    if (adminUser) {
      createdUsers.push(adminUser);
    }

    for (const userData of mockUsers) {
      try {
        const conditions = [];
        if (userData.email) conditions.push({ email: userData.email });
        if (userData.username) conditions.push({ username: userData.username });
        if (userData.guestId) conditions.push({ guestId: userData.guestId });

        const existingUser =
          conditions.length > 0
            ? await User.findOne({ $or: conditions })
            : null;

        if (!existingUser) {
          const user = new User(userData);
          const savedUser = await user.save();
          createdUsers.push(savedUser);
          console.log(
            `  ✅ Created user: ${userData.name} (${
              userData.email || userData.guestId
            })`
          );
        } else {
          console.log(
            `  ⚠️  User already exists: ${userData.name}, skipping...`
          );
          createdUsers.push(existingUser);
        }
      } catch (error) {
        console.error(`  ❌ Failed to create user ${userData.name}:`, error);
      }
    }

    console.log(
      `✅ Users seeding completed. Total users: ${createdUsers.length}`
    );
    return createdUsers;
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
}

async function seedHangouts(users: any[]) {
  try {
    console.log("🌱 Seeding hangouts...");

    if (!users || users.length === 0) {
      console.log("⚠️ No users found, skipping hangout seeding.");
      return [];
    }

    const userIds = users
      .map((user: any) => user?._id?.toString())
      .filter(Boolean);
    const mockHangouts = generateMockHangouts(userIds);
    const createdHangouts: any[] = [];

    for (const hangoutData of mockHangouts) {
      try {
        const existingHangout = await Hangout.findOne({
          uuid: hangoutData.uuid,
        });

        if (!existingHangout) {
          const hangout = new Hangout(hangoutData);
          const savedHangout = await hangout.save();
          createdHangouts.push(savedHangout);
          console.log(`  ✅ Created hangout: ${hangoutData.title}`);
        } else {
          console.log(
            `  ⚠️  Hangout already exists: ${hangoutData.title}, skipping...`
          );
          createdHangouts.push(existingHangout);
        }
      } catch (error) {
        console.error(
          `  ❌ Failed to create hangout ${hangoutData.title}:`,
          error
        );
      }
    }

    console.log(
      `✅ Hangouts seeding completed. Total hangouts: ${createdHangouts.length}`
    );
    return createdHangouts;
  } catch (error) {
    console.error("❌ Error seeding hangouts:", error);
    throw error;
  }
}

async function seedRSVPs(users: any[], hangouts: any[]) {
  try {
    console.log("🌱 Seeding RSVPs...");

    const userIds = users
      .map((user: any) => user?._id?.toString())
      .filter(Boolean);
    const hangoutIds = hangouts
      .map((hangout: any) => hangout?._id?.toString())
      .filter(Boolean);
    const mockRSVPs = generateMockRSVPs(userIds, hangoutIds);

    let createdRSVPs = 0;
    let skippedRSVPs = 0;

    for (const rsvpData of mockRSVPs) {
      try {
        const existingRSVP = await RSVP.findOne({
          hangout: rsvpData.hangout,
          user: rsvpData.user,
        });

        if (!existingRSVP) {
          const rsvp = new RSVP(rsvpData);
          await rsvp.save();
          createdRSVPs++;
        } else {
          skippedRSVPs++;
        }
      } catch (error) {
        console.error(`  ❌ Failed to create RSVP:`, error);
      }
    }

    console.log(
      `✅ RSVPs seeding completed. Created: ${createdRSVPs}, Skipped: ${skippedRSVPs}`
    );
    return createdRSVPs;
  } catch (error) {
    console.error("❌ Error seeding RSVPs:", error);
    throw error;
  }
}

async function updateFriendships(users: any[]) {
  try {
    console.log("🌱 Creating friendships...");

    const regularUsers = users.filter((user: any) => user.role !== "guest");

    for (let i = 0; i < Math.min(regularUsers.length - 1, 5); i++) {
      const user1 = regularUsers[i];
      const user2 = regularUsers[i + 1];

      if (!user1.friends.includes(user2._id)) {
        user1.friends.push(user2._id);
        await user1.save();
      }

      if (!user2.friends.includes(user1._id)) {
        user2.friends.push(user1._id);
        await user2.save();
      }

      console.log(`  ✅ Added friendship: ${user1.name} ↔ ${user2.name}`);
    }

    console.log("✅ Friendships created successfully");
  } catch (error) {
    console.error("❌ Error creating friendships:", error);
  }
}

async function seedUserEventJoins() {
  try {
    console.log("🌱 Seeding user joins to events...");

    const users = await User.find();
    const hangouts = await Hangout.find();

    if (!users.length || !hangouts.length) {
      console.log("⚠️ No users or hangouts found, skipping user-event joins.");
      return;
    }

    // pick first few real users (skip admin/guest)
    const realUsers = users.filter(
      (u: any) => u.role !== "guest" && u.email !== "admin@hangout.com"
    );

    // map event names to seed RSVPs for
    const targetTitles = [
      "Pomona Art Night",
      "Diamond Bar Coffee Meetup",
      "Westminster Pho Lovers Meetup",
      "Pomona Farmers Market",
      "Diamond Bar Hikers",
      "Long Beach Beach Cleanup",
      "Norwalk Community Picnic",
      "Westminster Bubble Tea Crawl",
    ];

    const targetHangouts = hangouts.filter((h: any) =>
      targetTitles.includes(h.title)
    );

    let created = 0;
    let skipped = 0;

    for (const hangout of targetHangouts) {
      // select random 3–5 users to join
      const selectedUsers = realUsers
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 3);

      for (const user of selectedUsers) {
        const existing = await RSVP.findOne({
          hangout: hangout._id,
          user: user._id,
        });

        if (!existing) {
          await RSVP.create({
            hangout: hangout._id,
            user: user._id,
            status: "accepted",
            respondedAt: new Date(),
            notes: "Excited to join this event!",
          });
          created++;
        } else {
          skipped++;
        }
      }
    }

    console.log(
      `✅ User-event joins completed. Created: ${created}, Skipped: ${skipped}`
    );
  } catch (error) {
    console.error("❌ Error seeding user joins:", error);
  }
}

async function displaySummary() {
  try {
    const userCount = await User.countDocuments();
    const hangoutCount = await Hangout.countDocuments();
    const rsvpCount = await RSVP.countDocuments();

    console.log("\n📊 Database Summary:");
    console.log(`  👥 Users: ${userCount}`);
    console.log(`  🎉 Hangouts: ${hangoutCount}`);
    console.log(`  📝 RSVPs: ${rsvpCount}`);
    console.log("\n✨ Seeding completed successfully!");
    console.log("\nYou can now test your app with realistic data.");
    console.log("Your existing admin@hangout.com user has been preserved.");
  } catch (error) {
    console.error("Error displaying summary:", error);
  }
}

async function main() {
  try {
    console.log("🚀 Starting database seeding...\n");

    await connectToDatabase();

    const users = await seedUsers(true);
    const hangouts = await seedHangouts(users);
    await seedRSVPs(users, hangouts);
    await updateFriendships(users);
    await seedUserEventJoins();

    await displaySummary();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔐 Database connection closed");
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}
