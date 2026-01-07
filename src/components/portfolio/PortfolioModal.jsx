import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ExternalLink, MessageSquare } from "lucide-react";
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

export default function PortfolioModal({ item, isOpen, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!item) return null;

  const images = item.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#FAF9F7] rounded-sm overflow-hidden flex flex-col lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full text-[#2D2D2D] hover:bg-[#C4A962] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Section */}
            <div className="relative lg:w-3/5 aspect-square lg:aspect-auto bg-[#E8E6E3]">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full text-[#2D2D2D] hover:bg-[#C4A962] hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full text-[#2D2D2D] hover:bg-[#C4A962] hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              idx === currentImageIndex ? "bg-white" : "bg-white/40"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center min-h-[300px]">
                  <span className="text-[#6B6B6B]/50 font-serif text-xl">No Image</span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="lg:w-2/5 p-8 lg:p-10 overflow-y-auto">
              <p className="text-[10px] tracking-widest uppercase text-[#C4A962] mb-2">
                {categoryLabels[item.category] || item.category}
              </p>
              
              <h2 className="font-serif text-3xl lg:text-4xl text-[#2D2D2D] mb-4">
                {item.name}
              </h2>
              
              <p className="text-[#6B6B6B] leading-relaxed mb-6">
                {item.description}
              </p>
              
              {item.materials?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs tracking-widest uppercase text-[#2D2D2D] mb-2">
                    Materials
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {item.materials.map((material, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 bg-[#E8E6E3] text-[#6B6B6B] rounded-full"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {item.customization_options && (
                <div className="mb-8">
                  <h4 className="text-xs tracking-widest uppercase text-[#2D2D2D] mb-2">
                    Customization
                  </h4>
                  <p className="text-sm text-[#6B6B6B]">
                    {item.customization_options}
                  </p>
                </div>
              )}
              
              {/* CTA Buttons */}
              <div className="space-y-3">
                <Link
                  to={createPageUrl("Contact") + `?product=${encodeURIComponent(item.name)}&category=${item.category}&materials=${encodeURIComponent((item.materials || []).join(', '))}`}
                  className="flex items-center justify-center gap-2 w-full bg-[#2D2D2D] text-white py-4 text-xs tracking-widest uppercase font-medium hover:bg-[#C4A962] transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Request Custom Quote
                </Link>
                
                {item.etsy_url && (
                  <>
                    <a
                      href={item.etsy_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-white border-2 border-[#2D2D2D] text-[#2D2D2D] py-4 text-xs tracking-widest uppercase font-medium hover:bg-[#2D2D2D] hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Etsy
                    </a>
                    <p className="text-xs text-center text-[#6B6B6B]">
                      Checkout securely on Etsy
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}