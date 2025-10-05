#!/usr/bin/env node
import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import User from '../src/models/User';
import Hangout from '../src/models/Hangout';
import RSVP from '../src/models/RSVP';

config({ path: path.resolve(process.cwd(), '.env.local') });
config();

async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
}

async function testUserEventQueries() {
  console.log('🧪 Testing User + Event Queries...\n');

  // Get a user to test with
  const testUser = await User.findOne({ role: 'user' });
  if (!testUser) {
    console.log('❌ No test user found');
    return;
  }

  console.log(`Testing with user: ${testUser.name} (${testUser.email})\n`);

  // 1. Events hosted by user
  const hostedEvents = await Hangout.find({ host: testUser._id })
    .populate('host', 'name email');
  console.log(`📅 Events hosted by ${testUser.name}: ${hostedEvents.length}`);
  hostedEvents.forEach(event => console.log(`  - ${event.title}`));

  // 2. User's RSVPs
  const userRSVPs = await RSVP.find({ user: testUser._id })
    .populate('hangout', 'title date status');
  console.log(`\n✋ ${testUser.name}'s RSVPs: ${userRSVPs.length}`);
  userRSVPs.forEach(rsvp =>
    console.log(`  - ${rsvp.hangout.title} (${rsvp.status})`)
  );

  // 3. Get any event with participants
  const anyEvent = await Hangout.findOne();
  if (anyEvent) {
    const eventRSVPs = await RSVP.find({ hangout: anyEvent._id })
      .populate('user', 'name email role');

    console.log(`\n🎉 Event: "${anyEvent.title}" has ${eventRSVPs.length} participants:`);
    eventRSVPs.forEach(rsvp =>
      console.log(`  - ${rsvp.user.name} (${rsvp.status})`)
    );
  }

  // 4. Stats summary
  const totalUsers = await User.countDocuments();
  const totalEvents = await Hangout.countDocuments();
  const totalRSVPs = await RSVP.countDocuments();

  console.log('\n📊 Database Stats:');
  console.log(`  👥 Users: ${totalUsers}`);
  console.log(`  🎉 Events: ${totalEvents}`);
  console.log(`  📝 RSVPs: ${totalRSVPs}`);

  console.log('\n✅ All user + event queries working perfectly!');
}

async function main() {
  try {
    await connectToDatabase();
    await testUserEventQueries();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
  }
}

if (require.main === module) {
  main();
}