"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";

const TrendingSearches = () => {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingSearches = async () => {
      try {
        const res = await fetch("/api/search/trending?limit=10");
        const data = await res.json();
        setSearches(data.searches || []);
      } catch (err) {
        console.error("Error fetching trending searches:", err);
        setSearches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingSearches();
  }, []);

  if (loading) {
    return (
      <div className="mb-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-500 mt-12" />
          <h2 className="text-2xl font-bold text-gray-900 mt-12">
            Trending searches
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg h-16 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (searches.length === 0) return null;

  return (
    <div className="mb-20">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-purple-500" />
        <h2 className="text-2xl font-bold text-gray-900">Trending searches</h2>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-0">
        {searches.map((search: any, index) => (
          <a
            key={search.id}
            href={`/search?q=${encodeURIComponent(search.keyword)}`}
            className="relative flex items-center gap-2 py-3 hover:bg-gray-50 transition-colors group"
          >
            <span className="text-gray-900 font-bold group-hover:text-[#5D5FEF] transition-colors">
              {index + 1}.
            </span>
            <span className="text-gray-900 font-medium flex-1 capitalize group-hover:text-[#5D5FEF] transition-colors">
              {search.keyword}
            </span>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] group-hover:scale-110 group-hover:shadow-[0_2px_8px_rgba(93,95,239,0.4)] transition-transform"></div>
            <div className="absolute bottom-0 left-0 right-4 h-[2px] bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] group-hover:h-[3px] group-hover:shadow-[0_2px_8px_rgba(93,95,239,0.4)] transition-all"></div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default TrendingSearches;
