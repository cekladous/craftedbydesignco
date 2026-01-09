import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  MessageSquare,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileImage,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categories = [
  { value: "wedding", label: "Wedding" },
  { value: "baby", label: "Baby & Milestones" },
  { value: "corporate", label: "Corporate" },
  { value: "home", label: "Home Décor" },
  { value: "gifts", label: "Personalized Gifts" },
  { value: "specialty", label: "Specialty Items" },
  { value: "other", label: "Other" },
];

const categoryLabels = categories.reduce((acc, cat) => {
  acc[cat.value] = cat.label;
  return acc;
}, {});

const inquiryStatuses = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  { value: "quoted", label: "Quoted", color: "bg-purple-100 text-purple-800" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-800" },
];

export default function ContactSubmissionsManager() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["contact-submissions"],
    queryFn: () => base44.entities.Inquiry.list("-created_date"),
  });

  const updateInquiry = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Inquiry.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact-submissions"] }),
  });

  const deleteInquiry = useMutation({
    mutationFn: (id) => base44.entities.Inquiry.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact-submissions"] }),
  });

  const toggleRead = (inquiry) => {
    updateInquiry.mutate({
      id: inquiry.id,
      data: { read: !inquiry.read },
    });
  };

  const openNotesDialog = (inquiry) => {
    setSelectedInquiry(inquiry);
    setNotes(inquiry.notes || "");
    setNotesDialogOpen(true);
  };

  const saveNotes = () => {
    if (!selectedInquiry) return;
    updateInquiry.mutate(
      { id: selectedInquiry.id, data: { notes } },
      {
        onSuccess: () => {
          setNotesDialogOpen(false);
          setSelectedInquiry(null);
          setNotes("");
        },
      }
    );
  };

  const unreadCount = inquiries.filter((i) => !i.read).length;

  const filteredInquiries = statusFilter === "all" 
    ? inquiries 
    : inquiries.filter(i => i.status === statusFilter);

  const exportToExcel = () => {
    const headers = ["Date", "Name", "Email", "Phone", "Category", "Status", "Event Date", "Message", "Notes"];
    const rows = filteredInquiries.map(inq => [
      new Date(inq.created_date).toLocaleDateString(),
      inq.name,
      inq.email,
      inq.phone || "",
      categoryLabels[inq.category] || inq.category || "",
      inquiryStatuses.find(s => s.value === inq.status)?.label || inq.status,
      inq.event_date || "",
      inq.message?.replace(/\n/g, " ") || "",
      inq.notes?.replace(/\n/g, " ") || ""
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `contact-submissions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#C4A962]" />
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-sm">
        <MessageSquare className="w-12 h-12 mx-auto text-[#E8E6E3] mb-4" />
        <p className="text-[#6B6B6B]">No contact submissions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[#6B6B6B]">
          {inquiries.length} submissions
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-[#C4A962] text-white">
              {unreadCount} unread
            </Badge>
          )}
        </p>
        <Button
          variant="outline"
          onClick={exportToExcel}
          disabled={filteredInquiries.length === 0}
          className="text-[#C4A962] border-[#C4A962] hover:bg-[#C4A962] hover:text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
          className={statusFilter === "all" ? "bg-[#2D2D2D]" : ""}
        >
          All ({inquiries.length})
        </Button>
        {inquiryStatuses.map((status) => (
          <Button
            key={status.value}
            variant={statusFilter === status.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status.value)}
            className={statusFilter === status.value ? "bg-[#2D2D2D]" : ""}
          >
            {status.label} ({inquiries.filter(i => i.status === status.value).length})
          </Button>
        ))}
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-sm">
          <MessageSquare className="w-12 h-12 mx-auto text-[#E8E6E3] mb-4" />
          <p className="text-[#6B6B6B]">
            No {statusFilter === "all" ? "" : inquiryStatuses.find(s => s.value === statusFilter)?.label.toLowerCase()} submissions
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInquiries.map((inquiry) => (
          <motion.div
            key={inquiry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-sm shadow-sm overflow-hidden transition-all ${
              inquiry.read ? "bg-white" : "bg-[#C4A962]/5 border-l-4 border-[#C4A962]"
            }`}
          >
            {/* Header - Always visible */}
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className={`font-medium ${inquiry.read ? "text-[#6B6B6B]" : "text-[#2D2D2D] font-semibold"}`}>
                      {inquiry.name}
                    </h3>
                    <Badge className={inquiryStatuses.find((s) => s.value === inquiry.status)?.color}>
                      {inquiryStatuses.find((s) => s.value === inquiry.status)?.label}
                    </Badge>
                    {!inquiry.read && (
                      <Badge className="bg-[#C4A962] text-white">Unread</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B6B6B]">
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

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleRead(inquiry)}
                    title={inquiry.read ? "Mark as unread" : "Mark as read"}
                  >
                    {inquiry.read ? (
                      <Eye className="w-4 h-4 text-[#6B6B6B]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[#C4A962]" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setExpandedId(expandedId === inquiry.id ? null : inquiry.id)
                    }
                  >
                    {expandedId === inquiry.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Category badge */}
              {inquiry.category && (
                <p className="text-xs text-[#C4A962] uppercase tracking-widest mb-2">
                  {categories.find((c) => c.value === inquiry.category)?.label}
                </p>
              )}

              {/* Expanded content */}
              {expandedId === inquiry.id && (
                <div className="space-y-4 mt-4 pt-4 border-t border-[#E8E6E3]">
                  {/* Message */}
                  <div>
                    <h4 className="text-xs tracking-widest uppercase text-[#2D2D2D] mb-2">
                      Message
                    </h4>
                    <p className="text-[#6B6B6B] whitespace-pre-wrap text-sm">
                      {inquiry.message}
                    </p>
                  </div>

                  {/* Vision Images */}
                  {inquiry.vision_images?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileImage className="w-4 h-4 text-[#C4A962]" />
                        <h4 className="text-xs tracking-widest uppercase text-[#2D2D2D]">
                          Inspiration Photos ({inquiry.vision_images.length})
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {inquiry.vision_images.map((img, idx) => (
                          <a
                            key={idx}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square rounded-sm overflow-hidden bg-[#E8E6E3] hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={img}
                              alt={`Inspiration ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {inquiry.notes && (
                    <div className="bg-[#E8E6E3]/30 p-3 rounded-sm">
                      <h4 className="text-xs tracking-widest uppercase text-[#2D2D2D] mb-2">
                        Admin Notes
                      </h4>
                      <p className="text-sm text-[#6B6B6B] whitespace-pre-wrap">
                        {inquiry.notes}
                      </p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs text-[#6B6B6B]/60">
                    Received: {new Date(inquiry.created_date).toLocaleString()}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                   <select
                     value={inquiry.status}
                     onChange={(e) => updateInquiry.mutate({ id: inquiry.id, data: { status: e.target.value } })}
                     className="px-3 py-1.5 text-sm border border-[#E8E6E3] rounded-md bg-white text-[#2D2D2D] focus:border-[#C4A962] focus:outline-none focus:ring-1 focus:ring-[#C4A962]"
                   >
                     {inquiryStatuses.map((status) => (
                       <option key={status.value} value={status.value}>
                         {status.label}
                       </option>
                     ))}
                   </select>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => openNotesDialog(inquiry)}
                     className="text-[#2D2D2D] border-[#E8E6E3]"
                   >
                     {inquiry.notes ? "Edit Notes" : "Add Notes"}
                   </Button>
                   <Button
                     variant="destructive"
                     size="sm"
                     onClick={() => {
                       if (confirm("Delete this submission?")) {
                         deleteInquiry.mutate(inquiry.id);
                       }
                     }}
                   >
                     <Trash2 className="w-4 h-4 mr-1" />
                     Delete
                   </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          ))}
        </div>
      )}

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Notes - {selectedInquiry?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this inquiry..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setNotesDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={saveNotes}
                disabled={updateInquiry.isPending}
                className="bg-[#2D2D2D] hover:bg-[#C4A962]"
              >
                {updateInquiry.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}