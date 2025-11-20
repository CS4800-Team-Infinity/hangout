"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const heroSlides = [
  {
    id: 1,
    title: "Enjoy Offer",
    subtitle: "Limited-time",
    link: "/events/enjoy-offer",
    image: "images/hero-ads.png",
  },
  {
    id: 2,
    title: "Featured Events",
    subtitle: "Handpicked experiences just for you",
    link: "/events/featured",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Trending This Week",
    subtitle: "Discover the hottest events everyone's talking about",
    link: "/events/weekend",
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=400&fit=crop",
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);

  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );

  return (
    <div className="relative w-full h-80 md:h-100 overflow-hidden rounded-lg mb-8">
      {heroSlides.map((slide, index) => (
        <a
          key={slide.id}
          href={slide.link}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="w-full h-full bg-cover bg-center relative"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-linear-to-r from-black/70 to-black/30 flex items-end md:items-center pb-8 md:pb-0">
              <div className="px-8 md:px-16 text-white">
                <h1 className="text-3xl md:text-5xl font-bold mb-2">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl opacity-90">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </div>
        </a>
      ))}

      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
