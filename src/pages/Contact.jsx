import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Mail, 
  Instagram, 
  ExternalLink, 
  CheckCircle2,
  Loader2,
  Send,
  Upload,
  X
} from "lucide-react";

const categories = [
  { value: "wedding", label: "Wedding Signage" },
  { value: "baby", label: "Baby & Milestones" },
  { value: "corporate", label: "Corporate & Branded" },
  { value: "home", label: "Home Décor" },
  { value: "gifts", label: "Personalized Gifts" },
  { value: "specialty", label: "Specialty Items" },
  { value: "other", label: "Other / Not Sure" },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    event_date: "",
    message: "",
    vision_images: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Check URL params for pre-filled data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const product = urlParams.get("product");
    const category = urlParams.get("category");
    const materials = urlParams.get("materials");
    
    if (product || category) {
      let message = "";
      if (product) {
        message = `I'm interested in: ${product}\n`;
        if (materials) {
          message += `Materials: ${materials}\n`;
        }
        message += "\n";
      }
      
      setFormData((prev) => ({
        ...prev,
        category: category || "",
        message: message,
      }));
    }
  }, []);

  const createInquiry = useMutation({
    mutationFn: (data) => base44.entities.Inquiry.create(data),
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createInquiry.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setFormData((prev) => ({
        ...prev,
        vision_images: [...prev.vision_images, ...uploadedUrls],
      }));
    } catch (error) {
      alert("Failed to upload images: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      vision_images: prev.vision_images.filter((_, i) => i !== index),
    }));
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-24 px-6 lg:px-12 min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#C4A962]/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#C4A962]" />
          </div>
          <h2 className="font-serif text-3xl text-[#2D2D2D] mb-4">
            Message Received!
          </h2>
          <p className="text-[#6B6B6B] mb-8">
            Thank you for reaching out. We'll review your inquiry and get back 
            to you within 24-48 hours.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                name: "",
                email: "",
                phone: "",
                category: "",
                event_date: "",
                message: "",
                vision_images: [],
              });
            }}
            variant="outline"
            className="border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white"
          >
            Send Another Message
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Column - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C4A962] mb-4">
              Get in Touch
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-[#2D2D2D] mb-6">
              Let's Create
              <br />
              <span className="italic">Together</span>
            </h1>
            <p className="text-[#6B6B6B] text-lg leading-relaxed mb-10">
              Have a project in mind? Whether you're planning a wedding, 
              celebrating a milestone, or looking for the perfect personalized 
              gift—we'd love to hear from you.
            </p>

            {/* Contact Options */}
            <div className="space-y-6 mb-12">
              <a
                href="mailto:craftedxdesignco@gmail.com"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#E8E6E3] flex items-center justify-center group-hover:bg-[#C4A962] transition-colors">
                  <Mail className="w-5 h-5 text-[#2D2D2D] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#6B6B6B] mb-1">Email</p>
                  <p className="text-[#2D2D2D] group-hover:text-[#C4A962] transition-colors">
                    craftedxdesignco@gmail.com
                  </p>
                </div>
              </a>

              <a
                href="https://www.instagram.com/craftedbydesignco"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#E8E6E3] flex items-center justify-center group-hover:bg-[#C4A962] transition-colors">
                  <Instagram className="w-5 h-5 text-[#2D2D2D] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#6B6B6B] mb-1">Instagram</p>
                  <p className="text-[#2D2D2D] group-hover:text-[#C4A962] transition-colors">
                    @craftedbydesignco
                  </p>
                </div>
              </a>

              <a
                href="https://www.facebook.com/CraftedbyDesignCo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#E8E6E3] flex items-center justify-center group-hover:bg-[#C4A962] transition-colors">
                  <Facebook className="w-5 h-5 text-[#2D2D2D] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#6B6B6B] mb-1">Facebook</p>
                  <p className="text-[#2D2D2D] group-hover:text-[#C4A962] transition-colors">
                    CraftedbyDesignCo
                  </p>
                </div>
              </a>

              <a
                href="https://craftedxdesignco.etsy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-[#E8E6E3] flex items-center justify-center group-hover:bg-[#C4A962] transition-colors">
                  <ExternalLink className="w-5 h-5 text-[#2D2D2D] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#6B6B6B] mb-1">Etsy Shop</p>
                  <p className="text-[#2D2D2D] group-hover:text-[#C4A962] transition-colors">
                    craftedxdesignco.etsy.com
                  </p>
                </div>
              </a>
            </div>

            {/* Response Time */}
            <div className="bg-[#E8E6E3]/50 p-6 rounded-sm">
              <p className="text-xs tracking-widest uppercase text-[#C4A962] mb-2">
                Response Time
              </p>
              <p className="text-[#6B6B6B]">
                We typically respond to inquiries within 24-48 hours. 
                For urgent requests, please mention it in your message.
              </p>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="bg-white p-8 lg:p-10 rounded-sm shadow-sm">
              <h2 className="font-serif text-2xl text-[#2D2D2D] mb-6">
                Send an Inquiry
              </h2>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs tracking-widest uppercase text-[#6B6B6B]">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                      className="border-[#E8E6E3] focus:border-[#C4A962] focus:ring-[#C4A962]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs tracking-widest uppercase text-[#6B6B6B]">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                      className="border-[#E8E6E3] focus:border-[#C4A962] focus:ring-[#C4A962]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs tracking-widest uppercase text-[#6B6B6B]">
                      Phone (Optional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="border-[#E8E6E3] focus:border-[#C4A962] focus:ring-[#C4A962]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event_date" className="text-xs tracking-widest uppercase text-[#6B6B6B]">
                      Event / Need-By Date
                    </Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => handleChange("event_date", e.target.value)}
                      className="border-[#E8E6E3] focus:border-[#C4A962] focus:ring-[#C4A962]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs tracking-widest uppercase text-[#6B6B6B]">
                    Project Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger className="border-[#E8E6E3] focus:border-[#C4A962] focus:ring-[#C4A962]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs tracking-widest uppercase text-[#6B6B6B]">
                    Upload Inspiration Photos (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-[#E8E6E3] rounded-sm p-6 text-center hover:border-[#C4A962] transition-colors">
                    <label
                      htmlFor="vision-upload"
                      className="cursor-pointer block"
                    >
                      <div className="flex flex-col items-center gap-3">
                        {uploading ? (
                          <>
                            <Loader2 className="w-8 h-8 animate-spin text-[#C4A962]" />
                            <p className="text-sm text-[#6B6B6B]">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-[#C4A962]/10 flex items-center justify-center">
                              <Upload className="w-6 h-6 text-[#C4A962]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#2D2D2D] mb-1">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-[#6B6B6B]">
                                Share photos of designs you like
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      <input
                        id="vision-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        multiple
                      />
                    </label>
                  </div>
                  {formData.vision_images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {formData.vision_images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-sm overflow-hidden group bg-[#E8E6E3]"
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs tracking-widest uppercase text-[#6B6B6B]">
                    Tell Us About Your Project *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    required
                    rows={5}
                    placeholder="Describe your vision, quantities needed, any specific requirements..."
                    className="border-[#E8E6E3] focus:border-[#C4A962] focus:ring-[#C4A962] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createInquiry.isPending}
                  className="w-full bg-[#2D2D2D] text-white py-4 text-xs tracking-widest uppercase font-medium hover:bg-[#C4A962] transition-colors h-auto"
                >
                  {createInquiry.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Inquiry
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}