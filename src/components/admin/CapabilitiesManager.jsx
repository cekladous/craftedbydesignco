import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { Pencil, Trash2, Plus, Loader2, Image as ImageIcon } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

const iconOptions = ["Sparkles", "Layers", "Package", "Scissors", "Image"];

export default function CapabilitiesManager() {
  const queryClient = useQueryClient();
  const [capDialog, setCapDialog] = useState(false);
  const [matDialog, setMatDialog] = useState(false);
  const [editingCap, setEditingCap] = useState(null);
  const [editingMat, setEditingMat] = useState(null);
  const [capForm, setCapForm] = useState({ title: "", description: "", icon_name: "Sparkles", image_url: "", visible: true });
  const [matForm, setMatForm] = useState({ name: "", description: "", types: [], image_url: "", visible: true });
  const [newType, setNewType] = useState("");

  const { data: capabilities = [], isLoading: capsLoading } = useQuery({
    queryKey: ["admin-capabilities"],
    queryFn: () => base44.entities.Capability.list("display_order"),
  });

  const { data: materials = [], isLoading: matsLoading } = useQuery({
    queryKey: ["admin-materials"],
    queryFn: () => base44.entities.Material.list("display_order"),
  });

  const createCap = useMutation({
    mutationFn: (data) => base44.entities.Capability.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-capabilities"] });
      queryClient.invalidateQueries({ queryKey: ["capabilities"] });
      setCapDialog(false);
    },
  });

  const updateCap = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Capability.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-capabilities"] });
      queryClient.invalidateQueries({ queryKey: ["capabilities"] });
      setCapDialog(false);
    },
  });

  const deleteCap = useMutation({
    mutationFn: (id) => base44.entities.Capability.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-capabilities"] });
      queryClient.invalidateQueries({ queryKey: ["capabilities"] });
    },
  });

  const createMat = useMutation({
    mutationFn: (data) => base44.entities.Material.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-materials"] });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setMatDialog(false);
    },
  });

  const updateMat = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Material.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-materials"] });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setMatDialog(false);
    },
  });

  const deleteMat = useMutation({
    mutationFn: (id) => base44.entities.Material.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-materials"] });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });

  const openCapDialog = (cap = null) => {
    if (cap) {
      setEditingCap(cap);
      setCapForm(cap);
    } else {
      setEditingCap(null);
      setCapForm({ title: "", description: "", icon_name: "Sparkles", image_url: "", visible: true, display_order: capabilities.length });
    }
    setCapDialog(true);
  };

  const openMatDialog = (mat = null) => {
    if (mat) {
      setEditingMat(mat);
      setMatForm(mat);
    } else {
      setEditingMat(null);
      setMatForm({ name: "", description: "", types: [], image_url: "", visible: true, display_order: materials.length });
    }
    setMatDialog(true);
  };

  const handleCapSubmit = (e) => {
    e.preventDefault();
    if (editingCap) {
      updateCap.mutate({ id: editingCap.id, data: capForm });
    } else {
      createCap.mutate(capForm);
    }
  };

  const handleMatSubmit = (e) => {
    e.preventDefault();
    if (editingMat) {
      updateMat.mutate({ id: editingMat.id, data: matForm });
    } else {
      createMat.mutate(matForm);
    }
  };

  const addType = () => {
    if (newType.trim()) {
      setMatForm({ ...matForm, types: [...(matForm.types || []), newType.trim()] });
      setNewType("");
    }
  };

  const removeType = (idx) => {
    setMatForm({ ...matForm, types: matForm.types.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-12">
      {/* Capabilities Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-serif text-[#2D2D2D] mb-1">Capabilities</h2>
            <p className="text-sm text-[#6B6B6B]">Services shown on the Capabilities page</p>
          </div>
          <Button onClick={() => openCapDialog()} className="bg-[#2D2D2D] hover:bg-[#C4A962]">
            <Plus className="w-4 h-4 mr-2" /> Add Capability
          </Button>
        </div>

        {capsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#C4A962]" />
          </div>
        ) : (
          <div className="grid gap-4">
            {capabilities.map((cap) => (
              <div key={cap.id} className="bg-white p-4 rounded-sm shadow-sm flex items-center gap-4">
                {cap.image_url ? (
                  <div className="w-24 h-16 rounded-sm overflow-hidden bg-[#E8E6E3] flex-shrink-0">
                    <img src={cap.image_url} alt={cap.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-16 rounded-sm bg-[#E8E6E3] flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-[#6B6B6B]/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#2D2D2D]">{cap.title}</h3>
                  <p className="text-sm text-[#6B6B6B] truncate">{cap.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openCapDialog(cap)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirm("Delete this capability?") && deleteCap.mutate(cap.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Materials Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-serif text-[#2D2D2D] mb-1">Materials</h2>
            <p className="text-sm text-[#6B6B6B]">Materials shown on the Capabilities page</p>
          </div>
          <Button onClick={() => openMatDialog()} className="bg-[#2D2D2D] hover:bg-[#C4A962]">
            <Plus className="w-4 h-4 mr-2" /> Add Material
          </Button>
        </div>

        {matsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#C4A962]" />
          </div>
        ) : (
          <div className="grid gap-4">
            {materials.map((mat) => (
              <div key={mat.id} className="bg-white p-4 rounded-sm shadow-sm flex items-center gap-4">
                {mat.image_url ? (
                  <div className="w-24 h-32 rounded-sm overflow-hidden bg-[#E8E6E3] flex-shrink-0">
                    <img src={mat.image_url} alt={mat.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-32 rounded-sm bg-[#E8E6E3] flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-[#6B6B6B]/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#2D2D2D]">{mat.name}</h3>
                  <p className="text-sm text-[#6B6B6B] mb-1">{mat.description}</p>
                  <p className="text-xs text-[#6B6B6B]/60">{mat.types?.join(" • ")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openMatDialog(mat)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirm("Delete this material?") && deleteMat.mutate(mat.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Capability Dialog */}
      <Dialog open={capDialog} onOpenChange={setCapDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingCap ? "Edit Capability" : "Add Capability"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCapSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={capForm.title}
                onChange={(e) => setCapForm({ ...capForm, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={capForm.description}
                onChange={(e) => setCapForm({ ...capForm, description: e.target.value })}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={capForm.icon_name} onValueChange={(value) => setCapForm({ ...capForm, icon_name: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Image (Optional)</Label>
              <ImageUploader
                images={capForm.image_url ? [capForm.image_url] : []}
                onChange={(imgs) => setCapForm({ ...capForm, image_url: imgs[0] || "" })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={capForm.visible}
                onCheckedChange={(checked) => setCapForm({ ...capForm, visible: checked })}
              />
              <Label>Visible on Capabilities page</Label>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setCapDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={createCap.isPending || updateCap.isPending} className="bg-[#2D2D2D] hover:bg-[#C4A962]">
                {(createCap.isPending || updateCap.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCap ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Material Dialog */}
      <Dialog open={matDialog} onOpenChange={setMatDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingMat ? "Edit Material" : "Add Material"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMatSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={matForm.name}
                onChange={(e) => setMatForm({ ...matForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={matForm.description}
                onChange={(e) => setMatForm({ ...matForm, description: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Types / Variations</Label>
              <div className="flex gap-2">
                <Input
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="e.g., Clear, Frosted..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addType())}
                />
                <Button type="button" onClick={addType} variant="outline">Add</Button>
              </div>
              {matForm.types?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {matForm.types.map((type, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-[#E8E6E3] text-[#2D2D2D] pr-1">
                      {type}
                      <button type="button" onClick={() => removeType(idx)} className="ml-1 p-0.5 hover:bg-[#2D2D2D]/10 rounded">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Image (Optional)</Label>
              <ImageUploader
                images={matForm.image_url ? [matForm.image_url] : []}
                onChange={(imgs) => setMatForm({ ...matForm, image_url: imgs[0] || "" })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={matForm.visible}
                onCheckedChange={(checked) => setMatForm({ ...matForm, visible: checked })}
              />
              <Label>Visible on Capabilities page</Label>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setMatDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={createMat.isPending || updateMat.isPending} className="bg-[#2D2D2D] hover:bg-[#C4A962]">
                {(createMat.isPending || updateMat.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : editingMat ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}