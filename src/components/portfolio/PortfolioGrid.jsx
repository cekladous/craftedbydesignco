import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryLabels = {
  wedding: "Wedding",
  baby: "Baby & Milestones",
  corporate: "Corporate",
  home: "Home Décor",
  gifts: "Personalized Gifts",
  specialty: "Specialty Items",
};

export default function PortfolioGrid({ items, onItemClick }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[#6B6B6B]">No items to display</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group cursor-pointer"
          onClick={() => onItemClick?.(item)}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#E8E6E3]">
            {item.images?.[0] ? (
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[#6B6B6B]/50 font-serif text-xl">No Image</span>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Quick Actions */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
              {item.cta_type === "etsy" && item.etsy_url ? (
                <a
                  href={item.etsy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-[#2D2D2D] py-3 text-xs tracking-widest uppercase font-medium hover:bg-[#C4A962] hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Etsy
                </a>
              ) : (
                <Link
                  to={createPageUrl("Contact") + `?product=${encodeURIComponent(item.name)}&category=${item.category}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-[#2D2D2D] py-3 text-xs tracking-widest uppercase font-medium hover:bg-[#C4A962] hover:text-white transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Request Quote
                </Link>
              )}
            </div>
          </div>
          
          <div className="mt-4 space-y-1">
            <p className="text-[10px] tracking-widest uppercase text-[#C4A962]">
              {categoryLabels[item.category] || item.category}
            </p>
            <h3 className="font-serif text-xl text-[#2D2D2D] group-hover:text-[#C4A962] transition-colors">
              {item.name}
            </h3>
            {item.materials?.length > 0 && (
              <p className="text-xs text-[#6B6B6B]">
                {item.materials.join(" · ")}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}