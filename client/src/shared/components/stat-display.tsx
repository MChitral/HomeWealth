import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export type StatDisplayVariant = "default" | "success" | "warning" | "error";
export type StatDisplaySize = "sm" | "md" | "lg";

interface StatDisplayProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: StatDisplayVariant;
  size?: StatDisplaySize;
  testId?: string;
  children?: ReactNode;
  className?: string;
}

const variantStyles: Record<StatDisplayVariant, string> = {
  default: "",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
};

const sizeStyles: Record<StatDisplaySize, { label: string; value: string }> = {
  sm: {
    label: "text-xs",
    value: "text-lg",
  },
  md: {
    label: "text-sm",
    value: "text-2xl",
  },
  lg: {
    label: "text-base",
    value: "text-3xl",
  },
};

export function StatDisplay({
  label,
  value,
  subtitle,
  variant = "default",
  size = "md",
  testId,
  children,
  className,
}: StatDisplayProps) {
  const formattedValue = typeof value === "number" ? value.toLocaleString() : value;
  const variantClass = variantStyles[variant];
  const sizeClasses = sizeStyles[size];

  return (
    <div className={cn("space-y-2", className)}>
      <p className={cn("text-muted-foreground uppercase tracking-wide", sizeClasses.label)}>
        {label}
      </p>
      <p
        className={cn(
          "font-bold font-mono",
          sizeClasses.value,
          variantClass,
          variant === "default" && "text-foreground"
        )}
        data-testid={testId}
      >
        {formattedValue}
      </p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      {children}
    </div>
  );
}
