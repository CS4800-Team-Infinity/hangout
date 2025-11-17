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
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    await connectDB();

    const { limit = "10" } = req.query;
    const limitNum = parseInt(limit as string);

    // Fetch top trending search keywords
    // Searches from the last 30 days for relevance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingSearches = await SearchKeyword.find({
      lastSearched: { $gte: thirtyDaysAgo },
    })
      .sort({ count: -1 })
      .limit(limitNum)
      .select("keyword count")
      .lean();

    const searches = trendingSearches.map((search: any) => ({
      id: search._id.toString(),
      keyword: search.keyword,
      count: search.count,
    }));

    res.status(200).json({
      success: true,
      searches,
    });
  } catch (error: any) {
    console.error("Trending searches error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
