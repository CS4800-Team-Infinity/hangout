import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import Hangout from '../src/models/Hangout'; 

const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!key) {
    console.error('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY');
    return null;
  }

  try {
    const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address, key },
    });
    const result = res.data.results?.[0];
    if (result) {
      const { lat, lng } = result.geometry.location;
      return { lat, lng };
    }
    return null;
  } catch (err) {
    console.error('Geocoding failed for:', address, err);
    return null;
  }
}

async function updateEvents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const events = await Hangout.find({ coordinates: { $exists: false } });
    console.log(`Found ${events.length} events without coordinates`);

    for (const event of events) {
      if (typeof event.location === 'string') {
        const coords = await geocodeAddress(event.location);
        if (coords) {
          event.coordinates = coords;
          event.geo = { type: 'Point', coordinates: [coords.lng, coords.lat] };
          await event.save();
          console.log(`✅ Updated ${event.title}`);
        } else {
          console.warn(`⚠️ Could not geocode: ${event.location}`);
        }
      }
    }

    console.log('✅ All done.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating events:', err);
    process.exit(1);
  }
}

updateEvents();
