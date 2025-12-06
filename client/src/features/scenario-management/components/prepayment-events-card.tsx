import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Plus, Edit2, Trash2 } from "lucide-react";
import type { DraftPrepaymentEvent } from "../hooks/use-scenario-editor-state";
import { getMonthName } from "../utils";
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
import type { UseFormReturn } from "react-hook-form";
import type { PrepaymentEventFormData } from "../hooks/use-prepayment-event-form";

interface PrepaymentEventsCardProps {
  prepaymentEvents: DraftPrepaymentEvent[];
  isAddingEvent: boolean;
  editingEvent: DraftPrepaymentEvent | null;
  form: UseFormReturn<PrepaymentEventFormData>;
  onAddEvent: (data: PrepaymentEventFormData) => void;
  onEditEvent: (event: DraftPrepaymentEvent) => void;
  onUpdateEvent: (data: PrepaymentEventFormData) => void;
  onDeleteEvent: (eventId: string) => void;
  onCancelEvent: () => void;
  onStartAddingEvent: () => void;
}

/**
 * Prepayment Event Form Fields Component
 */
function PrepaymentEventFormFields() {
  const { control, watch } = useFormContext<PrepaymentEventFormData>();
  const eventType = watch("eventType");

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="eventType"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="event-type">Event Type</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              data-testid="select-event-type"
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="annual">Annual (recurring every year)</SelectItem>
                <SelectItem value="one-time">One-Time</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="event-amount">Amount ($)</FormLabel>
            <FormControl>
              <Input
                id="event-amount"
                type="number"
                placeholder="5000"
                {...field}
                data-testid="input-event-amount"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {eventType === "annual" && (
        <FormField
          control={control}
          name="recurrenceMonth"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="recurrence-month">Which Month?</FormLabel>
              <Select
                value={field.value || "3"}
                onValueChange={field.onChange}
                data-testid="select-recurrence-month"
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March (Tax Refund)</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December (Bonus)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Common: March for tax refunds, December for year-end bonuses
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {eventType === "one-time" && (
        <FormField
          control={control}
          name="oneTimeYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="one-time-year">Which Year? (from mortgage start)</FormLabel>
              <FormControl>
                <Input
                  id="one-time-year"
                  type="number"
                  min="1"
                  placeholder="1"
                  {...field}
                  data-testid="input-one-time-year"
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                E.g., "5" means 5 years from when your mortgage started
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="event-description">Description (Optional)</FormLabel>
            <FormControl>
              <Input
                id="event-description"
                placeholder="e.g., Annual bonus, Tax refund, Inheritance"
                {...field}
                data-testid="input-event-description"
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
 * Prepayment Events Card Component
 * Uses React Hook Form for form management and validation
 */
export function PrepaymentEventsCard({
  prepaymentEvents,
  isAddingEvent,
  editingEvent,
  form,
  onAddEvent,
  onEditEvent,
  onUpdateEvent,
  onDeleteEvent,
  onCancelEvent,
  onStartAddingEvent,
}: PrepaymentEventsCardProps) {
  const onSubmit = form.handleSubmit((data) => {
    if (editingEvent) {
      onUpdateEvent(data);
    } else {
      onAddEvent(data);
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Prepayment Events</CardTitle>
            <CardDescription>Annual lump sums (bonuses, tax refunds) and one-time prepayments</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onStartAddingEvent} data-testid="button-add-event">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* List of existing prepayment events */}
        {prepaymentEvents.length === 0 && !isAddingEvent && (
          <Alert>
            <AlertDescription>
              No prepayment events configured. Add annual lump sums (like tax refunds) or one-time prepayments (like
              inheritances).
            </AlertDescription>
          </Alert>
        )}

        {prepaymentEvents.length > 0 && (
          <div className="space-y-3">
            {prepaymentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-muted/30"
                data-testid={`event-${event.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" data-testid={`badge-${event.eventType}`}>
                      {event.eventType === "annual" ? "Annual" : "One-Time"}
                    </Badge>
                    <span className="font-mono font-semibold text-lg">${parseFloat(event.amount).toLocaleString()}</span>
                  </div>
                  {event.eventType === "annual" && event.recurrenceMonth && (
                    <p className="text-sm text-muted-foreground">Every {getMonthName(event.recurrenceMonth)}</p>
                  )}
                  {event.eventType === "one-time" && event.oneTimeYear && (
                    <p className="text-sm text-muted-foreground">Year {event.oneTimeYear} from mortgage start</p>
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
                  {editingEvent ? "Edit Prepayment Event" : "Add Prepayment Event"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit}>
                  <PrepaymentEventFormFields />
                  <div className="flex gap-2 mt-4">
                    <Button type="submit" data-testid="button-save-event">
                      {editingEvent ? "Update Event" : "Add Event"}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancelEvent} data-testid="button-cancel-event">
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
