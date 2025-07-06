import { Loader2 } from "lucide-react";
import React from "react";

const SkeletonCard = () => {
  return (
    <div className="absolute inset-0 bg-card border border-border rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
};

export default SkeletonCard;
