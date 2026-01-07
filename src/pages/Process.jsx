import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  MessageSquare, 
  PenTool, 
  FileCheck, 
  Hammer,
  Package,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Inquiry",
    subtitle: "Let's Connect",
    description: "Share your vision with us! Tell us about your project, the occasion, quantities needed, and any specific ideas you have in mind. The more details, the better we can serve you.",
    details: [
      "Fill out our inquiry form or send us a message",
      "Share reference images or inspiration",
      "Let us know your timeline and budget",
      "We respond within 24-48 hours",
    ],
  },
  {
    icon: PenTool,
    title: "Design",
    subtitle: "Bring Your Vision to Life",
    description: "Our design team creates a custom concept based on your specifications. We'll work with your ideas, logos, text, and preferences to craft something uniquely yours.",
    details: [
      "Custom design creation",
      "Multiple revision rounds included",
      "Material and finish recommendations",
      "Size and layout optimization",
    ],
  },
  {
    icon: FileCheck,
    title: "Proof",
    subtitle: "Review & Approve",
    description: "We send you a digital proof for review. This is your opportunity to see exactly how your piece will look and request any final adjustments before production begins.",
    details: [
      "High-quality digital mockup",
      "Spelling and detail verification",
      "Final adjustments as needed",
      "Written approval before production",
    ],
  },
  {
    icon: Hammer,
    title: "Production",
    subtitle: "Crafted with Care",
    description: "Once approved, your piece moves to production. Every item is carefully laser-cut and/or engraved in our New Jersey studio with attention to detail and quality.",
    details: [
      "Premium materials sourced",
      "Precision laser cutting & engraving",
      "Quality inspection on every piece",
      "Hand-finished details",
    ],
  },
  {
    icon: Package,
    title: "Delivery",
    subtitle: "To Your Doorstep",
    description: "Your finished piece is carefully packaged and shipped to you. We take extra care to ensure it arrives safely and ready to impress.",
    details: [
      "Secure, protective packaging",
      "Tracking information provided",
      "Domestic shipping across the US",
      "Local pickup available in NJ",
    ],
  },
];

export default function Process() {
  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="px-6 lg:px-12 mb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
              How It Works
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-[#2D2D2D] mb-6">
              The Custom Process
            </h1>
            <p className="text-[#6B6B6B] max-w-2xl mx-auto text-lg">
              From your initial idea to the finished piece in your hands—
              we guide you through every step of creating something truly special.
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-[#E8E6E3]" />

            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16 mb-16 lg:mb-24 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 1 ? "lg:text-right" : ""}`}>
                  <div className="bg-white p-8 lg:p-10 rounded-sm shadow-sm">
                    <p className="text-[10px] tracking-widest uppercase text-[#C4A962] mb-2">
                      Step {index + 1}
                    </p>
                    <h3 className="font-serif text-3xl text-[#2D2D2D] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[#6B6B6B] text-sm mb-4">
                      {step.subtitle}
                    </p>
                    <p className="text-[#6B6B6B] leading-relaxed mb-6">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className={`flex items-center gap-2 text-sm text-[#6B6B6B] ${
                            index % 2 === 1 ? "lg:flex-row-reverse" : ""
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#C4A962] flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Icon (Center on desktop) */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-[#C4A962] flex items-center justify-center shadow-lg flex-shrink-0">
                  <step.icon className="w-9 h-9 text-white" />
                </div>

                {/* Empty space for alignment */}
                <div className="hidden lg:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#E8E6E3]/30 py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
              Questions
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#2D2D2D]">
              Good to Know
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: "How long does a custom project take?",
                a: "Most projects take 1-3 weeks from approval to delivery, depending on complexity and current workload. Rush orders may be available—just ask!",
              },
              {
                q: "What information do you need to get started?",
                a: "The more details, the better! Share the occasion, text/names, sizes, quantities, and any reference images. We'll help refine from there.",
              },
              {
                q: "Can I see a proof before production?",
                a: "Absolutely. Every custom order receives a digital proof for approval before we begin cutting or engraving.",
              },
              {
                q: "Do you ship nationwide?",
                a: "Yes! We ship across the United States. Local pickup is also available in New Jersey.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-sm"
              >
                <h4 className="font-serif text-xl text-[#2D2D2D] mb-2">
                  {faq.q}
                </h4>
                <p className="text-[#6B6B6B]">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-[#2D2D2D] mb-6">
            Ready to Start?
          </h2>
          <p className="text-[#6B6B6B] text-lg mb-10">
            Tell us about your project and let's create something beautiful together.
          </p>
          <Link
            to={createPageUrl("Contact")}
            className="group inline-flex items-center gap-3 bg-[#2D2D2D] text-white px-10 py-4 text-xs tracking-widest uppercase font-medium hover:bg-[#C4A962] transition-colors"
          >
            Get in Touch
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}