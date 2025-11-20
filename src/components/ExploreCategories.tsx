"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export default function ExploreCategories() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = [
    { name: "Networking", icon: "/icons/networking.png", slug: "networking" },
    { name: "Tech", icon: "/icons/tech.png", slug: "tech" },
    { name: "Social", icon: "/icons/social.png", slug: "social" },
    { name: "Food & Drink", icon: "/icons/food-drink.png", slug: "food-drink" },
    {
      name: "Hobbies & Passion",
      icon: "/icons/hobbies-passion.png",
      slug: "hobbies-passion",
    },
    {
      name: "Travel & Outdoor",
      icon: "/icons/travel-outdoor.png",
      slug: "travel-outdoor",
    },
  ];

  const scrollLeft = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: -250, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: 250, behavior: "smooth" });
  };

  return (
    <section className="max-w-7xl mx-auto text-white">
      {/* Title + Buttons */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-black">
          Explore top categories
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="bg-gray-200 text-black px-3 py-2 rounded-full hover:bg-gray-300"
          >
            ←
          </button>

          <button
            onClick={scrollRight}
            className="bg-gray-200 text-black px-3 py-2 rounded-full hover:bg-gray-300"
          >
            →
          </button>
        </div>
      </div>

      {/* Scrollable area */}
      <div className="overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-2 "
        >
          {categories.map((tag) => (
            <Link
              key={tag.name}
              href={`/events?tag=${encodeURIComponent(tag.slug)}`}
              className="w-[280px] shrink-0 flex flex-col items-center justify-center 
                         rounded-xl p-10 shadow-lg shadow-[#5D5FEF] 
                         hover:shadow-[#5D5FEF]/70 hover:scale-105 transition
                         bg-purple-900 text-white"
            >
              <div className="relative w-12 h-12 mb-3">
                <Image
                  src={tag.icon}
                  alt={tag.name}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="font-medium text-center">{tag.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
