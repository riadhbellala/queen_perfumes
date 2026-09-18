"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Recolored to this project's brand tokens instead of the hardcoded
// black/white the component ships with: outlined in --foreground at rest,
// the expanding circle and hover text/arrows use --primary/--primary-foreground
// so every CTA using this button picks up the gold brand fill automatically.
// `variant="light"` swaps the resting outline/text/arrows to white — needed
// for CTAs that sit on a dark photo (the homepage hero), where the default
// ink-toned outline would be nearly invisible.
export function FlowButton({
  text = "Button",
  variant = "dark",
}: {
  text?: string;
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";
  return (
    <button
      className={cn(
        "group relative flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] bg-transparent px-8 py-3 text-sm font-semibold cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-primary-foreground hover:rounded-[12px] active:scale-[0.95]",
        isLight ? "border-white/50 text-white" : "border-foreground/40 text-foreground"
      )}
    >
      {/* Left arrow (arr-2) */}
      <ArrowRight
        className={cn(
          "absolute w-4 h-4 left-[-25%] fill-none z-[9] group-hover:left-4 group-hover:stroke-primary-foreground transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isLight ? "stroke-white" : "stroke-foreground"
        )}
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
        {text}
      </span>

      {/* Circle */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-[50%] opacity-0 group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]"></span>

      {/* Right arrow (arr-1) */}
      <ArrowRight
        className={cn(
          "absolute w-4 h-4 right-4 fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-primary-foreground transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isLight ? "stroke-white" : "stroke-foreground"
        )}
      />
    </button>
  );
}
