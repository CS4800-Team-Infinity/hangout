import connectDB from "@/lib/connect";
import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";

const SearchKeywordSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    lastSearched: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const SearchKeyword =
  mongoose.models.SearchKeyword ||
  mongoose.model("SearchKeyword", SearchKeywordSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    await connectDB();

    const { keyword } = req.body;

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        error: "Keyword is required",
      });
    }

    const normalize = (str: string) =>
      str
        .normalize("NFKC") // normalize unicode
        .trim() // remove spaces
        .replace(/\s+/g, " ") // collapse multiple spaces
        .toLowerCase(); // lowercase

    const normalizedKeyword = normalize(keyword);

    if (normalizedKeyword.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Keyword cannot be empty",
      });
    }

    // Update or create the search keyword
    const searchKeyword = await SearchKeyword.findOneAndUpdate(
      { keyword: normalizedKeyword },
      {
        $inc: { count: 1 },
        $set: { lastSearched: new Date() },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Search tracked successfully",
      data: {
        keyword: searchKeyword.keyword,
        count: searchKeyword.count,
      },
    });
  } catch (error: any) {
    console.error("Track search error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
