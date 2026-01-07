import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const specialties = [
  {
    title: "Wedding Signage",
    description: "Welcome signs, seating charts, table numbers, and more to make your day unforgettable.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    category: "wedding",
  },
  {
    title: "Baby & Milestones",
    description: "Birth announcements, nursery signs, and keepsakes to celebrate life's precious moments.",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
    category: "baby",
  },
  {
    title: "Personalized Gifts",
    description: "Charcuterie boards, cutting boards, and custom pieces that become treasured keepsakes.",
    image: "https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=800&q=80",
    category: "gifts",
  },
  {
    title: "Corporate & Branded",
    description: "Engraved merchandise, logo items, and bulk gifting solutions for businesses.",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&q=80",
    category: "corporate",
  },
];

export default function Specialties() {
  return (
    <section className="py-24 lg:py-32 bg-[#2D2D2D]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
            What We Create
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-white">
            Our Specialties
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {specialties.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                to={createPageUrl("Portfolio") + `?category=${item.category}`}
                className="group block relative aspect-[16/10] overflow-hidden rounded-sm"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <h3 className="font-serif text-2xl lg:text-3xl text-white mb-2 group-hover:text-[#C4A962] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {item.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}