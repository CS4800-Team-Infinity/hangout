import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import Hangout from "../src/models/Hangout";

const MONGO_URI = process.env.MONGODB_URI!;

if (!MONGO_URI) {
  console.error("❌ Missing MONGODB_URI.");
  process.exit(1);
}

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const hangouts = await Hangout.find({
    "location.coordinates.lat": { $exists: true },
  });

  console.log(`Found ${hangouts.length} hangouts to migrate...\n`);

  for (const h of hangouts) {
  const coords = h.location?.coordinates;

  // Skip if no coordinates
  if (!coords || coords.lat === undefined || coords.lng === undefined) {
    console.warn(`⚠️ Skipping ${h.title} — missing coordinates`);
    continue;
  }

  // Skip if already in GeoJSON format
  if (Array.isArray(coords)) continue;

  const { lat, lng } = coords;
  h.location = {
    type: "Point",
    coordinates: [lng, lat],
    address: h.location.address,
  };

  await h.save();
  console.log(`✅ Migrated: ${h.title}`);
}


  console.log("\n🎉 Migration complete!");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
