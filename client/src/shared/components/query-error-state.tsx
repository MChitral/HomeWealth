import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";

interface QueryErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function QueryErrorState({
  title = "Something went wrong",
  message = "We couldn't load your data. Please try again.",
  onRetry,
}: QueryErrorStateProps) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive" aria-hidden="true" />
        <div>
          <h3 className="text-lg font-semibold mb-2" aria-label={title}>
            {title}
          </h3>
          <p className="text-muted-foreground mb-4" aria-label={message}>
            {message}
          </p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry} data-testid="button-retry">
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
