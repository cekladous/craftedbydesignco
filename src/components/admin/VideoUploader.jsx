import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X, Video } from "lucide-react";

export default function VideoUploader({ videos = [], onChange }) {
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
      onChange([...videos, ...uploadedUrls]);
    } catch (error) {
      alert("Failed to upload video: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAdd = () => {
    if (urlInput.trim()) {
      onChange([...videos, urlInput.trim()]);
      setUrlInput("");
    }
  };

  const handleRemove = (index) => {
    onChange(videos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="border-2 border-dashed border-[#E8E6E3] rounded-lg p-6 text-center hover:border-[#C4A962] transition-colors">
        <label htmlFor={uploadId} className="cursor-pointer block">
          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-[#C4A962]" />
                <p className="text-sm text-[#6B6B6B]">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[#C4A962]/10 flex items-center justify-center">
                  <Video className="w-6 h-6 text-[#C4A962]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2D2D2D] mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-[#6B6B6B]">
                    MP4 video files up to 100MB
                  </p>
                </div>
              </>
            )}
          </div>
          <input
            id={uploadId}
            type="file"
            accept="video/mp4,.mp4"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            multiple
          />
        </label>
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or paste video URL..."
          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlAdd())}
          className="flex-1"
        />
        <Button type="button" onClick={handleUrlAdd} variant="outline" size="sm">
          Add
        </Button>
      </div>

      {/* Video List */}
      {videos.length > 0 && (
        <div className="space-y-2">
          {videos.map((video, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-[#E8E6E3]/30 rounded-sm"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Video className="w-4 h-4 text-[#C4A962] flex-shrink-0" />
                <span className="text-sm text-[#6B6B6B] truncate">{video}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1 hover:bg-[#2D2D2D]/10 rounded transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}