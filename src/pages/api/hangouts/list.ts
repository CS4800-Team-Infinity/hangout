import type { NextApiRequest, NextApiResponse } from "next";
import { HydratedDocument } from "mongoose";
import connect from "@/lib/connect";
import Hangout from "@/models/Hangout";
import RSVP from "@/models/RSVP";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connect();

    const { lat, lng, status = "upcoming", isPublic } = req.query;

    // Safely parse floats only if values exist
    const userLat = lat ? parseFloat(lat as string) : NaN;
    const userLng = lng ? parseFloat(lng as string) : NaN;

    console.log("📍 Searching near:", userLat, userLng);
    console.log("Type check:", typeof userLat, typeof userLng);

    let hangouts: HydratedDocument<any>[] = [];

    const baseFilter: any = { status };
    if (isPublic !== undefined) {
      baseFilter.isPublic = isPublic === "true";
    }

    // Only run geo query if lat/lng are valid numbers
    if (!isNaN(userLat) && !isNaN(userLng)) {
      try {
        hangouts = await Hangout.find({
          ...baseFilter,
          location: {
            $nearSphere: {
              $geometry: { type: "Point", coordinates: [userLng, userLat] },
              $maxDistance: 100000, // 100 km
            },
          },
        })
          .populate("host", "name profilePicture")
          .sort({ date: 1 })
          .limit(50)
          .lean();

        console.log("✅ Found", hangouts.length, "events near user");
        console.log(
          "Fetched coordinates:",
          hangouts.map((h) => h.location.coordinates)
        );
      } catch (err: any) {
        console.warn("⚠️ Geo query failed:", err.message);
      }
    } else {
      console.warn("⚠️ Invalid or missing lat/lng, skipping geo query");
    }

    // Fallback if nothing found or invalid coords
    if (!hangouts || hangouts.length === 0) {
      const pomonaCoords = [-117.7513, 34.0553];
      try {
        hangouts = await Hangout.find({
          ...baseFilter,
          location: {
            $nearSphere: {
              $geometry: { type: "Point", coordinates: pomonaCoords },
              $maxDistance: 1000000,
            },
          },
        })
          .populate("host", "name profilePicture")
          .sort({ date: 1 })
          .limit(20)
          .lean();

        console.log(`🧭 Fallback: Found ${hangouts.length} Pomona events`);
      } catch (err: any) {
        console.warn("⚠️ Geo query for Pomona fallback failed:", err.message);
      }
    }

    console.log(
      "Fetched coordinates:",
      hangouts.map((h) => h.location.coordinates)
    );

    const hangoutIds = hangouts.map((h) => h._id);
    const rsvps = await RSVP.find({
      hangout: { $in: hangoutIds },
      status: "accepted",
    })
      .populate("user", "name profilePicture")
      .lean();

    const events = hangouts.map((h) => {
      const date = new Date(h.date);
      const attendees = rsvps
        .filter((r) => r.hangout.toString() === h._id.toString())
        .map((r) => ({
          id: (r.user as any)._id.toString(),
          name: (r.user as any).name,
          avatarUrl:
            (r.user as any).profilePicture ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              (r.user as any).name
            )}&background=random`,
        }));

      return {
        id: h._id.toString(),
        title: h.title,
        datetime: date.toISOString(),
        host: (h.host as any)?.name || "Anonymous",
        location: h.location?.address || "Unknown",
        coordinates: h.location?.coordinates
          ? { lat: h.location.coordinates[1], lng: h.location.coordinates[0] }
          : null,
        imageUrl:
          h.imageUrl ||
          `https://source.unsplash.com/800x600/?event,${encodeURIComponent(
            h.title
          )}`,
        status: h.status || "Upcoming",
        price: "Free",
        attendees,
      };
    });

    return res.status(200).json({ success: true, events });
  } catch (err: any) {
    console.error("❌ Error fetching hangouts:", err);
    return res.status(500).json({
      error: "Failed to fetch hangouts",
      message: err.message,
    });
  }
}
