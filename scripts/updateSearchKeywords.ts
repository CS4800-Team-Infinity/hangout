// Only run one time (Ran)
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";

// Load MongoDB URI safely
const MONGO_URI = process.env.MONGODB_URI!;

if (!MONGO_URI) {
  console.error("❌ ERROR: MONGODB_URI is missing from .env.local");
  process.exit(1);
}

// Define schema locally to avoid Next.js circular imports
const SearchKeywordSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    count: { type: Number, default: 1 },
    lastSearched: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SearchKeyword =
  mongoose.models.SearchKeyword ||
  mongoose.model("SearchKeyword", SearchKeywordSchema);

async function runUpdate() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("🔄 Updating old SearchKeyword documents...");

    const result = await SearchKeyword.updateMany(
      {
        $or: [
          { lastSearched: { $exists: false } },
          { count: { $exists: false } },
        ],
      },
      {
        $set: {
          lastSearched: new Date(),
          count: 1,
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} documents`);
  } catch (error) {
    console.error("❌ Update failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected. Done.");
    process.exit(0);
  }
}

runUpdate();
