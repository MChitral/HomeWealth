import { ReactNode } from "react";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
}

export function FormField({
  label,
  error,
  required,
  hint,
  children,
  className,
  labelClassName,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className={labelClassName}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
