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
      q,
      timeFilter = "upcoming",
      page = "1",
      limit = "12",
    } = req.query;

    const userLat = lat ? parseFloat(lat as string) : NaN;
    const userLng = lng ? parseFloat(lng as string) : NaN;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    let hangouts: HydratedDocument<any>[] = [];

    // Base DB filter
    const baseFilter: any = { status };

    // Time filter
    baseFilter.date =
      timeFilter === "past" ? { $lt: new Date() } : { $gte: new Date() };

    // Public/private filter
    baseFilter.isPublic = isPublic !== undefined ? isPublic === "true" : true;

    // City / category filters
    if (city) {
      baseFilter["location.address"] = {
        $regex: new RegExp(escapeRegex(city as string), "i"),
      };
    }
    if (category) baseFilter.category = category;

    // Tag filter
    const tagStr = Array.isArray(tag) ? tag[0] : tag;
    if (tagStr && typeof tagStr === "string" && tagStr.trim() !== "") {
      baseFilter.tags = { $in: [tagStr.trim()] };
    }

    // Text search - if q parameter exists
    if (q && typeof q === "string" && q.trim()) {
      const searchRegex = new RegExp(escapeRegex(q.trim()), "i");

      // Try to find events by text search first
      hangouts = await Hangout.find(baseFilter)
        .populate("host", "name profilePicture")
        .sort({ date: timeFilter === "past" ? -1 : 1 })
        .lean();

      // Filter by search query
      hangouts = hangouts.filter((h) => {
        return (
          searchRegex.test(h.title || "") ||
          searchRegex.test(h.description || "") ||
          searchRegex.test(h.overview || "") ||
          searchRegex.test(h.hostInfo || "") ||
          searchRegex.test(h.location?.address || "") ||
          (h.tags || []).some((t: string) => searchRegex.test(t)) ||
          (h.host &&
            typeof h.host === "object" &&
            searchRegex.test(h.host.name || ""))
        );
      });

      // If we have location coordinates, also include nearby events
      // This helps when searching for a city name like "san francisco"
      if (!isNaN(userLat) && !isNaN(userLng)) {
        try {
          const nearbyEvents = await Hangout.find({
            ...baseFilter,
            location: {
              $nearSphere: {
                $geometry: { type: "Point", coordinates: [userLng, userLat] },
                $maxDistance: 100000, // 100km radius
              },
            },
          })
            .populate("host", "name profilePicture")
            .sort({ date: 1 })
            .lean();

          // Merge text search results with nearby results (remove duplicates)
          const existingIds = new Set(
            hangouts.map((h: any) => h._id.toString())
          );
          const additionalEvents = nearbyEvents.filter(
            (e: any) => !existingIds.has(e._id.toString())
          );

          hangouts = [...hangouts, ...additionalEvents];
        } catch (geoError) {
          console.log("Geo search failed, using text results only:", geoError);
        }
      }

      return respond(hangouts, res, pageNum, limitNum);
    }

    // Geo search - when no text query but have coordinates
    const shouldApplyGeo =
      !q && !tag && !category && !city && !isNaN(userLat) && !isNaN(userLng);

    if (shouldApplyGeo) {
      try {
        hangouts = await Hangout.find({
          ...baseFilter,
          location: {
            $nearSphere: {
              $geometry: { type: "Point", coordinates: [userLng, userLat] },
              $maxDistance: 100000,
            },
          },
        })
          .populate("host", "name profilePicture")
          .sort({ date: 1 })
          .lean();
      } catch (geoError) {
        console.log("Geo search failed:", geoError);
      }

      // Pomona fallback only when geo was intended
      if (!hangouts || hangouts.length === 0) {
        const pomonaCoords = [-117.7513, 34.0553];
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
          .lean();
      }
    } else if (!q) {
      // No search query and no valid geo - just return filtered results
      hangouts = await Hangout.find(baseFilter)
        .populate("host", "name profilePicture")
        .sort({ date: timeFilter === "past" ? -1 : 1 })
        .lean();
    }

    return respond(hangouts, res, pageNum, limitNum);
  } catch (err: any) {
    console.error("❌ Error fetching hangouts:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch hangouts", message: err.message });
  }
}

// Helper to handle pagination + final formatting
async function respond(
  hangouts: any[],
  res: NextApiResponse,
  pageNum: number,
  limitNum: number
) {
  const ids = hangouts.map((h) => h._id);

  const rsvps = await RSVP.find({
    hangout: { $in: ids },
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
      _id: h._id.toString(),
      title: h.title,
      description: h.description || "",
      overview: h.overview || "",
      hostInfo: h.hostInfo || "",
      tags: h.tags || [],
      datetime: date.toISOString(),
      host: (h.host as any)?.name || "Anonymous",
      location: h.location?.address || "Unknown",
      coordinates: h.location?.coordinates
        ? { lat: h.location.coordinates[1], lng: h.location.coordinates[0] }
        : null,
      imageUrl: h.imageUrl,
      status: h.status || "Upcoming",
      price: "Free",
      attendees,
    };
  });

  const totalCount = events.length;
  const totalPages = Math.ceil(totalCount / limitNum);
  const skip = (pageNum - 1) * limitNum;
  const paginated = events.slice(skip, skip + limitNum);

  return res.status(200).json({
    success: true,
    events: paginated,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalCount,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  });
}
