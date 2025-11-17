import mongoose from "mongoose";

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

export default mongoose.models.SearchKeyword ||
  mongoose.model("SearchKeyword", SearchKeywordSchema);
