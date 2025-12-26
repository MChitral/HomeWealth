import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { mortgageApi, type PropertyValueUpdateResponse } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Home, CheckCircle2 } from "lucide-react";
import { mortgageQueryKeys } from "../api";
import { useToast } from "@/shared/hooks/use-toast";

interface PropertyValueUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mortgageId: string;
  currentPropertyPrice: number;
}

const sourceOptions = [
  { value: "appraisal", label: "Professional Appraisal" },
  { value: "assessment", label: "Property Assessment" },
  { value: "estimate", label: "Market Estimate" },
  { value: "user_input", label: "Manual Entry" },
];

export function PropertyValueUpdateDialog({
  open,
  onOpenChange,
  mortgageId,
  currentPropertyPrice,
}: PropertyValueUpdateDialogProps) {
  const [propertyValue, setPropertyValue] = useState("");
  const [valueDate, setValueDate] = useState(new Date().toISOString().split("T")[0]);
  const [source, setSource] = useState<string>("user_input");
  const [notes, setNotes] = useState("");
  const [appliedResult, setAppliedResult] = useState<PropertyValueUpdateResponse | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (value: number) => {
      return mortgageApi.updatePropertyValue(mortgageId, {
        propertyValue: value,
        valueDate,
        source,
        notes: notes || undefined,
      });
    },
    onSuccess: (data) => {
      setAppliedResult(data);
      // Invalidate queries to refresh mortgage data
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
      toast({
        title: "Property Value Updated",
        description: "Property value has been updated and HELOC limits recalculated.",
      });
    },
    onError: (error) => {
      console.error("Failed to update property value:", error);
      toast({
        title: "Error",
        description: "Failed to update property value. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdate = () => {
    const value = parseFloat(propertyValue);
    if (isNaN(value) || value <= 0) {
      toast({
        title: "Invalid Value",
        description: "Please enter a valid property value greater than zero.",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate(value);
  };

  const handleClose = () => {
    setPropertyValue("");
    setValueDate(new Date().toISOString().split("T")[0]);
    setSource("user_input");
    setNotes("");
    setAppliedResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Update Property Value
          </DialogTitle>
          <DialogDescription>
            Update your property value to recalculate HELOC credit limits. This will also create a
            history entry for tracking value changes over time.
          </DialogDescription>
        </DialogHeader>

        {appliedResult ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Property Value Updated Successfully</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Property value has been updated from{" "}
                <strong>${currentPropertyPrice.toLocaleString()}</strong> to{" "}
                <strong>${parseFloat(propertyValue).toLocaleString()}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                HELOC credit limits have been recalculated automatically.
              </p>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-property-value">Current Property Value</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">${currentPropertyPrice.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property-value">New Property Value</Label>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="property-value"
                  type="number"
                  step="0.01"
                  min="0"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the new estimated or appraised value of your property.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value-date">Value Date</Label>
                <Input
                  id="value-date"
                  type="date"
                  value={valueDate}
                  onChange={(e) => setValueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger id="source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this value update..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || !propertyValue}
                className="flex-1"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Property Value"
                )}
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
