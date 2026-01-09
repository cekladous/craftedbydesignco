import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Testimonials() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ["featured-testimonials"],
    queryFn: async () => {
      const items = await base44.entities.Testimonial.list("display_order");
      return items.filter((t) => t.featured && t.visible);
    }
  });

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-[#E8E6E3]/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16">

          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
            Client Love
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[#2D2D2D]">
            What Our Customers Say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) =>
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }} className="bg-white px-5 py-3 rounded-sm shadow-sm hover:shadow-md transition-shadow flex flex-col">


              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) =>
              <Star
                key={i}
                className={`w-4 h-4 ${
                i < (testimonial.rating || 5) ?
                "text-[#C4A962] fill-current" :
                "text-[#E8E6E3] fill-current"}`
                } />

              )}
              </div>

              <p className="text-[#6B6B6B] leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {testimonial.image_url ?
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E8E6E3]">
                      <img
                    src={testimonial.image_url}
                    alt={testimonial.customer_name}
                    className="w-full h-full object-cover" />

                    </div> :

                <div className="w-12 h-12 rounded-full bg-[#C4A962]/10 flex items-center justify-center">
                      <span className="text-[#C4A962] font-medium text-lg">
                        {testimonial.customer_name.charAt(0)}
                      </span>
                    </div>
                }
                  <div>
                    <p className="font-medium text-[#2D2D2D]">
                      {testimonial.customer_name}
                    </p>
                  </div>
                </div>

                {testimonial.link_url &&
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-[#C4A962] hover:text-[#2D2D2D]">

                    <a
                  href={testimonial.link_url}
                  target="_blank"
                  rel="noopener noreferrer">

                      {testimonial.link_text || "View"}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
              }
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}