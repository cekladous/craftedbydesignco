import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings-home"],
    queryFn: async () => {
      const results = await base44.entities.SiteSettings.filter({ setting_key: "home_hero" });
      return results[0] || null;
    },
  });

  const heroImage = settings?.hero_image;
  const tagline = settings?.hero_tagline || "Custom Laser-Cut & Engraved Designs";
  const headline = settings?.hero_headline || "Crafted with\nIntention";
  const subheadline = settings?.hero_subheadline || "Handcrafted pieces for weddings, milestones, corporate events and moments worth celebrating. Made in New Jersey with precision and care.";

  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {heroImage ? (
          <>
            <img
              src={heroImage}
              alt="Laser engraved crafts"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D2D2D] via-[#3D3D3D] to-[#2D2D2D]" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-6"
        >
          {tagline}
        </motion.p>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-light leading-[1.1] mb-8"
        >
          {headline.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light"
        >
          {subheadline}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to={createPageUrl("Portfolio")}
            className="group flex items-center gap-3 bg-white text-[#2D2D2D] px-8 py-4 text-xs tracking-widest uppercase font-medium hover:bg-[#C4A962] hover:text-white transition-all duration-300"
          >
            View Portfolio
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to={createPageUrl("Contact")}
            className="flex items-center gap-3 border border-white text-white px-8 py-4 text-xs tracking-widest uppercase font-medium hover:bg-white hover:text-[#2D2D2D] transition-all duration-300"
          >
            Start Your Project
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border border-white/40 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}