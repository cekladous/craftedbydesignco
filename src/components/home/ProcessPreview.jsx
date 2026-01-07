import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageSquare, PenTool, FileCheck, Package, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Inquiry",
    description: "Share your vision and project details",
  },
  {
    icon: PenTool,
    title: "Design",
    description: "We create a custom design for you",
  },
  {
    icon: FileCheck,
    title: "Proof",
    description: "Review and approve your design",
  },
  {
    icon: Package,
    title: "Deliver",
    description: "Receive your handcrafted piece",
  },
];

export default function ProcessPreview() {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 bg-[#E8E6E3]/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
            How It Works
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[#2D2D2D] mb-4">
            The Custom Process
          </h2>
          <p className="text-[#6B6B6B] max-w-xl mx-auto">
            From concept to creation, we guide you through every step.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white shadow-sm flex items-center justify-center">
                <step.icon className="w-7 h-7 text-[#C4A962]" />
              </div>
              <div className="text-[10px] tracking-widest uppercase text-[#C4A962] mb-2">
                Step {index + 1}
              </div>
              <h3 className="font-serif text-xl text-[#2D2D2D] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[#6B6B6B]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link
            to={createPageUrl("Process")}
            className="group inline-flex items-center gap-3 text-[#2D2D2D] text-xs tracking-widest uppercase font-medium hover:text-[#C4A962] transition-colors"
          >
            Learn More
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}