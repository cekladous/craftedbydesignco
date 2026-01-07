import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Sparkles, 
  Layers, 
  Package, 
  Clock,
  ArrowRight 
} from "lucide-react";

const capabilities = [
  {
    icon: Sparkles,
    title: "Laser Cutting",
    description: "Precision cutting through wood, acrylic, paper, and more. Perfect for intricate designs, custom shapes, and detailed patterns.",
  },
  {
    icon: Layers,
    title: "Laser Engraving",
    description: "Detailed engraving on a variety of surfaces. From delicate text to photo-realistic images, we bring your vision to life.",
  },
  {
    icon: Sparkles,
    title: "Vinyl Cutting",
    description: "Precision vinyl cutting for custom decals, lettering, and signage using professional-grade equipment, including Cricut. Ideal for event signage, window decals, wall graphics, labels, and custom accents. Suitable for both temporary and permanent applications across a variety of surfaces.",
  },
  {
    icon: Package,
    title: "Printed Banners",
    description: "High-quality printed banners designed for events, celebrations, and branded displays. Perfect for weddings, showers, birthdays, corporate events, and storefront promotions. Available in multiple sizes and finishes with clean, vibrant printing for indoor or outdoor use.",
  },
  {
    icon: Layers,
    title: "UV Printed Materials",
    description: "Direct UV printing on rigid materials for crisp, full-color designs with exceptional durability. UV printing allows for detailed graphics, logos, and text on acrylic, wood, and other substrates, creating a professional, high-end finish that is scratch-resistant and fade-resistant.",
  },
];

const materials = [
  {
    name: "Wood",
    types: ["Birch Plywood", "Walnut", "Cherry", "Maple", "Oak", "MDF"],
    description: "Natural warmth and character for rustic and elegant pieces alike.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    name: "Acrylic",
    types: ["Clear", "Frosted", "Mirror", "Colored", "Fluorescent"],
    description: "Modern, sleek finish perfect for contemporary designs and signage.",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=600&q=80",
  },
  {
    name: "Leatherette",
    types: ["Black", "Brown", "Navy", "Gray", "Custom Colors"],
    description: "Luxurious feel for journals, flasks, and personalized accessories.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
  },
  {
    name: "Marble",
    types: ["Marble Coasters", "Marble Tiles", "Natural Stone"],
    description: "Elegant stone surfaces for sophisticated home décor and gifts.",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80",
  },
];

const productionTypes = [
  {
    icon: Clock,
    title: "Made-to-Order",
    description: "Every piece is crafted specifically for you after your order is placed, ensuring personalization and attention to detail.",
  },
  {
    icon: Package,
    title: "Small Batch",
    description: "Perfect for events, weddings, or personal projects. We handle quantities from a single piece to dozens.",
  },
  {
    icon: Layers,
    title: "Bulk Production",
    description: "Corporate gifting, branded merchandise, and large events. Consistent quality at scale.",
  },
];

export default function Capabilities() {
  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="px-6 lg:px-12 mb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
              What We Do
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-[#2D2D2D] mb-6">
              Our Capabilities
            </h1>
            <p className="text-[#6B6B6B] max-w-2xl mx-auto text-lg">
              State-of-the-art laser technology meets artisan craftsmanship.
              We bring precision and creativity to every project.
            </p>
          </motion.div>

          {/* Core Capabilities */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {capabilities.map((cap, index) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 lg:p-10 rounded-sm shadow-sm"
              >
                <div className="w-14 h-14 rounded-full bg-[#C4A962]/10 flex items-center justify-center mb-6">
                  <cap.icon className="w-7 h-7 text-[#C4A962]" />
                </div>
                <h3 className="font-serif text-2xl text-[#2D2D2D] mb-3">
                  {cap.title}
                </h3>
                <p className="text-[#6B6B6B] leading-relaxed">
                  {cap.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Section */}
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
              We Work With
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-white">
              Materials
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {materials.map((material, index) => (
              <motion.div
                key={material.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-4">
                  <img
                    src={material.image}
                    alt={material.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-serif text-2xl text-white mb-1">
                      {material.name}
                    </h3>
                  </div>
                </div>
                <p className="text-white/60 text-sm mb-2">
                  {material.description}
                </p>
                <p className="text-white/40 text-xs">
                  {material.types.join(" • ")}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Production Types */}
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
              Production Scale
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#2D2D2D]">
              From One to Many
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {productionTypes.map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#E8E6E3] flex items-center justify-center">
                  <type.icon className="w-7 h-7 text-[#C4A962]" />
                </div>
                <h3 className="font-serif text-2xl text-[#2D2D2D] mb-3">
                  {type.title}
                </h3>
                <p className="text-[#6B6B6B]">
                  {type.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-16"
          >
            <Link
              to={createPageUrl("Contact")}
              className="group inline-flex items-center gap-3 bg-[#2D2D2D] text-white px-8 py-4 text-xs tracking-widest uppercase font-medium hover:bg-[#C4A962] transition-colors"
            >
              Discuss Your Project
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}