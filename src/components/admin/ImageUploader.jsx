import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";

export default function ImageUploader({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url;
      
      // Add the new image URL to the array
      onChange([...images, fileUrl]);
    } catch (error) {
      setUploadError(error.message || "Upload failed");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="relative"
          disabled={uploading}
          onClick={() => document.getElementById("image-upload-input")?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </>
          )}
        </Button>
        <input
          id="image-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <span className="text-xs text-[#6B6B6B]">
          Max 5MB • JPG, PNG, WEBP
        </span>
      </div>

      {uploadError && (
        <p className="text-sm text-red-500">{uploadError}</p>
      )}

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-sm overflow-hidden group bg-[#E8E6E3]"
            >
              <img
                src={img}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, index - 1)}
                    className="h-8 w-8 p-0"
                  >
                    ←
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
                {index < images.length - 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, index + 1)}
                    className="h-8 w-8 p-0"
                  >
                    →
                  </Button>
                )}
              </div>
              
              {/* Image order badge */}
              <div className="absolute top-2 left-2 bg-white/90 text-[#2D2D2D] text-xs font-medium px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-[#E8E6E3] rounded-sm p-8 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-[#E8E6E3] mb-3" />
          <p className="text-sm text-[#6B6B6B] mb-2">No images uploaded</p>
          <p className="text-xs text-[#6B6B6B]/60">
            Click "Upload Image" to add photos
          </p>
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-[#6B6B6B]">
          {images.length} image{images.length !== 1 ? "s" : ""} • First image is the cover photo
        </p>
      )}
    </div>
  );
}