import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Loader2, 
  FileIcon,
  FileText,
  Image as ImageIcon,
  File,
  X
} from "lucide-react";

const getFileIcon = (mimeType) => {
  if (!mimeType) return File;
  if (mimeType.startsWith('image/')) return ImageIcon;
  if (mimeType.includes('pdf')) return FileText;
  return FileIcon;
};

export default function AttachmentSelector({ selectedIds = [], onChange, open, onOpenChange }) {
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["uploaded-files"],
    queryFn: () => base44.entities.UploadedFile.list("-created_date"),
  });

  const handleToggle = (fileId) => {
    if (selectedIds.includes(fileId)) {
      onChange(selectedIds.filter(id => id !== fileId));
    } else {
      onChange([...selectedIds, fileId]);
    }
  };

  const selectedFiles = files.filter(f => selectedIds.includes(f.id));

  return (
    <>
      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedFiles.map((file) => {
            const Icon = getFileIcon(file.mime_type);
            return (
              <Badge
                key={file.id}
                variant="secondary"
                className="bg-[#E8E6E3] text-[#2D2D2D] pr-1 flex items-center gap-1"
              >
                <Icon className="w-3 h-3" />
                {file.label || file.filename}
                <button
                  type="button"
                  onClick={() => handleToggle(file.id)}
                  className="ml-1 p-0.5 hover:bg-[#2D2D2D]/10 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      <Button type="button" variant="outline" onClick={() => onOpenChange(true)}>
        {selectedFiles.length > 0 ? 'Manage Attachments' : 'Add Attachments'}
      </Button>

      {/* Selection Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Attachments</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#C4A962]" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <FileIcon className="w-8 h-8 mx-auto text-[#E8E6E3] mb-2" />
              <p className="text-[#6B6B6B] text-sm">No files uploaded yet</p>
              <p className="text-xs text-[#6B6B6B]/60 mt-1">
                Go to the Attachments tab to upload files
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => {
                const Icon = getFileIcon(file.mime_type);
                const isSelected = selectedIds.includes(file.id);
                return (
                  <div
                    key={file.id}
                    className={`p-3 rounded-sm border cursor-pointer transition-colors ${
                      isSelected ? 'border-[#C4A962] bg-[#C4A962]/5' : 'border-[#E8E6E3] hover:border-[#C4A962]/50'
                    }`}
                    onClick={() => handleToggle(file.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isSelected} onCheckedChange={() => handleToggle(file.id)} />
                      <div className="w-10 h-10 rounded-sm bg-[#E8E6E3] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#6B6B6B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#2D2D2D] text-sm truncate">
                          {file.label || file.filename}
                        </p>
                        <p className="text-xs text-[#6B6B6B]">{file.filename}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}