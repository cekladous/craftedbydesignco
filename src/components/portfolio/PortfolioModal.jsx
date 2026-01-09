import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ExternalLink, MessageSquare, Download, FileText, Image as ImageIcon, File } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ProductSchema } from "@/components/SchemaMarkup";

const categoryLabels = {
  wedding: "Wedding",
  baby: "Baby & Milestones",
  corporate: "Corporate",
  home: "Home Décor",
  gifts: "Personalized Gifts",
  specialty: "Specialty Items",
};

const getFileIcon = (mimeType) => {
  if (!mimeType) return File;
  if (mimeType.startsWith('image/')) return ImageIcon;
  if (mimeType.includes('pdf')) return FileText;
  return File;
};

export default function PortfolioModal({ item, isOpen, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentMediaType, setCurrentMediaType] = useState("image");
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch attachments if any
  const { data: attachments = [] } = useQuery({
    queryKey: ["attachments", item?.id],
    queryFn: async () => {
      if (!item?.attachments || item.attachments.length === 0) return [];
      const files = await Promise.all(
        item.attachments.map(async (id) => {
          const results = await base44.entities.UploadedFile.filter({ id });
          return results[0];
        })
      );
      return files.filter(Boolean);
    },
    enabled: !!(item?.attachments && item.attachments.length > 0 && isOpen)
  });

  if (!item) return null;

  const images = item.images || [];
  const videos = item.videos || [];
  const hasImages = images.length > 0;
  const hasVideos = videos.length > 0;
  const hasMultipleImages = images.length > 1;
  const hasMultipleVideos = videos.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setImageError(false);
    setImageLoading(true);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setImageError(false);
    setImageLoading(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <ProductSchema item={item} />
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

            {/* Media Section */}
            <div className="relative lg:w-3/5 min-h-[50vh] lg:min-h-full bg-[#E8E6E3] flex flex-col">
              {/* Media Tabs */}
              {hasImages && hasVideos && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-white/90 rounded-full p-1">
                  <button
                    onClick={() => setCurrentMediaType("image")}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                      currentMediaType === "image"
                        ? "bg-[#C4A962] text-white"
                        : "text-[#6B6B6B] hover:text-[#2D2D2D]"
                    }`}
                  >
                    Images
                  </button>
                  <button
                    onClick={() => setCurrentMediaType("video")}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                      currentMediaType === "video"
                        ? "bg-[#C4A962] text-white"
                        : "text-[#6B6B6B] hover:text-[#2D2D2D]"
                    }`}
                  >
                    Videos
                  </button>
                </div>
              )}

              <div className="flex-1 relative flex items-center justify-center min-h-0">
                {currentMediaType === "image" ? (
                  hasImages ? (
                    <>
                      {imageLoading && !imageError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#E8E6E3]">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C4A962] border-t-transparent"></div>
                        </div>
                      )}
                      {imageError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                          <ImageIcon className="w-16 h-16 text-[#6B6B6B]/30 mb-4" />
                          <span className="text-[#6B6B6B] font-serif text-xl mb-2">Image unavailable</span>
                          <span className="text-[#6B6B6B]/60 text-sm">This image could not be loaded</span>
                        </div>
                      ) : (
                        <img
                          src={images[currentImageIndex]}
                          alt={item.name}
                          className="max-w-full max-h-full object-contain"
                          onLoad={() => setImageLoading(false)}
                          onError={() => {
                            setImageLoading(false);
                            setImageError(true);
                          }}
                          style={{ display: imageLoading ? 'none' : 'block' }}
                        />
                      )}
                      
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
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[#6B6B6B]/50 font-serif text-xl">No Image</span>
                    </div>
                  )
                ) : hasVideos ? (
                  <video
                    src={videos[0]}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#6B6B6B]/50 font-serif text-xl">No Video</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:w-2/5 p-8 lg:p-10 overflow-y-auto">
              <p className="text-[10px] tracking-widest uppercase text-[#C4A962] mb-2">
                {categoryLabels[item.category] || item.category}
              </p>
              
              <h2 className="font-serif text-3xl lg:text-4xl text-[#2D2D2D] mb-4">
                {item.name}
              </h2>
              
              <p className="text-[#6B6B6B] leading-relaxed mb-6 whitespace-pre-wrap">
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
                <div className="mb-6">
                  <h4 className="text-xs tracking-widest uppercase text-[#2D2D2D] mb-2">
                    Customization
                  </h4>
                  <p className="text-sm text-[#6B6B6B]">
                    {item.customization_options}
                  </p>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xs tracking-widest uppercase text-[#2D2D2D] mb-3">
                    Downloadable Files
                  </h4>
                  <div className="space-y-2">
                    {attachments.map((file) => {
                      const Icon = getFileIcon(file.mime_type);
                      return (
                        <a
                          key={file.id}
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-sm border border-[#E8E6E3] hover:border-[#C4A962] transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-sm bg-[#E8E6E3] flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-[#6B6B6B]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#2D2D2D] truncate">
                              {file.label || file.filename}
                            </p>
                          </div>
                          <Download className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#C4A962] transition-colors" />
                        </a>
                      );
                    })}
                  </div>
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
        </>
      )}
    </AnimatePresence>
  );
}