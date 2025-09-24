#!/usr/bin/env node
import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import { generateMockUsers, generateMockHangouts, generateMockRSVPs } from '../src/lib/mockData';
import User from '../src/models/User';
import Hangout from '../src/models/Hangout';
import RSVP from '../src/models/RSVP';

config({ path: path.resolve(process.cwd(), '.env.local') });
config();

async function connectToDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function checkExistingAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@hangout.com' });
    return existingAdmin;
  } catch (error) {
    console.error('Error checking for existing admin:', error);
    return null;
  }
}

async function seedUsers(preserveAdmin = true) {
  try {
    console.log('🌱 Seeding users...');

    let adminUser = null;
    if (preserveAdmin) {
      adminUser = await checkExistingAdmin();
      if (adminUser) {
        console.log('✅ Found existing admin user, preserving...');
      }
    }

    const mockUsers = generateMockUsers();
    const createdUsers = [];

    if (adminUser) {
      createdUsers.push(adminUser);
    }

    for (const userData of mockUsers) {
      try {
        // Build query conditions dynamically to avoid undefined values
        const conditions = [];
        if (userData.email) conditions.push({ email: userData.email });
        if (userData.username) conditions.push({ username: userData.username });
        if (userData.guestId) conditions.push({ guestId: userData.guestId });

        const existingUser = conditions.length > 0
          ? await User.findOne({ $or: conditions })
          : null;

        if (!existingUser) {
          const user = new User(userData);
          const savedUser = await user.save();
          createdUsers.push(savedUser);
          console.log(`  ✅ Created user: ${userData.name} (${userData.email || userData.guestId})`);
        } else {
          console.log(`  ⚠️  User already exists: ${userData.name}, skipping...`);
          createdUsers.push(existingUser);
        }
      } catch (error) {
        console.error(`  ❌ Failed to create user ${userData.name}:`, error);
      }
    }

    console.log(`✅ Users seeding completed. Total users: ${createdUsers.length}`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

async function seedHangouts(users: any[]) {
  try {
    console.log('🌱 Seeding hangouts...');

    const userIds = users.map(user => user._id.toString());
    const mockHangouts = generateMockHangouts(userIds);
    const createdHangouts = [];

    for (const hangoutData of mockHangouts) {
      try {
        const existingHangout = await Hangout.findOne({ uuid: hangoutData.uuid });

        if (!existingHangout) {
          const hangout = new Hangout(hangoutData);
          const savedHangout = await hangout.save();
          createdHangouts.push(savedHangout);
          console.log(`  ✅ Created hangout: ${hangoutData.title}`);
        } else {
          console.log(`  ⚠️  Hangout already exists: ${hangoutData.title}, skipping...`);
          createdHangouts.push(existingHangout);
        }
      } catch (error) {
        console.error(`  ❌ Failed to create hangout ${hangoutData.title}:`, error);
      }
    }

    console.log(`✅ Hangouts seeding completed. Total hangouts: ${createdHangouts.length}`);
    return createdHangouts;
  } catch (error) {
    console.error('❌ Error seeding hangouts:', error);
    throw error;
  }
}

async function seedRSVPs(users: any[], hangouts: any[]) {
  try {
    console.log('🌱 Seeding RSVPs...');

    const userIds = users.map(user => user._id.toString());
    const hangoutIds = hangouts.map(hangout => hangout._id.toString());
    const mockRSVPs = generateMockRSVPs(userIds, hangoutIds);

    let createdRSVPs = 0;
    let skippedRSVPs = 0;

    for (const rsvpData of mockRSVPs) {
      try {
        const existingRSVP = await RSVP.findOne({
          hangout: rsvpData.hangout,
          user: rsvpData.user
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

    console.log(`✅ RSVPs seeding completed. Created: ${createdRSVPs}, Skipped: ${skippedRSVPs}`);
    return createdRSVPs;
  } catch (error) {
    console.error('❌ Error seeding RSVPs:', error);
    throw error;
  }
}

async function updateFriendships(users: any[]) {
  try {
    console.log('🌱 Creating friendships...');

    const regularUsers = users.filter(user => user.role !== 'guest');

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

    console.log('✅ Friendships created successfully');
  } catch (error) {
    console.error('❌ Error creating friendships:', error);
  }
}

async function displaySummary() {
  try {
    const userCount = await User.countDocuments();
    const hangoutCount = await Hangout.countDocuments();
    const rsvpCount = await RSVP.countDocuments();

    console.log('\n📊 Database Summary:');
    console.log(`  👥 Users: ${userCount}`);
    console.log(`  🎉 Hangouts: ${hangoutCount}`);
    console.log(`  📝 RSVPs: ${rsvpCount}`);
    console.log('\n✨ Seeding completed successfully!');
    console.log('\nYou can now test your app with realistic data.');
    console.log('Your existing admin@hangout.com user has been preserved.');
  } catch (error) {
    console.error('Error displaying summary:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...\n');

    await connectToDatabase();

    const users = await seedUsers(true);
    const hangouts = await seedHangouts(users);
    await seedRSVPs(users, hangouts);
    await updateFriendships(users);

    await displaySummary();

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}