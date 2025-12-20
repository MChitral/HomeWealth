import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { PlusCircle } from "lucide-react";
import { Link } from "wouter";

interface EmptyWidgetStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function EmptyWidgetState({
  title,
  description,
  actionLabel = "Add Data",
  actionUrl,
  icon: Icon = PlusCircle,
}: EmptyWidgetStateProps) {
  const ActionButton = (
    <Button variant="outline" size="sm" className="w-full mt-4">
      <Icon className="w-4 h-4 mr-2" />
      {actionLabel}
    </Button>
  );

  return (
    <Card className="h-full border-dashed border-2 bg-muted/10 hover:bg-muted/20 transition-colors duration-200">
      <CardHeader>
        <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center py-8">
        <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
          <Icon className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-balance text-muted-foreground mb-4 max-w-[240px] leading-relaxed">
          {description}
        </p>

        {actionUrl ? (
          <Link href={actionUrl}>{ActionButton}</Link>
        ) : (
          <div className="opacity-50 pointer-events-none">{ActionButton}</div>
        )}
      </CardContent>
    </Card>
  );
}
