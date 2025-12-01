import connectDB from "@/lib/connect";
import Hangout from "@/models/Hangout";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

interface CreateEventRequest {
  title: string;
  description: string;
  overview?: string;
  lineup?: string;
  hostInfo?: string;
  tags?: string[];
  date: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  maxParticipants?: number;
  isPublic?: boolean;
  imageUrl?: string;
  price?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  if (req.method === "POST") {
    return handleCreateEvent(req, res);
  } else if (req.method === "GET") {
    return handleGetEvents(req, res);
  } else {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }
}

async function handleCreateEvent(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const {
      title,
      description,
      overview = "",
      lineup = "",
      hostInfo = "",
      tags = [],
      date,
      location,
      maxParticipants,
      isPublic = true,
      imageUrl,
      price = 0,
    }: CreateEventRequest = req.body;

    if (!title || !description || !date || !location) {
      return res.status(400).json({
        success: false,
        error: "Title, description, date, and location are required",
      });
    }

    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        error: "Event date must be in the future",
      });
    }

    if (
      !location.address ||
      !location.coordinates ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        error: "Location must include address and valid coordinates [lng, lat]",
      });
    }

    const [lng, lat] = location.coordinates;
    if (
      typeof lng !== "number" ||
      typeof lat !== "number" ||
      isNaN(lng) ||
      isNaN(lat)
    ) {
      return res.status(400).json({
        success: false,
        error: "Coordinates must be valid numbers",
      });
    }

    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        error: "Invalid coordinate values",
      });
    }

    if (maxParticipants !== undefined && maxParticipants < 1) {
      return res.status(400).json({
        success: false,
        error: "Maximum participants must be at least 1",
      });
    }

    const newHangout = new Hangout({
      title: title.trim(),
      description: description.trim(),
      overview: overview.trim(),
      lineup: lineup.trim(),
      hostInfo: hostInfo.trim(),
      tags: Array.isArray(tags) ? tags : [],
      host: userId,
      date: eventDate,
      location: {
        type: "Point",
        coordinates: [lng, lat],
        address: location.address.trim(),
      },
      maxParticipants,
      isPublic,
      imageUrl,
      price,
      status: "upcoming",
    });

    const savedHangout = await newHangout.save();

    await savedHangout.populate("host", "name username email bio");

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: savedHangout,
    });
  } catch (error: any) {
    console.error("Event creation error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0] as any;
      return res.status(400).json({
        success: false,
        error: firstError?.message || "Validation error",
      });
    }

    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function handleGetEvents(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = "1",
      limit = "10",
      status = "upcoming",
      isPublic,
      userId,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (isPublic !== undefined) {
      query.isPublic = isPublic === "true";
    }

    if (userId) {
      query.host = userId;
    } else {
      query.isPublic = true;
    }

    const [events, totalCount] = await Promise.all([
      Hangout.find(query)
        .populate("host", "name username email")
        .sort({ date: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Hangout.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      events,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error: any) {
    console.error("Get events error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
