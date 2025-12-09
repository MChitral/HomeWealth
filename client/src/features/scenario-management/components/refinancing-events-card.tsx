import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Plus, Edit2, Trash2 } from "lucide-react";
import type { DraftRefinancingEvent } from "../hooks/use-scenario-editor-state";
import { FormProvider, useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import type { UseFormReturn } from "react-hook-form";
import type { RefinancingEventFormData } from "../hooks/use-refinancing-event-form";

interface RefinancingEventsCardProps {
  refinancingEvents: DraftRefinancingEvent[];
  isAddingEvent: boolean;
  editingEvent: DraftRefinancingEvent | null;
  form: UseFormReturn<RefinancingEventFormData>;
  onAddEvent: (data: RefinancingEventFormData) => void;
  onEditEvent: (event: DraftRefinancingEvent) => void;
  onUpdateEvent: (data: RefinancingEventFormData) => void;
  onDeleteEvent: (eventId: string) => void;
  onCancelEvent: () => void;
  onStartAddingEvent: () => void;
}

/**
 * Refinancing Event Form Fields Component
 */
function RefinancingEventFormFields() {
  const { control, watch } = useFormContext<RefinancingEventFormData>();
  const timingType = watch("timingType");
  const termType = watch("termType");

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="timingType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Timing</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="by-year" id="timing-year" />
                  <label htmlFor="timing-year" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    By Year (from mortgage start)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="at-term-end" id="timing-term-end" />
                  <label htmlFor="timing-term-end" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    At Term End
                  </label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {timingType === "by-year" && (
        <FormField
          control={control}
          name="refinancingYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="refinancing-year">Refinancing Year</FormLabel>
              <FormControl>
                <Input
                  id="refinancing-year"
                  type="number"
                  min="1"
                  placeholder="5"
                  {...field}
                  data-testid="input-refinancing-year"
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                E.g., "5" means refinance in Year 5 from mortgage start
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="newRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="new-rate">New Interest Rate (%)</FormLabel>
            <FormControl>
              <Input
                id="new-rate"
                type="number"
                step="0.001"
                min="0"
                max="100"
                placeholder="4.5"
                {...field}
                data-testid="input-new-rate"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="termType"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="term-type">Term Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger id="term-type">
                  <SelectValue placeholder="Select term type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="fixed">Fixed Rate</SelectItem>
                <SelectItem value="variable-changing">Variable Rate (Changing Payment)</SelectItem>
                <SelectItem value="variable-fixed">Variable Rate (Fixed Payment)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="newAmortizationMonths"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="new-amortization">New Amortization (months, optional)</FormLabel>
            <FormControl>
              <Input
                id="new-amortization"
                type="number"
                min="1"
                placeholder="300"
                {...field}
                data-testid="input-new-amortization"
              />
            </FormControl>
            <p className="text-sm text-muted-foreground">
              Leave empty to keep current amortization. Enter a value to extend amortization.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="paymentFrequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="payment-frequency">Payment Frequency (optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger id="payment-frequency">
                  <SelectValue placeholder="Keep current frequency" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Keep current frequency</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="semi-monthly">Semi-Monthly</SelectItem>
                <SelectItem value="biweekly">Biweekly</SelectItem>
                <SelectItem value="accelerated-biweekly">Accelerated Biweekly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="accelerated-weekly">Accelerated Weekly</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="description">Description (optional)</FormLabel>
            <FormControl>
              <Input
                id="description"
                placeholder="e.g., Refinance to lower rate"
                {...field}
                data-testid="input-description"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

/**
 * Refinancing Events Card Component
 * Uses React Hook Form for form management and validation
 */
export function RefinancingEventsCard({
  refinancingEvents,
  isAddingEvent,
  editingEvent,
  form,
  onAddEvent,
  onEditEvent,
  onUpdateEvent,
  onDeleteEvent,
  onCancelEvent,
  onStartAddingEvent,
}: RefinancingEventsCardProps) {
  const onSubmit = form.handleSubmit((data) => {
    if (editingEvent) {
      onUpdateEvent(data);
    } else {
      onAddEvent(data);
    }
  });

  const getTermTypeLabel = (termType: string) => {
    switch (termType) {
      case "fixed":
        return "Fixed";
      case "variable-changing":
        return "Variable (Changing)";
      case "variable-fixed":
        return "Variable (Fixed)";
      default:
        return termType;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Refinancing Events</CardTitle>
            <CardDescription>Model refinancing scenarios at renewal points</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onStartAddingEvent} data-testid="button-add-refinancing-event">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* List of existing refinancing events */}
        {refinancingEvents.length === 0 && !isAddingEvent && (
          <Alert>
            <AlertDescription>
              No refinancing events configured. Add refinancing scenarios to model rate changes, term type changes, or amortization extensions at renewal points.
            </AlertDescription>
          </Alert>
        )}

        {refinancingEvents.length > 0 && (
          <div className="space-y-3">
            {refinancingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-muted/30"
                data-testid={`refinancing-event-${event.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" data-testid={`badge-${event.termType}`}>
                      {getTermTypeLabel(event.termType)}
                    </Badge>
                    <span className="font-mono font-semibold text-lg">
                      {event.newRate ? (Number(event.newRate) * 100).toFixed(3) : "N/A"}%
                    </span>
                  </div>
                  {event.atTermEnd ? (
                    <p className="text-sm text-muted-foreground">At term end</p>
                  ) : event.refinancingYear ? (
                    <p className="text-sm text-muted-foreground">Year {event.refinancingYear} from mortgage start</p>
                  ) : null}
                  {event.newAmortizationMonths && (
                    <p className="text-sm text-muted-foreground">
                      Amortization: {event.newAmortizationMonths} months
                    </p>
                  )}
                  {event.paymentFrequency && (
                    <p className="text-sm text-muted-foreground">
                      Frequency: {event.paymentFrequency.replace("-", " ")}
                    </p>
                  )}
                  {event.description && <p className="text-sm mt-1">{event.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEditEvent(event)} data-testid={`button-edit-${event.id}`}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteEvent(event.id)}
                    data-testid={`button-delete-${event.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Event Form */}
        {isAddingEvent && (
          <Card className="border-primary">
            <FormProvider {...form}>
              <CardHeader>
                <CardTitle className="text-base">
                  {editingEvent ? "Edit Refinancing Event" : "Add Refinancing Event"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit}>
                  <RefinancingEventFormFields />
                  <div className="flex gap-2 mt-4">
                    <Button type="submit" data-testid="button-save-refinancing-event">
                      {editingEvent ? "Update Event" : "Add Event"}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancelEvent} data-testid="button-cancel-refinancing-event">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </FormProvider>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

