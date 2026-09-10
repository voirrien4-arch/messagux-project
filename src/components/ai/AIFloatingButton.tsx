
import { useState } from "react";
import { Droplets } from "lucide-react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { cn } from "@/utils";

interface AIFloatingButtonProps {
  className?: string;
}

export function AIFloatingButton({ className }: AIFloatingButtonProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const router = useRouter();

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setPosition({ x: clientX, y: clientY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!isDragging) {
      router.navigate({ to: "/ai-chat" });
    }
  };

  return (
    <button
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchEnd={handleDragEnd}
      onClick={handleClick}
      className={cn(
        "fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 animate-drop-bounce",
        className
      )}
      style={isDragging ? { transform: `translate(${position.x}px, ${position.y}px)` } : undefined}
    >
      <Droplets className="w-7 h-7 text-white" />
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-messagux-dark animate-pulse" />
    </button>
  );
}
