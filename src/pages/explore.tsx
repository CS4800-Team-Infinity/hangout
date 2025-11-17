"use client";

import HeroCarousel from "@/components/Explore/HeroCarousel";
import HotToday from "@/components/Explore/HotToday";
import HotArea from "@/components/Explore/HotArea";
import TrendingSearches from "@/components/Explore/TrendingSearches";

import NearbyEventsSection from "@/components/NearbyEventsSection";
import ExploreCategories from "@/components/ExploreCategories";

const ExplorePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="pt-12">
          <HeroCarousel />
        </section>

        <section className="pt-12">
          <NearbyEventsSection />
        </section>

        <section className="pt-20">
          <HotToday />
        </section>

        <section className="pt-20">
          <HotArea />
        </section>

        <section className="pt-12">
          <ExploreCategories />
        </section>

        <section className="pt-20">
          <TrendingSearches />
        </section>
      </div>
    </div>
  );
};

export default ExplorePage;
