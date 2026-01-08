import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Loader2, 
  Upload, 
  FileIcon, 
  Trash2, 
  Download,
  FileText,
  Image as ImageIcon,
  File
} from "lucide-react";

const getFileIcon = (mimeType) => {
  if (!mimeType) return File;
  if (mimeType.startsWith('image/')) return ImageIcon;
  if (mimeType.includes('pdf')) return FileText;
  return FileIcon;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default function AttachmentsManager() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [label, setLabel] = useState("");

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["uploaded-files"],
    queryFn: () => base44.entities.UploadedFile.list("-created_date"),
  });

  const createFile = useMutation({
    mutationFn: (data) => base44.entities.UploadedFile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploaded-files"] });
    },
  });

  const updateFile = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UploadedFile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploaded-files"] });
      setEditDialog(false);
      setEditingFile(null);
    },
  });

  const deleteFile = useMutation({
    mutationFn: (id) => base44.entities.UploadedFile.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["uploaded-files"] }),
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await createFile.mutateAsync({
        file_url,
        filename: file.name,
        mime_type: file.type,
        size: file.size,
        label: ""
      });

      e.target.value = '';
    } catch (error) {
      alert("Failed to upload file: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const openEditDialog = (file) => {
    setEditingFile(file);
    setLabel(file.label || "");
    setEditDialog(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (editingFile) {
      updateFile.mutate({
        id: editingFile.id,
        data: { label }
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif text-[#2D2D2D] mb-1">File Attachments</h2>
          <p className="text-sm text-[#6B6B6B]">Upload and manage files (PDFs, images, etc.)</p>
        </div>
        <div>
          <label
            htmlFor="attachment-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D2D2D] text-white rounded-md cursor-pointer hover:bg-[#C4A962] transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload File
              </>
            )}
          </label>
          <input
            id="attachment-upload"
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#C4A962]" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-sm">
          <FileIcon className="w-12 h-12 mx-auto text-[#E8E6E3] mb-4" />
          <p className="text-[#6B6B6B] mb-2">No files uploaded yet</p>
          <p className="text-sm text-[#6B6B6B]/60">Upload PDFs, images, or other files to attach to portfolio items</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => {
            const Icon = getFileIcon(file.mime_type);
            return (
              <div
                key={file.id}
                className="bg-white p-4 rounded-sm shadow-sm flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-sm bg-[#E8E6E3] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-[#6B6B6B]" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#2D2D2D] truncate">
                    {file.label || file.filename}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#6B6B6B] mt-1">
                    <span>{file.filename}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                    {file.mime_type && (
                      <>
                        <span>•</span>
                        <span>{file.mime_type.split('/')[1]?.toUpperCase()}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(file.file_url, '_blank')}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(file)}
                    title="Edit label"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Delete "${file.filename}"?`)) {
                        deleteFile.mutate(file.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Label Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Label</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Label (optional)</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Product Catalog, Price Sheet..."
              />
              <p className="text-xs text-[#6B6B6B]">
                A friendly name for this file
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateFile.isPending} className="bg-[#2D2D2D] hover:bg-[#C4A962]">
                {updateFile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}