import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, GripVertical } from "lucide-react";

export default function ExperienceManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    visible: true,
    display_order: 0,
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-experience"],
    queryFn: () => base44.entities.ExperienceItem.list("display_order"),
  });

  const createItem = useMutation({
    mutationFn: (data) => base44.entities.ExperienceItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experience"] });
      queryClient.invalidateQueries({ queryKey: ["experience-items"] });
      closeDialog();
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ExperienceItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experience"] });
      queryClient.invalidateQueries({ queryKey: ["experience-items"] });
      closeDialog();
    },
  });

  const deleteItem = useMutation({
    mutationFn: (id) => base44.entities.ExperienceItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experience"] });
      queryClient.invalidateQueries({ queryKey: ["experience-items"] });
    },
  });

  const openDialog = (item = null) => {
    if (item) {
      setEditing(item);
      setFormData(item);
    } else {
      setEditing(null);
      setFormData({
        text: "",
        visible: true,
        display_order: items.length,
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setFormData({
      text: "",
      visible: true,
      display_order: 0,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      updateItem.mutate({ id: editing.id, data: formData });
    } else {
      createItem.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-[#2D2D2D] mb-1">
            Experience / Who We Serve
          </h3>
          <p className="text-sm text-[#6B6B6B]">
            Manage the bullet points on the About page
          </p>
        </div>
        <Button onClick={() => openDialog()} className="bg-[#2D2D2D] hover:bg-[#C4A962]">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#C4A962]" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-sm border border-dashed border-[#E8E6E3]">
          <p className="text-[#6B6B6B] mb-4">No experience items yet</p>
          <Button onClick={() => openDialog()} variant="outline">
            Add Your First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-sm border border-[#E8E6E3] p-4 flex items-center gap-3"
            >
              <GripVertical className="w-5 h-5 text-[#E8E6E3] cursor-grab" />
              <div className="flex-1 min-w-0">
                <p className="text-[#2D2D2D] truncate">{item.text}</p>
              </div>
              <div className="flex gap-1">
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
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editing ? "Edit Experience Item" : "Add Experience Item"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Text *</Label>
              <Input
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                required
                placeholder="e.g., Brides & wedding planners seeking unique signage"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.visible}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, visible: checked })
                }
              />
              <Label>Visible on About Page</Label>
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
                {createItem.isPending || updateItem.isPending ? (
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