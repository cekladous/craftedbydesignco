import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CallToAction() {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center"
      >
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
          Let's Create Together
        </p>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#2D2D2D] mb-6">
          Have a Project in Mind?
        </h2>
        <p className="text-[#6B6B6B] text-lg max-w-2xl mx-auto mb-10">
          Whether it's a wedding sign, a personalized gift, or corporate branding—we'd love to bring your vision to life.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={createPageUrl("Contact")}
            className="bg-[#2D2D2D] text-white px-10 py-4 text-xs tracking-widest uppercase font-medium hover:bg-[#C4A962] transition-colors"
          >
            Request a Quote
          </Link>
          <a
            href="https://craftedxdesignco.etsy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#2D2D2D] text-[#2D2D2D] px-10 py-4 text-xs tracking-widest uppercase font-medium hover:bg-[#2D2D2D] hover:text-white transition-colors"
          >
            Shop Ready-Made
          </a>
        </div>
      </motion.div>
    </section>
  );
}