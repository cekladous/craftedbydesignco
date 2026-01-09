import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  GripVertical,
  Star,
  Loader2,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

const emptyTestimonial = {
  customer_name: "",
  quote: "",
  image_url: "",
  link_url: "",
  link_text: "",
  featured: false,
  visible: true,
  display_order: 0,
};

export default function TestimonialsManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyTestimonial);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: () => base44.entities.Testimonial.list("display_order"),
  });

  const createItem = useMutation({
    mutationFn: (data) => base44.entities.Testimonial.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      closeDialog();
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Testimonial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      closeDialog();
    },
  });

  const deleteItem = useMutation({
    mutationFn: (id) => base44.entities.Testimonial.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] }),
  });

  const reorderItems = useMutation({
    mutationFn: async (reorderedItems) => {
      for (let i = 0; i < reorderedItems.length; i++) {
        await base44.entities.Testimonial.update(reorderedItems[i].id, {
          display_order: i
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] }),
  });

  const openDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ ...emptyTestimonial, display_order: testimonials.length });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData(emptyTestimonial);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateItem.mutate({ id: editingItem.id, data: formData });
    } else {
      createItem.mutate(formData);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(testimonials);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);

    queryClient.setQueryData(["admin-testimonials"], items);
    reorderItems.mutate(items);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#6B6B6B]">{testimonials.length} testimonials</p>
        <Button
          onClick={() => openDialog()}
          className="bg-[#2D2D2D] hover:bg-[#C4A962]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#C4A962]" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-sm">
          <MessageSquare className="w-12 h-12 mx-auto text-[#E8E6E3] mb-4" />
          <p className="text-[#6B6B6B] mb-4">No testimonials yet</p>
          <Button
            onClick={() => openDialog()}
            className="bg-[#2D2D2D] hover:bg-[#C4A962]"
          >
            Add Your First Testimonial
          </Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="testimonials">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid gap-4"
              >
                {testimonials.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white p-4 rounded-sm shadow-sm flex items-start gap-4 ${
                          snapshot.isDragging ? "shadow-lg" : ""
                        }`}
                      >
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="w-5 h-5 text-[#C4A962] cursor-grab active:cursor-grabbing mt-1" />
                        </div>

                        {item.image_url && (
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E8E6E3] flex-shrink-0">
                            <img
                              src={item.image_url}
                              alt={item.customer_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-[#2D2D2D]">
                              {item.customer_name}
                            </h3>
                            {item.featured && (
                              <Star className="w-4 h-4 text-[#C4A962] fill-current" />
                            )}
                            {item.link_url && (
                              <ExternalLink className="w-3 h-3 text-[#6B6B6B]" />
                            )}
                          </div>
                          <p className="text-sm text-[#6B6B6B] line-clamp-2">
                            "{item.quote}"
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
                              if (confirm("Delete this testimonial?")) {
                                deleteItem.mutate(item.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingItem ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Customer Name *</Label>
              <Input
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                required
                placeholder="Jane Smith"
              />
            </div>

            <div className="space-y-2">
              <Label>Testimonial *</Label>
              <Textarea
                value={formData.quote}
                onChange={(e) =>
                  setFormData({ ...formData, quote: e.target.value })
                }
                required
                rows={4}
                placeholder="The quality was amazing and the turnaround time was perfect..."
              />
            </div>

            <div className="space-y-2">
              <Label>Customer Photo (Optional)</Label>
              <ImageUploader
                images={formData.image_url ? [formData.image_url] : []}
                onChange={(imgs) =>
                  setFormData({ ...formData, image_url: imgs[0] || "" })
                }
              />
              <p className="text-xs text-[#6B6B6B]">
                A photo adds credibility to the testimonial
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Link URL (Optional)</Label>
                <Input
                  value={formData.link_url}
                  onChange={(e) =>
                    setFormData({ ...formData, link_url: e.target.value })
                  }
                  placeholder="https://instagram.com/customer"
                />
              </div>
              <div className="space-y-2">
                <Label>Link Text (Optional)</Label>
                <Input
                  value={formData.link_text}
                  onChange={(e) =>
                    setFormData({ ...formData, link_text: e.target.value })
                  }
                  placeholder="View Wedding"
                />
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, featured: checked })
                  }
                />
                <Label>Featured on Homepage</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.visible}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, visible: checked })
                  }
                />
                <Label>Visible</Label>
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
                {createItem.isPending || updateItem.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingItem ? (
                  "Update"
                ) : (
                  "Add Testimonial"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}