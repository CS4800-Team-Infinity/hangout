import Image from "next/image";
import Link from "next/link";

export default function PopularCities() {
  const cities = [
    { city: "Los Angeles", img: "/images/losangeles.jpg" },
    { city: "San Francisco", img: "/images/sanfrancisco.jpg" },
    { city: "Chicago", img: "/images/chicago.jpg" },
    { city: "New York", img: "/images/newyork.jpg" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold mb-6">
        Popular cities in United States
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-white">
        {cities.map((city) => (
          <Link
            key={city.city}
            href={`/events?city=${encodeURIComponent(city.city)}`}
            className="rounded-xl overflow-hidden shadow-md hover:shadow-[#5D5FEF]/50 hover:scale-105 transition duration-300"
          >
            <div className="relative w-full h-40">
              <Image
                src={city.img}
                alt={city.city}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-center py-2 font-medium bg-white text-black dark:bg-[#3a0024] dark:text-white">
              {city.city}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
