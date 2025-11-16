import Image from "next/image";
import Link from "next/link";

export default function PopularCities() {
  const cities = [
    { city: "Los Angeles", img: "/images/losangeles.jpg" },
    { city: "San Francisco", img: "/images/sanfrancisco.jpg" },
    { city: "Chicago", img: "/images/chicago.jpg" },
    { city: "New York", img: "/images/newyork.jpg" },
    // Add more cities as needed
  ];

  return (
    <section className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">
        Popular cities in United States
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {cities.map((city) => (
          <Link
            key={city.city}
            href={`/events?city=${encodeURIComponent(city.city)}`}
            className="group rounded-xl overflow-hidden shadow-md hover:shadow-[#5D5FEF]/50 hover:scale-105 transition-transform duration-300"
          >
            <div className="relative w-full h-40">
              <Image
                src={city.img}
                alt={city.city}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
                className="object-cover group-hover:opacity-90 transition-opacity"
                priority
              />
            </div>
            <p className="text-center py-2 font-medium bg-white text-gray-900 dark:bg-[#3a0024] dark:text-white">
              {city.city}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
