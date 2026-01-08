import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Heart, Award, ArrowRight, Instagram, Facebook } from "lucide-react";

function ExperienceSection() {
  const { data: section } = useQuery({
    queryKey: ["experience-section"],
    queryFn: async () => {
      const results = await base44.entities.ExperienceSection.filter({ setting_key: "main" });
      return results[0] || null;
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: ["experience-items"],
    queryFn: async () => {
      const results = await base44.entities.ExperienceItem.filter({ visible: true });
      return results.sort((a, b) => a.display_order - b.display_order);
    },
  });

  const defaultItems = [
    "Brides & wedding planners seeking unique signage",
    "New parents celebrating life's milestones",
    "Businesses looking for branded merchandise",
    "Gift-givers searching for something personal",
    "Event planners creating memorable experiences"
  ];

  const displayItems = items.length > 0 ? items : defaultItems.map(text => ({ text }));

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      {/* Image Gallery */}
      {section?.images && section.images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {section.images.slice(0, 4).map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="aspect-square rounded-sm overflow-hidden"
            >
              <img
                src={img}
                alt={`Experience ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Text Content */}
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
          {section?.title || "Experience"}
        </p>
        <h2 className="font-serif text-4xl text-[#2D2D2D] mb-4">
          {section?.subtitle || "Who We Serve"}
        </h2>
        <p className="text-[#6B6B6B] mb-8 leading-relaxed">
          {section?.description || "From intimate weddings to large corporate events, we've had the privilege of creating pieces for a wide range of clients and occasions."}
        </p>
        <ul className="space-y-4 mb-8">
          {displayItems.map((item, index) => (
            <li key={item.id || index} className="flex items-start gap-3 text-[#6B6B6B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4A962] mt-2 flex-shrink-0" />
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function About() {
  const { data: settings } = useQuery({
    queryKey: ["site-settings-home"],
    queryFn: async () => {
      const results = await base44.entities.SiteSettings.filter({ setting_key: "home_hero" });
      return results[0] || {};
    },
  });

  const aboutImage = settings?.about_image || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80";

  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="px-6 lg:px-12 mb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
                Our Story
              </p>
              <h1 className="font-serif text-5xl md:text-6xl text-[#2D2D2D] mb-6">
                About the Studio
              </h1>
              <p className="text-[#6B6B6B] text-lg leading-relaxed mb-6">
                Crafted By Design Co. is a creative studio dedicated to producing 
                beautiful, personalized laser-cut and engraved pieces. What started 
                as a passion project has grown into a full-fledged business, 
                serving couples, families, and businesses across the country.
              </p>
              <p className="text-[#6B6B6B] leading-relaxed mb-8">
                Every piece we create is made with intention—designed to celebrate 
                your milestones, elevate your spaces, and become treasured keepsakes 
                for years to come. We believe in the power of personalization and 
                the beauty of handcrafted goods.
              </p>
              <div className="flex items-center gap-6">
                <a
                  href="https://www.instagram.com/craftedbydesignco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#2D2D2D] hover:text-[#C4A962] transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                  <span className="text-sm">Follow on Instagram</span>
                </a>
                <a
                  href="https://www.facebook.com/CraftedbyDesignCo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#2D2D2D] hover:text-[#C4A962] transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="text-sm">Follow on Facebook</span>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-sm overflow-hidden bg-[#E8E6E3]">
                <img
                  src={aboutImage}
                  alt="Crafting in the studio"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#C4A962] rounded-sm flex items-center justify-center">
                <div className="text-center text-white">
                  <span className="font-serif text-3xl block">Est.</span>
                  <span className="text-sm tracking-widest">2019</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-[#2D2D2D] py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
              What Drives Us
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-white">
              Our Values
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Heart,
                title: "Crafted with Care",
                description: "Every piece is made to order, ensuring the highest quality and attention to detail for each customer.",
              },
              {
                icon: Award,
                title: "Quality Materials",
                description: "We source premium woods, acrylics, and leatherettes to create pieces that look beautiful and last.",
              },
              {
                icon: MapPin,
                title: "Made in New Jersey",
                description: "Proudly designed and produced in our New Jersey studio, supporting local craftsmanship.",
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-[#C4A962]" />
                </div>
                <h3 className="font-serif text-2xl text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-white/60">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 grid grid-cols-2 gap-4"
            >
              <div className="aspect-square rounded-sm overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80"
                  alt="Wedding signage"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-sm overflow-hidden mt-8">
                <img
                  src="https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=400&q=80"
                  alt="Cutting boards"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-sm overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80"
                  alt="Nursery decor"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-sm overflow-hidden mt-8">
                <img
                  src="https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&q=80"
                  alt="Corporate gifts"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
                Experience
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-[#2D2D2D] mb-6">
                Who We Serve
              </h2>
              <p className="text-[#6B6B6B] leading-relaxed mb-6">
                From intimate weddings to large corporate events, we've had the 
                privilege of creating pieces for a wide range of clients and occasions.
              </p>
              <ExperienceList />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location & Fulfillment */}
      <section className="bg-[#E8E6E3]/30 py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
              Location
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#2D2D2D] mb-6">
              Based in New Jersey
            </h2>
            <p className="text-[#6B6B6B] text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Our studio is located in New Jersey, where every piece is designed 
              and produced in-house. We ship nationwide and offer local pickup 
              for nearby customers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={createPageUrl("Contact")}
                className="group flex items-center gap-3 bg-[#2D2D2D] text-white px-8 py-4 text-xs tracking-widest uppercase font-medium hover:bg-[#C4A962] transition-colors"
              >
                Get in Touch
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="https://craftedxdesignco.etsy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-[#2D2D2D] text-[#2D2D2D] px-8 py-4 text-xs tracking-widest uppercase font-medium hover:bg-[#2D2D2D] hover:text-white transition-colors"
              >
                Visit Etsy Shop
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}