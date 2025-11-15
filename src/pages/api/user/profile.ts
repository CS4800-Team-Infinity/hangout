import connectDB from "@/lib/connect";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

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

    if (req.method === "GET") {
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    }

    if (req.method === "PUT") {
      const { name, username, email, bio } = req.body;

      if (!name || !username || !email) {
        return res.status(400).json({
          success: false,
          error: "Name, username, and email are required",
        });
      }

      const existingUser = await User.findOne({
        $and: [{ _id: { $ne: userId } }, { $or: [{ username }, { email }] }],
      });

      if (existingUser) {
        if (existingUser.username === username) {
          return res.status(400).json({
            success: false,
            error: "Username already exists",
          });
        }
        if (existingUser.email === email) {
          return res.status(400).json({
            success: false,
            error: "Email already exists",
          });
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, username, email, bio, lastActive: new Date() },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    }

    // Default
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (error: any) {
    console.error("Profile update error:", error);

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

    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}
