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
      <div className="mb-8 mt-16">
        <div className="flex items-center gap-2 mb-4 py-12">
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
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-purple-500" />
        <h2 className="text-2xl font-bold text-gray-900">Trending searches</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {searches.map((search: any, index) => (
          <a
            key={search.id}
            href={`/search?q=${encodeURIComponent(search.keyword)}`}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors"
          >
            <span className="text-purple-600 font-bold">{index + 1}.</span>
            <span className="text-gray-900 font-medium">{search.keyword}</span>
            <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full"></div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default TrendingSearches;
