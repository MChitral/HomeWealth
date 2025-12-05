import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import { queryClient } from "@/shared/api/query-client";
import { scenarioApi, scenarioQueryKeys, type ScenarioPayload, type InsertPrepaymentEvent } from "../api";
import type { Scenario, PrepaymentEvent } from "@shared/schema";

export type DraftPrepaymentEvent = {
  id: string;
  scenarioId: string;
  eventType: "annual" | "one-time";
  amount: string;
  startPaymentNumber: number;
  description: string | null;
  recurrenceMonth: number | null;
  oneTimeYear: number | null;
};

export function useScenarioEditorState(
  scenario: Scenario | null | undefined,
  fetchedEvents: PrepaymentEvent[] | null | undefined,
  isNewScenario: boolean,
  scenarioId: string | null,
  onSaveSuccess: () => void,
) {
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prepaymentSplit, setPrepaymentSplit] = useState([50]);
  const [expectedReturnRate, setExpectedReturnRate] = useState(6.0);
  const [efPriorityPercent, setEfPriorityPercent] = useState(0);
  const [rateAssumption, setRateAssumption] = useState<number | null>(null);

  // Prepayment events state
  const [prepaymentEvents, setPrepaymentEvents] = useState<DraftPrepaymentEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<DraftPrepaymentEvent | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Event form state
  const [eventType, setEventType] = useState<"annual" | "one-time">("annual");
  const [eventAmount, setEventAmount] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [recurrenceMonth, setRecurrenceMonth] = useState("3");
  const [oneTimeYear, setOneTimeYear] = useState("1");

  // Initialize form when editing existing scenario
  useEffect(() => {
    if (scenario && !isNewScenario) {
      setName(scenario.name);
      setDescription(scenario.description || "");
      setPrepaymentSplit([scenario.prepaymentMonthlyPercent]);
      setExpectedReturnRate(parseFloat(scenario.expectedReturnRate));
      setEfPriorityPercent(scenario.efPriorityPercent);
    }
  }, [scenario, isNewScenario]);

  // Load prepayment events
  useEffect(() => {
    if (fetchedEvents) {
      setPrepaymentEvents(fetchedEvents.map(toDraftEvent));
    }
  }, [fetchedEvents]);

  const toDraftEvent = (event: PrepaymentEvent): DraftPrepaymentEvent => ({
    id: event.id,
    scenarioId: event.scenarioId,
    eventType: event.eventType as "annual" | "one-time",
    amount: event.amount,
    startPaymentNumber: event.startPaymentNumber ?? 1,
    description: event.description ?? null,
    recurrenceMonth: event.recurrenceMonth ?? null,
    oneTimeYear: event.oneTimeYear ?? null,
  });

  const buildScenarioPayload = (): ScenarioPayload => {
    const prepaymentPercent = prepaymentSplit?.[0] ?? 50;
    return {
      name: name.trim(),
      description: description.trim() || null,
      prepaymentMonthlyPercent: prepaymentPercent,
      investmentMonthlyPercent: 100 - prepaymentPercent,
      expectedReturnRate: Number(parseFloat(expectedReturnRate.toString()).toFixed(3)),
      efPriorityPercent: Math.max(0, Math.min(100, efPriorityPercent)),
    };
  };

  const buildEventPayload = (event: DraftPrepaymentEvent, scenarioIdValue: string): InsertPrepaymentEvent => ({
    scenarioId: scenarioIdValue,
    eventType: event.eventType,
    amount: event.amount ?? "0",
    startPaymentNumber: event.startPaymentNumber ?? 1,
    recurrenceMonth: event.eventType === "annual" ? event.recurrenceMonth ?? null : null,
    oneTimeYear: event.eventType === "one-time" ? event.oneTimeYear ?? null : null,
    description: event.description ?? null,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildScenarioPayload();
      const savedScenario = isNewScenario
        ? await scenarioApi.createScenario(payload)
        : await scenarioApi.updateScenario(scenarioId!, payload);

      if (isNewScenario && savedScenario?.id && prepaymentEvents.length > 0) {
        await Promise.all(
          prepaymentEvents.map((event) =>
            scenarioApi.createPrepaymentEvent(savedScenario.id!, buildEventPayload(event, savedScenario.id!)),
          ),
        );
      }

      return savedScenario;
    },
    onSuccess: (savedScenario: Scenario) => {
      queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenariosWithMetrics() });
      queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.all() });
      const id = savedScenario?.id ?? scenarioId;
      if (id) {
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenario(id) });
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenarioEvents(id) });
      }
      toast({
        title: isNewScenario ? "Scenario created" : "Scenario saved",
        description: isNewScenario ? "Your new scenario has been created." : "Your scenario has been updated.",
      });
      onSaveSuccess();
    },
    onError: () => {
      toast({
        title: "Error saving scenario",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a scenario name.",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate();
  };

  const resetEventForm = () => {
    setEventType("annual");
    setEventAmount("");
    setEventDescription("");
    setRecurrenceMonth("3");
    setOneTimeYear("1");
  };

  const handleAddEvent = async () => {
    if (!eventAmount || parseFloat(eventAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid prepayment amount.",
        variant: "destructive",
      });
      return;
    }

    const eventData: DraftPrepaymentEvent = {
      id: `temp-${Date.now()}`,
      scenarioId: scenarioId || "",
      eventType,
      amount: parseFloat(eventAmount).toFixed(2),
      startPaymentNumber: 1,
      description: eventDescription || null,
      recurrenceMonth: eventType === "annual" ? parseInt(recurrenceMonth) : null,
      oneTimeYear: eventType === "one-time" ? parseInt(oneTimeYear) : null,
    };

    // For existing scenarios, save to API immediately
    if (!isNewScenario && scenarioId) {
      try {
        const savedEvent = await scenarioApi.createPrepaymentEvent(scenarioId, buildEventPayload(eventData, scenarioId));
        setPrepaymentEvents([...prepaymentEvents, toDraftEvent(savedEvent)]);
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenarioEvents(scenarioId) });
        toast({
          title: "Event added",
          description: "Prepayment event has been saved.",
        });
      } catch (error) {
        toast({
          title: "Error adding event",
          description: "Please try again.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // For new scenarios, just add to local state (will be saved when scenario is created)
      setPrepaymentEvents([...prepaymentEvents, eventData]);
    }

    setIsAddingEvent(false);
    resetEventForm();
  };

  const handleEditEvent = (event: DraftPrepaymentEvent) => {
    setEditingEvent(event);
    setEventType(event.eventType as "annual" | "one-time");
    setEventAmount(event.amount);
    setEventDescription(event.description || "");
    if (event.eventType === "annual" && event.recurrenceMonth) {
      setRecurrenceMonth(event.recurrenceMonth.toString());
    } else if (event.eventType === "one-time" && event.oneTimeYear) {
      setOneTimeYear(event.oneTimeYear.toString());
    }
    setIsAddingEvent(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !eventAmount || parseFloat(eventAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid prepayment amount.",
        variant: "destructive",
      });
      return;
    }

    const updatedEvent: DraftPrepaymentEvent = {
      ...editingEvent,
      eventType,
      amount: parseFloat(eventAmount).toFixed(2),
      description: eventDescription || null,
      recurrenceMonth: eventType === "annual" ? parseInt(recurrenceMonth) : null,
      oneTimeYear: eventType === "one-time" ? parseInt(oneTimeYear) : null,
    };

    // For existing scenarios with real event IDs, update via API
    if (!isNewScenario && scenarioId && !editingEvent.id.startsWith("temp-")) {
      try {
        await scenarioApi.updatePrepaymentEvent(editingEvent.id, buildEventPayload(updatedEvent, scenarioId));
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenarioEvents(scenarioId) });
        toast({
          title: "Event updated",
          description: "Prepayment event has been saved.",
        });
      } catch (error) {
        toast({
          title: "Error updating event",
          description: "Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    setPrepaymentEvents(prepaymentEvents.map((e) => (e.id === editingEvent.id ? updatedEvent : e)));
    setIsAddingEvent(false);
    setEditingEvent(null);
    resetEventForm();
  };

  const handleDeleteEvent = async (eventId: string) => {
    // For existing scenarios with real event IDs, delete via API
    if (!isNewScenario && scenarioId && !eventId.startsWith("temp-")) {
      try {
        await scenarioApi.deletePrepaymentEvent(eventId);
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenarioEvents(scenarioId) });
        toast({
          title: "Event deleted",
          description: "Prepayment event has been removed.",
        });
      } catch (error) {
        toast({
          title: "Error deleting event",
          description: "Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    setPrepaymentEvents(prepaymentEvents.filter((e) => e.id !== eventId));
  };

  return {
    // Form state
    name,
    setName,
    description,
    setDescription,
    prepaymentSplit,
    setPrepaymentSplit,
    expectedReturnRate,
    setExpectedReturnRate,
    efPriorityPercent,
    setEfPriorityPercent,
    rateAssumption,
    setRateAssumption,
    // Prepayment events
    prepaymentEvents,
    editingEvent,
    isAddingEvent,
    setIsAddingEvent,
    setEditingEvent,
    // Event form state
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
    // Actions
    handleSave,
    saveMutation,
    handleAddEvent,
    handleEditEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    resetEventForm,
    buildScenarioPayload,
    buildEventPayload,
  };
}

