import connect from "@/lib/connect";
import Hangout from "@/models/Hangout";
import RSVP from "@/models/RSVP";
import { HydratedDocument } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connect();

    const {
      lat,
      lng,
      status = "upcoming",
      isPublic,
      city,
      category,
      tag,
      q, // Search query for event title
      timeFilter = "upcoming", // "upcoming" or "past"
      page = "1",
      limit = "12",
    } = req.query;

    // Safely parse floats only if values exist
    const userLat = lat ? parseFloat(lat as string) : NaN;
    const userLng = lng ? parseFloat(lng as string) : NaN;

    // Parse pagination parameters
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    console.log("📍 Searching near:", userLat, userLng);
    console.log("🔍 Search query:", q);
    console.log("⏱️ Time filter:", timeFilter);
    console.log("📄 Pagination:", { page: pageNum, limit: limitNum });
    console.log("Type check:", typeof userLat, typeof userLng);

    let hangouts: HydratedDocument<any>[] = [];

    const baseFilter: any = { status };

    // Filter by timeFilter: upcoming (today onwards) or past (before today)
    if (timeFilter === "past") {
      baseFilter.date = { $lt: new Date() };
    } else {
      // Default to upcoming events - show events from today onwards
      baseFilter.date = { $gte: new Date() };
    }

    // Default to showing only public events unless explicitly requesting all
    if (isPublic !== undefined) {
      baseFilter.isPublic = isPublic === "true";
    } else {
      // Default behavior: only show public events
      baseFilter.isPublic = true;
    }

    // City filter
    if (city)
      baseFilter["location.address"] = {
        $regex: new RegExp(escapeRegex(city as string), "i"),
      };
    if (category) baseFilter.category = category;

    // Add tag filter
    if (tag) {
      baseFilter.tags = { $in: [tag] };
    }

    // Determine search radius based on whether we have a specific event search
    const hasEventSearch = q && typeof q === "string" && q.trim();
    const searchRadius = hasEventSearch ? 500000 : 100000; // 500km for event search, 100km otherwise

    console.log("🔍 Search params:", {
      q,
      hasEventSearch,
      searchRadius,
      baseFilter,
    });

    // Only run geo query if lat/lng are valid numbers
    if (!isNaN(userLat) && !isNaN(userLng)) {
      try {
        hangouts = await Hangout.find({
          ...baseFilter,
          location: {
            $nearSphere: {
              $geometry: { type: "Point", coordinates: [userLng, userLat] },
              $maxDistance: searchRadius,
            },
          },
        })
          .populate("host", "name profilePicture")
          .sort({ date: timeFilter === "past" ? -1 : 1 }) // Descending for past, ascending for upcoming
          .limit(0) // Fetch all results, paginate in-memory
          .lean();

        console.log(
          "✅ Found",
          hangouts.length,
          "events near user before title filter"
        );

        // Filter by title after geo query if search query provided
        if (hasEventSearch) {
          const searchRegex = new RegExp(escapeRegex(q.trim()), "i");
          hangouts = hangouts.filter((h) => searchRegex.test(h.title));
          console.log(
            "✅ After title filter:",
            hangouts.length,
            "events matching:",
            q
          );
        }

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
              $maxDistance: 1000000, // 1000km fallback
            },
          },
        })
          .populate("host", "name profilePicture")
          .sort({ date: timeFilter === "past" ? -1 : 1 }) // Descending for past, ascending for upcoming
          .limit(0) // Fetch all results, paginate in-memory
          .lean();

        console.log(
          `🧭 Fallback: Found ${hangouts.length} Pomona events before title filter`
        );

        // Filter by title after geo query if search query provided
        if (hasEventSearch) {
          const searchRegex = new RegExp(escapeRegex(q.trim()), "i");
          hangouts = hangouts.filter((h) => searchRegex.test(h.title));
          console.log(
            "🧭 Fallback after title filter:",
            hangouts.length,
            "events matching:",
            q
          );
        }
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

    const allEvents = hangouts.map((h) => {
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
        _id: h._id.toString(),
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

    // In-memory pagination
    const totalCount = allEvents.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const skip = (pageNum - 1) * limitNum;
    const paginatedEvents = allEvents.slice(skip, skip + limitNum);

    console.log(`📄 Returning page ${pageNum} of ${totalPages} (${paginatedEvents.length} events)`);

    return res.status(200).json({
      success: true,
      events: paginatedEvents,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err: any) {
    console.error("❌ Error fetching hangouts:", err);
    return res.status(500).json({
      error: "Failed to fetch hangouts",
      message: err.message,
    });
  }
}
