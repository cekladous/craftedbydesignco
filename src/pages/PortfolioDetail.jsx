import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, MessageSquare, Download, FileText, Image as ImageIcon, File, ArrowLeft, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { ProductSchema } from "@/components/SchemaMarkup";
import SEOHead from "@/components/SEOHead";

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
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.includes("pdf")) return FileText;
  return File;
};

export default function PortfolioDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentMediaType, setCurrentMediaType] = useState("image");
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const { data: item, isLoading } = useQuery({
    queryKey: ["portfolio-item", itemId],
    queryFn: async () => {
      const results = await base44.entities.PortfolioItem.filter({ id: itemId, visible: true });
      return results[0] || null;
    },
    enabled: !!itemId,
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ["attachments", itemId],
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
    enabled: !!(item?.attachments && item.attachments.length > 0),
  });

  if (isLoading) {
    return (
      <div className="pt-32 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#C4A962]" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pt-32 pb-24 px-6 text-center min-h-screen">
        <p className="font-serif text-3xl text-[#2D2D2D] mb-4">Item not found</p>
        <Link to={createPageUrl("Portfolio")} className="text-[#C4A962] hover:underline text-sm">
          ← Back to Portfolio
        </Link>
      </div>
    );
  }

  const images = item.images || [];
  const videos = item.videos || [];
  const hasImages = images.length > 0;
  const hasVideos = videos.length > 0;
  const hasMultipleImages = images.length > 1;

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
    <div className="pt-24 pb-24 min-h-screen bg-[#FAF9F7]">
      <SEOHead
        title={`${item.name} | Crafted By Design Co.`}
        description={item.seo_description || item.description}
        keywords={item.seo_keywords || ''}
        image={item.images?.[0] || ''}
        url={`https://craftedbydesign.co/portfolio/${item.id}`}
        product={item.price ? {
          price: item.price.toFixed(2),
          currency: 'USD',
          availability: 'in stock',
          brand: 'Crafted By Design Co.'
        } : null}
      />
      <ProductSchema item={item} />
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#C4A962] transition-colors mb-10 text-sm tracking-wide"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolio
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20"
        >
          {/* Media */}
          <div>
            {/* Tabs */}
            {hasImages && hasVideos && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setCurrentMediaType("image")}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                    currentMediaType === "image"
                      ? "bg-[#C4A962] text-white"
                      : "bg-[#E8E6E3] text-[#6B6B6B] hover:text-[#2D2D2D]"
                  }`}
                >
                  Images
                </button>
                <button
                  onClick={() => setCurrentMediaType("video")}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                    currentMediaType === "video"
                      ? "bg-[#C4A962] text-white"
                      : "bg-[#E8E6E3] text-[#6B6B6B] hover:text-[#2D2D2D]"
                  }`}
                >
                  Videos
                </button>
              </div>
            )}

            {/* Main Media */}
            <div className="relative aspect-square bg-[#E8E6E3] rounded-sm overflow-hidden">
              {currentMediaType === "image" ? (
                hasImages ? (
                  <>
                    {imageLoading && !imageError && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#C4A962] border-t-transparent" />
                      </div>
                    )}
                    {imageError ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-[#6B6B6B]/30" />
                      </div>
                    ) : (
                      <img
                        src={images[currentImageIndex]}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onLoad={() => setImageLoading(false)}
                        onError={() => { setImageLoading(false); setImageError(true); }}
                        style={{ display: imageLoading ? "none" : "block" }}
                      />
                    )}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full text-[#2D2D2D] hover:bg-[#C4A962] hover:text-white transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full text-[#2D2D2D] hover:bg-[#C4A962] hover:text-white transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                idx === currentImageIndex ? "bg-[#C4A962]" : "bg-[#C4A962]/30"
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
              ) : (
                <video src={videos[0]} controls className="w-full h-full object-contain" />
              )}
            </div>

            {/* Thumbnail strip */}
            {hasMultipleImages && currentMediaType === "image" && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentImageIndex(idx); setImageError(false); setImageLoading(true); }}
                    className={`flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-colors ${
                      idx === currentImageIndex ? "border-[#C4A962]" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#C4A962] mb-2">
              {categoryLabels[item.category] || item.category}
            </p>
            <h1 className="font-serif text-4xl lg:text-5xl text-[#2D2D2D] mb-4">
              {item.name}
            </h1>

            {item.price && (
              <p className="text-2xl font-serif text-[#C4A962] mb-6">
                {item.price_label || "Starting at"} ${item.price.toFixed(2)}
              </p>
            )}
            <p className="text-[#6B6B6B] leading-relaxed mb-8 whitespace-pre-wrap">
              {item.description}
            </p>

            {item.materials?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs tracking-widest uppercase text-[#2D2D2D] mb-3">Materials</h4>
                <div className="flex flex-wrap gap-2">
                  {item.materials.map((material, idx) => (
                    <span key={idx} className="text-xs px-3 py-1.5 bg-[#E8E6E3] text-[#6B6B6B] rounded-full">
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {item.customization_options && (
              <div className="mb-8">
                <h4 className="text-xs tracking-widest uppercase text-[#2D2D2D] mb-3">Customization</h4>
                <p className="text-sm text-[#6B6B6B]">{item.customization_options}</p>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xs tracking-widest uppercase text-[#2D2D2D] mb-3">Downloadable Files</h4>
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
                        <p className="text-xs font-medium text-[#2D2D2D] truncate flex-1">{file.label || file.filename}</p>
                        <Download className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#C4A962] transition-colors" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <Link
                to={createPageUrl("Contact") + `?product=${encodeURIComponent(item.name)}&category=${item.category}&materials=${encodeURIComponent((item.materials || []).join(", "))}`}
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
                  <p className="text-xs text-center text-[#6B6B6B]">Checkout securely on Etsy</p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}