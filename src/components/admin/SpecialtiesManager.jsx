import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

const categories = [
  { value: "wedding", label: "Wedding" },
  { value: "baby", label: "Baby & Milestones" },
  { value: "corporate", label: "Corporate" },
  { value: "home", label: "Home Décor" },
  { value: "gifts", label: "Personalized Gifts" },
  { value: "specialty", label: "Specialty Items" },
];

export default function SpecialtiesManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    category: "wedding",
    visible: true,
    display_order: 0,
  });

  const { data: specialties = [], isLoading } = useQuery({
    queryKey: ["admin-specialties"],
    queryFn: () => base44.entities.Specialty.list("display_order"),
  });

  const createSpecialty = useMutation({
    mutationFn: (data) => base44.entities.Specialty.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-specialties"] });
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      closeDialog();
    },
  });

  const updateSpecialty = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Specialty.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-specialties"] });
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      closeDialog();
    },
  });

  const deleteSpecialty = useMutation({
    mutationFn: (id) => base44.entities.Specialty.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-specialties"] });
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
    },
  });

  const openDialog = (item = null) => {
    if (item) {
      setEditing(item);
      setFormData(item);
    } else {
      setEditing(null);
      setFormData({
        title: "",
        description: "",
        image_url: "",
        category: "wedding",
        visible: true,
        display_order: specialties.length,
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setFormData({
      title: "",
      description: "",
      image_url: "",
      category: "wedding",
      visible: true,
      display_order: 0,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      updateSpecialty.mutate({ id: editing.id, data: formData });
    } else {
      createSpecialty.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-[#2D2D2D] mb-1">
            Homepage Specialties
          </h3>
          <p className="text-sm text-[#6B6B6B]">
            Manage the "What We Create / Our Specialties" section
          </p>
        </div>
        <Button onClick={() => openDialog()} className="bg-[#2D2D2D] hover:bg-[#C4A962]">
          <Plus className="w-4 h-4 mr-2" />
          Add Specialty
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#C4A962]" />
        </div>
      ) : specialties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-sm border border-dashed border-[#E8E6E3]">
          <p className="text-[#6B6B6B] mb-4">No specialties yet</p>
          <Button onClick={() => openDialog()} variant="outline">
            Add Your First Specialty
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {specialties.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-sm border border-[#E8E6E3] overflow-hidden group"
            >
              <div className="aspect-video bg-[#E8E6E3] relative overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#6B6B6B]/30">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#2D2D2D] mb-1">{item.title}</h4>
                    <p className="text-xs text-[#6B6B6B] line-clamp-2">
                      {item.description}
                    </p>
                    <p className="text-xs text-[#C4A962] mt-1">
                      {categories.find((c) => c.value === item.category)?.label}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
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
                        if (confirm("Delete this specialty?")) {
                          deleteSpecialty.mutate(item.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editing ? "Edit Specialty" : "Add Specialty"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Wedding Signage"
              />
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                placeholder="Brief description of this specialty"
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
              <p className="text-xs text-[#6B6B6B]">
                Portfolio category this card will link to
              </p>
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUploader
                images={formData.image_url ? [formData.image_url] : []}
                onChange={(images) =>
                  setFormData({ ...formData, image_url: images[0] || "" })
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.visible}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, visible: checked })
                }
              />
              <Label>Visible on Homepage</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createSpecialty.isPending || updateSpecialty.isPending}
                className="bg-[#2D2D2D] hover:bg-[#C4A962]"
              >
                {createSpecialty.isPending || updateSpecialty.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editing ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}