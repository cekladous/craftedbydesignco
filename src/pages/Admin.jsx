import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Star,
  Loader2,
  Mail,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import CapabilitiesManager from "@/components/admin/CapabilitiesManager";
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";

const categories = [
  { value: "wedding", label: "Wedding" },
  { value: "baby", label: "Baby & Milestones" },
  { value: "corporate", label: "Corporate" },
  { value: "home", label: "Home Décor" },
  { value: "gifts", label: "Personalized Gifts" },
  { value: "specialty", label: "Specialty Items" },
];

const ctaTypes = [
  { value: "etsy", label: "View on Etsy" },
  { value: "inquiry", label: "Request Quote" },
];

const inquiryStatuses = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  { value: "quoted", label: "Quoted", color: "bg-purple-100 text-purple-800" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-800" },
];

const emptyItem = {
  name: "",
  category: "wedding",
  description: "",
  materials: [],
  images: [],
  etsy_url: "",
  cta_type: "inquiry",
  customization_options: "",
  featured: false,
  visible: true,
  display_order: 0,
};

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("portfolio");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyItem);
  const [newMaterial, setNewMaterial] = useState("");

  // Check admin access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role === "admin") {
          setIsAdmin(true);
        } else {
          navigate(createPageUrl("Home"));
        }
      } catch {
        navigate(createPageUrl("Home"));
      }
      setLoading(false);
    };
    checkAccess();
  }, [navigate]);

  // Fetch data
  const { data: portfolioItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["admin-portfolio"],
    queryFn: () => base44.entities.PortfolioItem.list("display_order"),
    enabled: isAdmin,
  });

  const { data: inquiries = [], isLoading: inquiriesLoading } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: () => base44.entities.Inquiry.list("-created_date"),
    enabled: isAdmin,
  });

  // Mutations
  const createItem = useMutation({
    mutationFn: (data) => base44.entities.PortfolioItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
      closeDialog();
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PortfolioItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
      closeDialog();
    },
  });

  const deleteItem = useMutation({
    mutationFn: (id) => base44.entities.PortfolioItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] }),
  });

  const updateInquiry = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Inquiry.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] }),
  });

  const openDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ ...emptyItem, display_order: portfolioItems.length });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData(emptyItem);
    setNewMaterial("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateItem.mutate({ id: editingItem.id, data: formData });
    } else {
      createItem.mutate(formData);
    }
  };

  const addMaterial = () => {
    if (newMaterial.trim()) {
      setFormData((prev) => ({
        ...prev,
        materials: [...(prev.materials || []), newMaterial.trim()],
      }));
      setNewMaterial("");
    }
  };

  const removeMaterial = (index) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };



  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C4A962]" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-28 pb-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-[#2D2D2D] mb-2">Admin Dashboard</h1>
          <p className="text-[#6B6B6B]">Manage your portfolio and inquiries</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#E8E6E3] mb-8">
            <TabsTrigger value="portfolio">Portfolio Items</TabsTrigger>
            <TabsTrigger value="capabilities">Capabilities & Materials</TabsTrigger>
            <TabsTrigger value="homepage">Homepage Settings</TabsTrigger>
            <TabsTrigger value="inquiries">
              Inquiries
              {inquiries.filter((i) => i.status === "new").length > 0 && (
                <Badge className="ml-2 bg-[#C4A962] text-white text-xs">
                  {inquiries.filter((i) => i.status === "new").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <div className="flex justify-between items-center mb-6">
              <p className="text-[#6B6B6B]">{portfolioItems.length} items</p>
              <Button
                onClick={() => openDialog()}
                className="bg-[#2D2D2D] hover:bg-[#C4A962]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {itemsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#C4A962]" />
              </div>
            ) : portfolioItems.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-sm">
                <ImageIcon className="w-12 h-12 mx-auto text-[#E8E6E3] mb-4" />
                <p className="text-[#6B6B6B]">No portfolio items yet</p>
                <Button
                  onClick={() => openDialog()}
                  className="mt-4 bg-[#2D2D2D] hover:bg-[#C4A962]"
                >
                  Add Your First Item
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {portfolioItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="bg-white p-4 rounded-sm shadow-sm flex items-center gap-4"
                  >
                    <GripVertical className="w-5 h-5 text-[#E8E6E3] cursor-grab" />
                    
                    <div className="w-16 h-16 rounded-sm overflow-hidden bg-[#E8E6E3] flex-shrink-0">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-[#6B6B6B]/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-[#2D2D2D] truncate">
                          {item.name}
                        </h3>
                        {item.featured && (
                          <Star className="w-4 h-4 text-[#C4A962] fill-current" />
                        )}
                        {!item.visible && (
                          <EyeOff className="w-4 h-4 text-[#6B6B6B]" />
                        )}
                      </div>
                      <p className="text-xs text-[#6B6B6B]">
                        {categories.find((c) => c.value === item.category)?.label}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Delete this item?")) {
                            deleteItem.mutate(item.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Capabilities Tab */}
          <TabsContent value="capabilities">
            <CapabilitiesManager />
          </TabsContent>

          {/* Homepage Settings Tab */}
          <TabsContent value="homepage">
            <SiteSettingsManager />
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries">
            {inquiriesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#C4A962]" />
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-sm">
                <MessageSquare className="w-12 h-12 mx-auto text-[#E8E6E3] mb-4" />
                <p className="text-[#6B6B6B]">No inquiries yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <motion.div
                    key={inquiry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-sm shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-[#2D2D2D]">{inquiry.name}</h3>
                          <Badge
                            className={
                              inquiryStatuses.find((s) => s.value === inquiry.status)?.color
                            }
                          >
                            {inquiryStatuses.find((s) => s.value === inquiry.status)?.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B6B6B]">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {inquiry.email}
                          </span>
                          {inquiry.phone && (
                            <span>{inquiry.phone}</span>
                          )}
                          {inquiry.event_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(inquiry.event_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <Select
                        value={inquiry.status}
                        onValueChange={(value) =>
                          updateInquiry.mutate({ id: inquiry.id, data: { status: value } })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {inquiry.category && (
                      <p className="text-xs text-[#C4A962] uppercase tracking-widest mb-2">
                        {categories.find((c) => c.value === inquiry.category)?.label || inquiry.category}
                      </p>
                    )}

                    <p className="text-[#6B6B6B] whitespace-pre-wrap">{inquiry.message}</p>

                    <p className="text-xs text-[#6B6B6B]/60 mt-4">
                      Received: {new Date(inquiry.created_date).toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Portfolio Item Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {editingItem ? "Edit Item" : "Add Portfolio Item"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Materials</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !formData.materials?.includes(value)) {
                      setFormData({
                        ...formData,
                        materials: [...(formData.materials || []), value]
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select materials..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mirrored acrylic">Mirrored acrylic</SelectItem>
                    <SelectItem value="Colored acrylic">Colored acrylic</SelectItem>
                    <SelectItem value="Clear acrylic">Clear acrylic</SelectItem>
                    <SelectItem value="Frosted acrylic">Frosted acrylic</SelectItem>
                    <SelectItem value="Painted acrylic">Painted acrylic</SelectItem>
                    <SelectItem value="Back-painted acrylic">Back-painted acrylic</SelectItem>
                    <SelectItem value="UV-printable acrylic">UV-printable acrylic</SelectItem>
                    <SelectItem value="Birch plywood">Birch plywood</SelectItem>
                    <SelectItem value="Maple wood">Maple wood</SelectItem>
                    <SelectItem value="Walnut wood">Walnut wood</SelectItem>
                    <SelectItem value="Acacia wood">Acacia wood</SelectItem>
                    <SelectItem value="MDF">MDF</SelectItem>
                    <SelectItem value="Stained wood">Stained wood</SelectItem>
                    <SelectItem value="Painted wood">Painted wood</SelectItem>
                    <SelectItem value="Leatherette">Leatherette</SelectItem>
                    <SelectItem value="Adhesive vinyl (permanent)">Adhesive vinyl (permanent)</SelectItem>
                    <SelectItem value="Adhesive vinyl (removable)">Adhesive vinyl (removable)</SelectItem>
                    <SelectItem value="Printed vinyl banners">Printed vinyl banners</SelectItem>
                    <SelectItem value="UV printed acrylic">UV printed acrylic</SelectItem>
                    <SelectItem value="UV printed wood">UV printed wood</SelectItem>
                  </SelectContent>
                </Select>
                {formData.materials?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.materials.map((mat, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-[#E8E6E3] text-[#2D2D2D] pr-1"
                      >
                        {mat}
                        <button
                          type="button"
                          onClick={() => removeMaterial(idx)}
                          className="ml-1 p-0.5 hover:bg-[#2D2D2D]/10 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Images</Label>
                <ImageUploader
                  images={formData.images || []}
                  onChange={(newImages) => setFormData({ ...formData, images: newImages })}
                />
              </div>

              <div className="space-y-2">
                <Label>Customization Options</Label>
                <Input
                  value={formData.customization_options}
                  onChange={(e) => setFormData({ ...formData, customization_options: e.target.value })}
                  placeholder="e.g., Names, dates, colors, sizes..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CTA Type</Label>
                  <Select
                    value={formData.cta_type}
                    onValueChange={(value) => setFormData({ ...formData, cta_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ctaTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Etsy URL</Label>
                  <Input
                    value={formData.etsy_url}
                    onChange={(e) => setFormData({ ...formData, etsy_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label>Featured on Homepage</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.visible}
                    onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                  />
                  <Label>Visible in Portfolio</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createItem.isPending || updateItem.isPending}
                  className="bg-[#2D2D2D] hover:bg-[#C4A962]"
                >
                  {(createItem.isPending || updateItem.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingItem ? (
                    "Update Item"
                  ) : (
                    "Add Item"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}