#!/usr/bin/env node
import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import Hangout from '../src/models/Hangout';

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

const placeholderImages = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop',
];

async function addImagesToHangouts() {
  try {
    console.log('🖼️  Adding placeholder images to hangouts...\n');

    // Find all hangouts without an imageUrl
    const hangouts = await Hangout.find({
      $or: [
        { imageUrl: { $exists: false } },
        { imageUrl: null },
        { imageUrl: '' }
      ]
    });

    if (hangouts.length === 0) {
      console.log('✅ All hangouts already have images!');
      return;
    }

    console.log(`Found ${hangouts.length} hangouts without images.\n`);

    let updated = 0;
    for (let i = 0; i < hangouts.length; i++) {
      const hangout = hangouts[i];
      const imageUrl = placeholderImages[i % placeholderImages.length];

      await Hangout.updateOne(
        { _id: hangout._id },
        { $set: { imageUrl } }
      );

      console.log(`  ✅ Added image to: ${hangout.title}`);
      updated++;
    }

    console.log(`\n✨ Successfully added images to ${updated} hangouts!`);

  } catch (error) {
    console.error('❌ Error adding images:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting image addition process...\n');

    await connectToDatabase();
    await addImagesToHangouts();

    console.log('\n✅ Process completed successfully!');

  } catch (error) {
    console.error('❌ Process failed:', error);
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
