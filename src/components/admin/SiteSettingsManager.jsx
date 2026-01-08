import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

export default function SiteSettingsManager() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    hero_image: "",
    hero_headline: "Custom Laser-Cut\n& Engraved\nDesigns",
    hero_subheadline: "Handcrafted pieces for weddings, milestones, and moments worth celebrating. Made in New Jersey with precision and care.",
    about_image: "",
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const results = await base44.entities.SiteSettings.filter({ setting_key: "home_hero" });
      return results[0] || null;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        hero_image: settings.hero_image || "",
        hero_headline: settings.hero_headline || "Custom Laser-Cut\n& Engraved\nDesigns",
        hero_subheadline: settings.hero_subheadline || "Handcrafted pieces for weddings, milestones, and moments worth celebrating. Made in New Jersey with precision and care.",
        about_image: settings.about_image || "",
      });
    }
  }, [settings]);

  const saveSettings = useMutation({
    mutationFn: async (data) => {
      if (settings) {
        return base44.entities.SiteSettings.update(settings.id, data);
      } else {
        return base44.entities.SiteSettings.create({ setting_key: "home_hero", ...data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings-home"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#C4A962]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-[#2D2D2D] mb-1">Homepage Hero</h2>
        <p className="text-sm text-[#6B6B6B]">Control the main hero section on your homepage</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-sm space-y-6">
        <div className="space-y-2">
          <Label>Hero Background Image</Label>
          <ImageUploader
            images={formData.hero_image ? [formData.hero_image] : []}
            onChange={(imgs) => setFormData({ ...formData, hero_image: imgs[0] || "" })}
          />
          <p className="text-xs text-[#6B6B6B]">
            Upload a professional photo of your laser-cut work. Leave empty for a neutral gradient background.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Hero Headline</Label>
          <Textarea
            value={formData.hero_headline}
            onChange={(e) => setFormData({ ...formData, hero_headline: e.target.value })}
            rows={3}
            placeholder="Custom Laser-Cut
& Engraved
Designs"
          />
          <p className="text-xs text-[#6B6B6B]">Use line breaks to control text layout</p>
        </div>

        <div className="space-y-2">
          <Label>About Page Hero Image</Label>
          <ImageUploader
            images={formData.about_image ? [formData.about_image] : []}
            onChange={(imgs) => setFormData({ ...formData, about_image: imgs[0] || "" })}
          />
          <p className="text-xs text-[#6B6B6B]">
            Upload an image for the About page hero section
          </p>
        </div>

        <div className="space-y-2">
          <Label>Hero Subheadline</Label>
          <Textarea
            value={formData.hero_subheadline}
            onChange={(e) => setFormData({ ...formData, hero_subheadline: e.target.value })}
            rows={2}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saveSettings.isPending}
            className="bg-[#2D2D2D] hover:bg-[#C4A962]"
          >
            {saveSettings.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}