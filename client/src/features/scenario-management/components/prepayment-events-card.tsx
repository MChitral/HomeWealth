import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { DraftPrepaymentEvent } from "../hooks/use-scenario-editor-state";
import { getMonthName } from "../utils";

interface PrepaymentEventsCardProps {
  prepaymentEvents: DraftPrepaymentEvent[];
  isAddingEvent: boolean;
  editingEvent: DraftPrepaymentEvent | null;
  eventType: "annual" | "one-time";
  setEventType: (type: "annual" | "one-time") => void;
  eventAmount: string;
  setEventAmount: (amount: string) => void;
  eventDescription: string;
  setEventDescription: (description: string) => void;
  recurrenceMonth: string;
  setRecurrenceMonth: (month: string) => void;
  oneTimeYear: string;
  setOneTimeYear: (year: string) => void;
  onAddEvent: () => void;
  onEditEvent: (event: DraftPrepaymentEvent) => void;
  onUpdateEvent: () => void;
  onDeleteEvent: (eventId: string) => void;
  onCancelEvent: () => void;
  onStartAddingEvent: () => void;
}

export function PrepaymentEventsCard({
  prepaymentEvents,
  isAddingEvent,
  editingEvent,
  eventType,
  setEventType,
  eventAmount,
  setEventAmount,
  eventDescription,
  setEventDescription,
  recurrenceMonth,
  setRecurrenceMonth,
  oneTimeYear,
  setOneTimeYear,
  onAddEvent,
  onEditEvent,
  onUpdateEvent,
  onDeleteEvent,
  onCancelEvent,
  onStartAddingEvent,
}: PrepaymentEventsCardProps) {
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
            <CardHeader>
              <CardTitle className="text-base">
                {editingEvent ? "Edit Prepayment Event" : "Add Prepayment Event"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-type">Event Type</Label>
                <Select value={eventType} onValueChange={(value) => setEventType(value as "annual" | "one-time")}>
                  <SelectTrigger id="event-type" data-testid="select-event-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual (recurring every year)</SelectItem>
                    <SelectItem value="one-time">One-Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-amount">Amount ($)</Label>
                <Input
                  id="event-amount"
                  type="number"
                  placeholder="5000"
                  value={eventAmount}
                  onChange={(e) => setEventAmount(e.target.value)}
                  data-testid="input-event-amount"
                />
              </div>

              {eventType === "annual" && (
                <div className="space-y-2">
                  <Label htmlFor="recurrence-month">Which Month?</Label>
                  <Select value={recurrenceMonth} onValueChange={setRecurrenceMonth}>
                    <SelectTrigger id="recurrence-month" data-testid="select-recurrence-month">
                      <SelectValue />
                    </SelectTrigger>
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
                </div>
              )}

              {eventType === "one-time" && (
                <div className="space-y-2">
                  <Label htmlFor="one-time-year">Which Year? (from mortgage start)</Label>
                  <Input
                    id="one-time-year"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={oneTimeYear}
                    onChange={(e) => setOneTimeYear(e.target.value)}
                    data-testid="input-one-time-year"
                  />
                  <p className="text-sm text-muted-foreground">
                    E.g., "5" means 5 years from when your mortgage started
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="event-description">Description (Optional)</Label>
                <Input
                  id="event-description"
                  placeholder="e.g., Annual bonus, Tax refund, Inheritance"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  data-testid="input-event-description"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={editingEvent ? onUpdateEvent : onAddEvent} data-testid="button-save-event">
                  {editingEvent ? "Update Event" : "Add Event"}
                </Button>
                <Button variant="outline" onClick={onCancelEvent} data-testid="button-cancel-event">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

