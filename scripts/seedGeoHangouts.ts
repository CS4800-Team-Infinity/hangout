import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import Hangout from "../src/models/Hangout";
import User from "../src/models/User";

const MONGO_URI = process.env.MONGODB_URI!;

async function seedGeoHangouts() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const user = await User.findOne();
  if (!user) {
    console.error("❌ No user found. Please create at least one user first.");
    process.exit(1);
  }

  const now = new Date();
  const baseDate = (days: number) =>
    new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const hangouts = [
    // === 10 Events near Westminster ===
    {
      title: "Westminster Pho Lovers Meetup",
      description: "Let’s try the best pho spots in Little Saigon!",
      host: user._id,
      date: baseDate(2),
      location: { type: "Point", coordinates: [-117.9930, 33.7513], address: "Little Saigon, Westminster, CA" },
      imageUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Westminster Bubble Tea Crawl",
      description: "Visit multiple bubble tea cafes around Bolsa Ave.",
      host: user._id,
      date: baseDate(3),
      location: { type: "Point", coordinates: [-117.9901, 33.7510], address: "Bolsa Ave, Westminster, CA" },
      imageUrl: "https://images.unsplash.com/photo-1622114924264-efb0d6d1f94a?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Westminster Karaoke Night",
      description: "Sing your heart out at a fun local bar.",
      host: user._id,
      date: baseDate(5),
      location: { type: "Point", coordinates: [-117.9950, 33.7505], address: "Café Lu, Westminster, CA" },
      imageUrl: "https://images.unsplash.com/photo-1534515723387-51411fae5d6d?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Westminster Tech Talk",
      description: "Mini tech talk about AI and startups at a local café.",
      host: user._id,
      date: baseDate(6),
      location: { type: "Point", coordinates: [-117.9920, 33.7520], address: "ABC Coffee House, Westminster, CA" },
      imageUrl: "https://source.unsplash.com/800x600/?technology,startup",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Westminster Language Exchange",
      description: "English–Vietnamese language exchange meetup.",
      host: user._id,
      date: baseDate(7),
      location: { type: "Point", coordinates: [-117.9955, 33.7509], address: "Café Bien, Westminster, CA" },
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Westminster Weekend Market",
      description: "Saturday morning market with food and crafts.",
      host: user._id,
      date: baseDate(8),
      location: { type: "Point", coordinates: [-117.9985, 33.7499], address: "Westminster Mall, Westminster, CA" },
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Westminster Movie Night",
      description: "Watch Vietnamese classics at a community center.",
      host: user._id,
      date: baseDate(9),
      location: { type: "Point", coordinates: [-117.9912, 33.7515], address: "Asian Garden Mall, Westminster, CA" },
      imageUrl: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Westminster Volunteer Day",
      description: "Help pack food boxes for local charities.",
      host: user._id,
      date: baseDate(10),
      location: { type: "Point", coordinates: [-117.9928, 33.7523], address: "Westminster Community Center, CA" },
      imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Westminster Open Mic Night",
      description: "Comedy, poetry, and acoustic music by local talent.",
      host: user._id,
      date: baseDate(11),
      location: { type: "Point", coordinates: [-117.9942, 33.7518], address: "Bolsa Chica Café, Westminster, CA" },
      imageUrl: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Westminster Cultural Parade",
      description: "Celebrate Vietnamese heritage with music and food.",
      host: user._id,
      date: baseDate(12),
      location: { type: "Point", coordinates: [-117.9937, 33.7507], address: "Little Saigon Parade Route, Westminster, CA" },
      imageUrl: "https://images.unsplash.com/photo-1533055640609-bc3c3c8c3022?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },

    // === 10 Events near San Francisco / Bay Area ===
    {
      title: "SF Bay Coding Meetup",
      description: "Developers networking event in downtown San Francisco.",
      host: user._id,
      date: baseDate(2),
      location: { type: "Point", coordinates: [-122.4194, 37.7749], address: "SoMa, San Francisco, CA" },
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Golden Gate Photography Walk",
      description: "Capture the beauty of the bridge at sunset.",
      host: user._id,
      date: baseDate(3),
      location: { type: "Point", coordinates: [-122.4783, 37.8199], address: "Golden Gate Bridge, San Francisco, CA" },
      imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Bay Area AI Conference",
      description: "Talks and demos from AI startups and researchers.",
      host: user._id,
      date: baseDate(4),
      location: { type: "Point", coordinates: [-122.2727, 37.8715], address: "UC Berkeley, Berkeley, CA" },
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "SF Food Truck Festival",
      description: "Try foods from 50+ vendors at this weekend festival.",
      host: user._id,
      date: baseDate(5),
      location: { type: "Point", coordinates: [-122.4064, 37.7858], address: "Civic Center Plaza, San Francisco, CA" },
      imageUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Bay Area Startup Mixer",
      description: "Meet founders, engineers, and designers from the local scene.",
      host: user._id,
      date: baseDate(6),
      location: { type: "Point", coordinates: [-122.4194, 37.776], address: "WeWork, Market St, San Francisco, CA" },
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "SF Morning Yoga at the Beach",
      description: "Relaxing morning yoga by the ocean.",
      host: user._id,
      date: baseDate(7),
      location: { type: "Point", coordinates: [-122.5090, 37.7599], address: "Ocean Beach, San Francisco, CA" },
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Bay Area Board Game Night",
      description: "Friendly competition and snacks all night long.",
      host: user._id,
      date: baseDate(8),
      location: { type: "Point", coordinates: [-122.2585, 37.8716], address: "Downtown Berkeley, CA" },
      imageUrl: "https://images.unsplash.com/photo-1610891839346-2b2935a3d1d3?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "SF Salsa Night",
      description: "Dance the night away with live salsa bands.",
      host: user._id,
      date: baseDate(9),
      location: { type: "Point", coordinates: [-122.4120, 37.7833], address: "Mission District, San Francisco, CA" },
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "Bay Area Hackathon",
      description: "48-hour hackathon for developers and designers.",
      host: user._id,
      date: baseDate(10),
      location: { type: "Point", coordinates: [-122.0838, 37.3861], address: "Googleplex, Mountain View, CA" },
      imageUrl: "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    {
      title: "SF Waterfront Picnic",
      description: "Relax by the bay with food, games, and friends.",
      host: user._id,
      date: baseDate(11),
      location: { type: "Point", coordinates: [-122.3930, 37.7955], address: "Embarcadero, San Francisco, CA" },
      imageUrl: "https://images.unsplash.com/photo-1602102316625-4b4d2c7e07b2?auto=format&fit=crop&w=800&q=80",
      status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
    },
    // === 5 Events near Diamond Bar ===
{
  title: "Diamond Bar Coffee Meetup",
  description: "Meet other locals for casual conversation and coffee.",
  host: user._id,
  date: baseDate(2),
  location: { type: "Point", coordinates: [-117.8103, 34.0286], address: "Diamond Bar Center, Diamond Bar, CA" },
  imageUrl: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},
{
  title: "Diamond Bar Hikers",
  description: "Morning hike at Summitridge Park Trail Loop.",
  host: user._id,
  date: baseDate(3),
  location: { type: "Point", coordinates: [-117.8125, 34.0242], address: "Summitridge Park Trail, Diamond Bar, CA" },
  imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},
{
  title: "Diamond Bar Game Night",
  description: "Board games, snacks, and fun competition!",
  host: user._id,
  date: baseDate(4),
  location: { type: "Point", coordinates: [-117.8108, 34.0291], address: "Diamond Bar Library, Diamond Bar, CA" },
  imageUrl: "https://images.unsplash.com/photo-1600959907703-125ba1374d6c?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},
{
  title: "Diamond Bar Park Yoga",
  description: "Join a free outdoor yoga session in Pantera Park.",
  host: user._id,
  date: baseDate(5),
  location: { type: "Point", coordinates: [-117.8203, 34.0225], address: "Pantera Park, Diamond Bar, CA" },
  imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},
{
  title: "Diamond Bar Coding Study Group",
  description: "Students and professionals meet to learn web development.",
  host: user._id,
  date: baseDate(6),
  location: { type: "Point", coordinates: [-117.8121, 34.0280], address: "Diamond Bar City Hall, Diamond Bar, CA" },
  imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},

// === 5 Events near Norwalk ===
{
  title: "Norwalk Community Picnic",
  description: "Join the neighborhood for games, food, and music!",
  host: user._id,
  date: baseDate(3),
  location: { type: "Point", coordinates: [-118.0830, 33.9069], address: "Norwalk Park, Norwalk, CA" },
  imageUrl: "https://images.unsplash.com/photo-1472653816316-3ad6f10a6592?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},
{
  title: "Norwalk Movie Night",
  description: "Outdoor movie screening for all ages.",
  host: user._id,
  date: baseDate(4),
  location: { type: "Point", coordinates: [-118.0802, 33.9054], address: "Civic Center Lawn, Norwalk, CA" },
  imageUrl: "https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},
{
  title: "Norwalk Art Workshop",
  description: "Paint, draw, and share creativity with locals.",
  host: user._id,
  date: baseDate(5),
  location: { type: "Point", coordinates: [-118.0811, 33.9060], address: "Cultural Arts Center, Norwalk, CA" },
  imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},
{
  title: "Norwalk Book Club",
  description: "Monthly book discussion and coffee meetup.",
  host: user._id,
  date: baseDate(6),
  location: { type: "Point", coordinates: [-118.0790, 33.9065], address: "Norwalk Public Library, Norwalk, CA" },
  imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},
{
  title: "Norwalk Fitness Challenge",
  description: "Friendly 5K fun run for beginners and athletes.",
  host: user._id,
  date: baseDate(7),
  location: { type: "Point", coordinates: [-118.0835, 33.9071], address: "Norwalk City Hall, Norwalk, CA" },
  imageUrl: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},

// === 5 Events near Long Beach ===
{
  title: "Long Beach Beach Cleanup",
  description: "Volunteer to help clean up the coastline.",
  host: user._id,
  date: baseDate(3),
  location: { type: "Point", coordinates: [-118.1937, 33.7701], address: "Long Beach Shoreline, CA" },
  imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},
{
  title: "Long Beach Food Truck Friday",
  description: "Taste a variety of cuisines from local food trucks.",
  host: user._id,
  date: baseDate(4),
  location: { type: "Point", coordinates: [-118.1870, 33.7708], address: "Downtown Long Beach, CA" },
  imageUrl: "https://images.unsplash.com/photo-1533777324565-a040eb52fac1?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},
{
  title: "Long Beach Jazz Fest",
  description: "Annual jazz festival featuring live performances.",
  host: user._id,
  date: baseDate(5),
  location: { type: "Point", coordinates: [-118.1829, 33.7683], address: "Marina Green Park, Long Beach, CA" },
  imageUrl: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},
{
  title: "Long Beach Coffee & Chat",
  description: "Morning meetup for creatives and entrepreneurs.",
  host: user._id,
  date: baseDate(6),
  location: { type: "Point", coordinates: [-118.1910, 33.7719], address: "Portfolio Coffeehouse, Long Beach, CA" },
  imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},
{
  title: "Long Beach Coding Meetup",
  description: "Developers and designers share their latest projects.",
  host: user._id,
  date: baseDate(7),
  location: { type: "Point", coordinates: [-118.1892, 33.7723], address: "Ironfire Coworking Space, Long Beach, CA" },
  imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
  status: "upcoming", isPublic: true, uuid: uuidv4(), createdAt: now, updatedAt: now,
},

  ];

  await Hangout.insertMany(hangouts);
  console.log(`🎉 Seeded ${hangouts.length} Pomona hangouts successfully!`);
  process.exit(0);
}

seedGeoHangouts().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
