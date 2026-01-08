import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X, ImagePlus } from "lucide-react";

export default function ImageUploader({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const uploadId = React.useId();

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
      onChange([...images, ...uploadedUrls]);
    } catch (error) {
      alert("Failed to upload image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAdd = () => {
    if (urlInput.trim()) {
      onChange([...images, urlInput.trim()]);
      setUrlInput("");
    }
  };

  const handleRemove = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleReorder = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button - Prominent */}
      <div className="border-2 border-dashed border-[#E8E6E3] rounded-lg p-6 text-center hover:border-[#C4A962] transition-colors">
        <label
          htmlFor={uploadId}
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
                  <ImagePlus className="w-6 h-6 text-[#C4A962]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2D2D2D] mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-[#6B6B6B]">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </>
            )}
          </div>
          <input
            id={uploadId}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            multiple
          />
        </label>
      </div>

      {/* URL Input - Secondary Option */}
      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or paste image URL..."
          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlAdd())}
          className="flex-1"
        />
        <Button type="button" onClick={handleUrlAdd} variant="outline" size="sm">
          Add
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-sm overflow-hidden group bg-[#E8E6E3]"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", idx.toString())}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                handleReorder(fromIndex, idx);
              }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-1 left-1 bg-[#2D2D2D]/80 text-white text-xs px-2 py-0.5 rounded">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}
      {images.length > 1 && (
        <p className="text-xs text-[#6B6B6B] italic">
          Drag images to reorder • First image is the cover
        </p>
      )}
    </div>
  );
}