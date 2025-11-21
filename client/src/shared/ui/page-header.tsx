import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  sticky?: boolean;
}

export function PageHeader({ title, description, actions, className, sticky = false }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4",
        sticky && "sticky top-0 bg-background z-10 py-4 -mt-4",
        className,
      )}
    >
      <div className="flex-1 min-w-[240px]">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

