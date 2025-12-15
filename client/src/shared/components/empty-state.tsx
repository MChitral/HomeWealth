import { ReactNode } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import type { LucideIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface EmptyStateItem {
  number?: number;
  title: string;
  description: string;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  items?: EmptyStateItem[];
  testId?: string;
  className?: string;
  variant?: "default" | "centered" | "minimal";
}

export function EmptyState({
  icon: Icon = AlertCircle,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  items,
  testId,
  className,
  variant = "default",
}: EmptyStateProps) {
  const ActionButton = actionHref ? (
    <Link href={actionHref} aria-label={actionLabel}>
      <Button data-testid={testId} aria-label={actionLabel}>
        {actionLabel}
      </Button>
    </Link>
  ) : actionLabel && onAction ? (
    <Button onClick={onAction} data-testid={testId} aria-label={actionLabel}>
      {actionLabel}
    </Button>
  ) : null;

  if (variant === "minimal") {
    return (
      <div className={cn("text-center space-y-4", className)}>
        <Icon className="h-12 w-12 mx-auto text-muted-foreground" aria-hidden="true" />
        <div>
          <h3 className="text-lg font-semibold mb-2" aria-label={title}>
            {title}
          </h3>
          <p className="text-muted-foreground mb-4" aria-label={description}>
            {description}
          </p>
          {ActionButton}
        </div>
      </div>
    );
  }

  if (variant === "centered") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8",
          className
        )}
      >
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
          <Icon className="h-10 w-10 text-primary" aria-hidden="true" />
        </div>
        <div className="text-center max-w-md space-y-2">
          <h2 className="text-2xl font-semibold" data-testid={testId} aria-label={title}>
            {title}
          </h2>
          <p className="text-muted-foreground" aria-label={description}>
            {description}
          </p>
        </div>
        {items && items.length > 0 && (
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-lg">What you can do:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  {item.number && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">{item.number}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {ActionButton}
      </div>
    );
  }

  // Default variant (card-based)
  return (
    <Card className={cn("bg-accent/10 border-dashed", className)}>
      <CardContent className="py-16 text-center space-y-4">
        <Icon className="h-12 w-12 mx-auto text-muted-foreground" aria-hidden="true" />
        <div>
          <h3 className="text-lg font-semibold mb-2" aria-label={title}>
            {title}
          </h3>
          <p className="text-muted-foreground mb-4" aria-label={description}>
            {description}
          </p>
          {ActionButton}
        </div>
      </CardContent>
    </Card>
  );
}
