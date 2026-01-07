import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import PortfolioModal from "@/components/portfolio/PortfolioModal";
import CategoryFilter from "@/components/portfolio/CategoryFilter";
import { Loader2 } from "lucide-react";

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  // Check for category in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get("category");
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, []);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["portfolio-items"],
    queryFn: () => base44.entities.PortfolioItem.filter({ visible: true }, "display_order"),
  });

  const filteredItems = activeCategory === "all"
    ? items
    : items.filter((item) => item.category === activeCategory);

  return (
    <div className="pt-32 pb-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
            Our Work
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[#2D2D2D] mb-6">
            Portfolio
          </h1>
          <p className="text-[#6B6B6B] max-w-2xl mx-auto">
            Every piece tells a story. Browse our collection of custom laser-cut and engraved creations,
            from wedding signage to personalized gifts.
          </p>
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <CategoryFilter
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#C4A962]" />
          </div>
        ) : (
          <PortfolioGrid items={filteredItems} onItemClick={setSelectedItem} />
        )}

        {/* Modal */}
        <PortfolioModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      </div>
    </div>
  );
}