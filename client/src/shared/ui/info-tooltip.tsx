import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export interface InfoTooltipProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function InfoTooltip({ content, side = "top", className = "" }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center justify-center rounded-full hover:bg-accent transition-colors ${className}`}
          onClick={(e) => e.preventDefault()}
          aria-label="More information"
        >
          <Info className="h-4 w-4 text-muted-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

