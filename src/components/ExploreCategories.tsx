import Image from "next/image";
import Link from "next/link";

export default function ExploreCategories() {
  const categories = [
    {
      name: "Travel & Outdoor",
      icon: "/icons/travel-outdoor.png",
      slug: "travel-outdoor",
    },
    {
      name: "Social & Activities",
      icon: "/icons/social-activities.png",
      slug: "social-activities",
    },
    {
      name: "Hobbies & Passion",
      icon: "/icons/hobbies-passion.png",
      slug: "hobbies-passion",
    },
    {
      name: "Food & Drink",
      icon: "/icons/food-drink.png",
      slug: "food-drink",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-12 py-10 text-white">
      <h2 className="text-2xl font-semibold mb-6 text-black">
        Explore top categories
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={`/events?category=${cat.slug}`}
            className="group flex flex-col items-center justify-center border rounded-xl p-6 shadow-lg shadow-[#5D5FEF]/100 hover:shadow-[#5D5FEF]/70 hover:scale-105 transition bg-white dark:bg-[#3a0024]"
          >
            <div className="relative w-12 h-12 mb-3">
              <Image
                src={cat.icon}
                alt={cat.name}
                fill
                className="object-contain group-hover:scale-110 transition"
              />
            </div>
            <p className="font-medium text-gray-800 dark:text-white text-center">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
