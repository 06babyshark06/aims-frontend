import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">AIMS đang xử lý...</p>
      </div>
    </div>
  );
}