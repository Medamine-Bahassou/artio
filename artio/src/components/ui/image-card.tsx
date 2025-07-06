"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Eye } from "lucide-react";
import SkeletonCard from "./skeleton-card";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ImageCardProps {
  url: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ url }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [url]);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `generated_image_${Date.now()}.png`; // Dynamic filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // Clean up the object URL
    } catch (error) {
      console.error("Failed to download image:", error);
      alert("Failed to download image. Please try again.");
    }
  };

  return (
    <div className="relative group aspect-square rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
      {!isImageLoaded && <SkeletonCard />}

      {/* Hidden image to trigger onLoad */}
      {url !== "placeholder" && (
        <img
          src={url}
          alt="Preload"
          className="hidden"
          onLoad={() => setIsImageLoaded(true)}
        />
      )}

      {/* Display the image only when loaded, or the skeleton if not */}
      {isImageLoaded && url !== "placeholder" ? (
        <img
          src={url}
          alt="Generated image"
          className="w-full h-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : null}
      {isImageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
                  <Eye className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0">
                <DialogTitle>
                  <VisuallyHidden>Generated Image</VisuallyHidden>
                </DialogTitle>
                <img
                  src={url}
                  alt="Selected image"
                  className="w-full h-auto rounded-lg"
                />
              </DialogContent>
            </Dialog>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
              onClick={() => handleDownload(url)}
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCard;
