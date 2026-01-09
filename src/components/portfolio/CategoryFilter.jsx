import React from "react";
import { motion } from "framer-motion";

const categories = [
  { key: "all", label: "All Work" },
  { key: "wedding", label: "Wedding" },
  { key: "baby", label: "Baby & Milestones" },
  { key: "corporate", label: "Corporate" },
  { key: "home", label: "Home Décor" },
  { key: "gifts", label: "Gifts" },
];

export default function CategoryFilter({ activeCategory, onChange }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 lg:gap-4">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={`relative px-4 py-2 text-xs tracking-widest uppercase transition-colors ${
            activeCategory === cat.key
              ? "text-[#2D2D2D]"
              : "text-[#6B6B6B] hover:text-[#2D2D2D]"
          }`}
        >
          {cat.label}
          {activeCategory === cat.key && (
            <motion.div
              layoutId="activeCategory"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C4A962]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}