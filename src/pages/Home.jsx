import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import Hero from "@/components/home/Hero";
import FeaturedWork from "@/components/home/FeaturedWork";
import Specialties from "@/components/home/Specialties";
import ProcessPreview from "@/components/home/ProcessPreview";
import CallToAction from "@/components/home/CallToAction";
import PortfolioModal from "@/components/portfolio/PortfolioModal";

export default function Home() {
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: featuredItems = [] } = useQuery({
    queryKey: ["featured-portfolio"],
    queryFn: () => base44.entities.PortfolioItem.filter({ featured: true, visible: true }, "display_order", 6),
  });

  return (
    <div>
      <Hero />
      <FeaturedWork items={featuredItems} onItemClick={setSelectedItem} />
      <Specialties />
      <ProcessPreview />
      <CallToAction />
      
      <PortfolioModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}