import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";
import PortfolioGrid from "../portfolio/PortfolioGrid";

export default function FeaturedWork({ items, onItemClick }) {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
            Portfolio
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[#2D2D2D] mb-4">
            Featured Work
          </h2>
          <p className="text-[#6B6B6B] max-w-xl mx-auto">
            A curated collection of our most beloved pieces—each one designed and crafted with care.
          </p>
        </motion.div>

        <PortfolioGrid items={items} onItemClick={onItemClick} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <Link
            to={createPageUrl("Portfolio")}
            className="group inline-flex items-center gap-3 text-[#2D2D2D] text-xs tracking-widest uppercase font-medium hover:text-[#C4A962] transition-colors"
          >
            View All Work
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}