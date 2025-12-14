import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import { queryClient } from "@/shared/api/query-client";
import { scenarioApi, scenarioQueryKeys, type ScenarioPayload, type InsertPrepaymentEvent, type InsertRefinancingEvent } from "../api";
import type { Scenario, PrepaymentEvent, RefinancingEvent } from "@shared/schema";
import { useScenarioBasicInfoForm } from "./use-scenario-basic-info-form";
import { usePrepaymentEventForm, type PrepaymentEventFormData } from "./use-prepayment-event-form";
import { useRefinancingEventForm, type RefinancingEventFormData } from "./use-refinancing-event-form";

export type DraftPrepaymentEvent = {
  id: string;
  scenarioId: string;
  eventType: "annual" | "one-time";
  amount: string;
  startPaymentNumber: number;
  description: string | null;
  recurrenceMonth: number | null;
  startYear: number | null; // Start year for annual events
  oneTimeYear: number | null;
};

export type DraftRefinancingEvent = {
  id: string;
  scenarioId: string;
  refinancingYear: number | null;
  atTermEnd: boolean;
  newRate: string; // Stored as decimal string (e.g., "0.0549")
  termType: "fixed" | "variable-changing" | "variable-fixed";
  newAmortizationMonths: number | null;
  paymentFrequency: string | null;
  description: string | null;
};

export function useScenarioEditorState(
  scenario: Scenario | null | undefined,
  fetchedEvents: PrepaymentEvent[] | null | undefined,
  fetchedRefinancingEvents: RefinancingEvent[] | null | undefined,
  isNewScenario: boolean,
  scenarioId: string | null,
  onSaveSuccess: () => void,
) {
  const { toast } = useToast();

  // React Hook Form for basic info (name, description)
  const basicInfoForm = useScenarioBasicInfoForm({
    initialName: scenario?.name,
    initialDescription: scenario?.description,
  });

  // Watch form values to sync with existing state logic
  const name = basicInfoForm.watch("name");
  const description = basicInfoForm.watch("description");

  // Other form state (not yet migrated to React Hook Form)
  const [prepaymentSplit, setPrepaymentSplit] = useState([0]);
  const [expectedReturnRate, setExpectedReturnRate] = useState(6.0);
  const [efPriorityPercent, setEfPriorityPercent] = useState(0);
  const [rateAssumption, setRateAssumption] = useState<number | null>(null);

  // Prepayment events state
  const [prepaymentEvents, setPrepaymentEvents] = useState<DraftPrepaymentEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<DraftPrepaymentEvent | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Refinancing events state
  const [refinancingEvents, setRefinancingEvents] = useState<DraftRefinancingEvent[]>([]);
  const [editingRefinancingEvent, setEditingRefinancingEvent] = useState<DraftRefinancingEvent | null>(null);
  const [isAddingRefinancingEvent, setIsAddingRefinancingEvent] = useState(false);

  // React Hook Form for prepayment event
  const prepaymentEventForm = usePrepaymentEventForm({
    initialEvent: editingEvent,
  });

  // React Hook Form for refinancing event
  const refinancingEventForm = useRefinancingEventForm({
    initialEvent: editingRefinancingEvent,
  });

  // Initialize other form state when editing existing scenario
  useEffect(() => {
    if (scenario && !isNewScenario) {
      setPrepaymentSplit([scenario.prepaymentMonthlyPercent]);
      setExpectedReturnRate(parseFloat(scenario.expectedReturnRate));
      setEfPriorityPercent(scenario.efPriorityPercent);
    }
  }, [scenario, isNewScenario]);

  const toDraftRefinancingEvent = (event: RefinancingEvent): DraftRefinancingEvent => {
    return {
      id: event.id,
      scenarioId: event.scenarioId,
      refinancingYear: event.refinancingYear ?? null,
      atTermEnd: event.atTermEnd === 1 || event.atTermEnd === true,
      newRate: event.newRate, // Already stored as decimal string in DB
      termType: event.termType as "fixed" | "variable-changing" | "variable-fixed",
      newAmortizationMonths: event.newAmortizationMonths ?? null,
      paymentFrequency: event.paymentFrequency ?? null,
      description: event.description ?? null,
    };
  };

  // Load prepayment events
  useEffect(() => {
    if (fetchedEvents) {
      setPrepaymentEvents(fetchedEvents.map(toDraftEvent));
    }
  }, [fetchedEvents]);

  // Load refinancing events
  useEffect(() => {
    if (fetchedRefinancingEvents) {
      setRefinancingEvents(fetchedRefinancingEvents.map(toDraftRefinancingEvent));
    }
  }, [fetchedRefinancingEvents]);

  // Sync form when editingEvent changes
  useEffect(() => {
    if (editingEvent) {
      // Calculate startYear from startPaymentNumber for annual events
      let startYear = "1";
      if (editingEvent.eventType === "annual" && editingEvent.startPaymentNumber) {
        // Estimate start year: startPaymentNumber / 12 (assuming monthly)
        startYear = Math.max(1, Math.ceil(editingEvent.startPaymentNumber / 12)).toString();
      }
      
      prepaymentEventForm.form.reset({
        eventType: editingEvent.eventType,
        amount: editingEvent.amount || "",
        description: editingEvent.description || "",
        recurrenceMonth: editingEvent.recurrenceMonth?.toString() || "3",
        startYear: editingEvent.eventType === "annual" ? (editingEvent.startYear?.toString() || startYear) : undefined,
        oneTimeYear: editingEvent.oneTimeYear?.toString() || "1",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingEvent]);

  const toDraftEvent = (event: PrepaymentEvent): DraftPrepaymentEvent => {
    // Calculate startYear from startPaymentNumber for annual events
    let startYear: number | null = null;
    if (event.eventType === "annual" && event.startPaymentNumber) {
      // Estimate start year: startPaymentNumber / 12 (assuming monthly)
      startYear = Math.max(1, Math.ceil(event.startPaymentNumber / 12));
    }
    
    return {
      id: event.id,
      scenarioId: event.scenarioId,
      eventType: event.eventType as "annual" | "one-time",
      amount: event.amount,
      startPaymentNumber: event.startPaymentNumber ?? 1,
      description: event.description ?? null,
      recurrenceMonth: event.recurrenceMonth ?? null,
      startYear,
      oneTimeYear: event.oneTimeYear ?? null,
    };
  };

  const buildScenarioPayload = (): ScenarioPayload => {
    const prepaymentPercent = prepaymentSplit?.[0] ?? 0;
    return {
      name: name.trim(),
      description: description?.trim() || null,
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
    // Validate using React Hook Form
    basicInfoForm.handleSubmit(
      () => {
        saveMutation.mutate();
      },
      (errors) => {
        // Form validation errors are handled by React Hook Form automatically
        toast({
          title: "Validation Error",
          description: "Please fix the form errors before saving.",
          variant: "destructive",
        });
      }
    )();
  };

  const resetEventForm = () => {
    prepaymentEventForm.reset();
  };

  const handleAddEvent = async (formData: PrepaymentEventFormData) => {
    const eventData: DraftPrepaymentEvent = {
      id: `temp-${Date.now()}`,
      scenarioId: scenarioId || "",
      eventType: formData.eventType,
      amount: parseFloat(formData.amount).toFixed(2),
      startPaymentNumber: 1, // Will be calculated from startYear/oneTimeYear in projections
      description: formData.description || null,
      recurrenceMonth: formData.eventType === "annual" ? parseInt(formData.recurrenceMonth || "3") : null,
      startYear: formData.eventType === "annual" ? parseInt(formData.startYear || "1") : null,
      oneTimeYear: formData.eventType === "one-time" ? parseInt(formData.oneTimeYear || "1") : null,
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
    setIsAddingEvent(true);
  };

  const handleUpdateEvent = async (formData: PrepaymentEventFormData) => {
    if (!editingEvent) {
      toast({
        title: "Error",
        description: "No event selected for editing.",
        variant: "destructive",
      });
      return;
    }

    const updatedEvent: DraftPrepaymentEvent = {
      ...editingEvent,
      eventType: formData.eventType,
      amount: parseFloat(formData.amount).toFixed(2),
      description: formData.description || null,
      recurrenceMonth: formData.eventType === "annual" ? parseInt(formData.recurrenceMonth || "3") : null,
      startYear: formData.eventType === "annual" ? parseInt(formData.startYear || "1") : null,
      oneTimeYear: formData.eventType === "one-time" ? parseInt(formData.oneTimeYear || "1") : null,
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

  const buildRefinancingEventPayload = (event: DraftRefinancingEvent, scenarioIdValue: string): InsertRefinancingEvent => ({
    scenarioId: scenarioIdValue,
    refinancingYear: event.refinancingYear ?? null,
    atTermEnd: event.atTermEnd ? 1 : 0,
    newRate: event.newRate,
    termType: event.termType,
    newAmortizationMonths: event.newAmortizationMonths ?? null,
    paymentFrequency: event.paymentFrequency ?? null,
    description: event.description ?? null,
  });

  const resetRefinancingEventForm = () => {
    refinancingEventForm.reset();
  };

  const handleAddRefinancingEvent = async (formData: RefinancingEventFormData) => {
    // Validate rate before processing
    const rateValue = parseFloat(formData.newRate);
    if (isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
      toast({
        title: "Invalid rate",
        description: "Rate must be a valid number between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    const eventData: DraftRefinancingEvent = {
      id: `temp-${Date.now()}`,
      scenarioId: scenarioId || "",
      refinancingYear: formData.timingType === "by-year" ? parseInt(formData.refinancingYear || "1") : null,
      atTermEnd: formData.timingType === "at-term-end",
      newRate: (rateValue / 100).toFixed(6), // Convert from percentage to decimal
      termType: formData.termType,
      newAmortizationMonths: formData.newAmortizationMonths ? parseInt(formData.newAmortizationMonths) : null,
      paymentFrequency: formData.paymentFrequency && formData.paymentFrequency !== "keep-current" ? formData.paymentFrequency : null,
      description: formData.description || null,
    };

    // For existing scenarios, save to API immediately
    if (!isNewScenario && scenarioId) {
      try {
        const savedEvent = await scenarioApi.createRefinancingEvent(scenarioId, buildRefinancingEventPayload(eventData, scenarioId));
        setRefinancingEvents([...refinancingEvents, toDraftRefinancingEvent(savedEvent)]);
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenarioRefinancingEvents(scenarioId) });
        toast({
          title: "Event added",
          description: "Refinancing event has been saved.",
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
      setRefinancingEvents([...refinancingEvents, eventData]);
    }

    setIsAddingRefinancingEvent(false);
    resetRefinancingEventForm();
  };

  const handleEditRefinancingEvent = (event: DraftRefinancingEvent) => {
    setEditingRefinancingEvent(event);
    setIsAddingRefinancingEvent(true);
  };

  const handleUpdateRefinancingEvent = async (formData: RefinancingEventFormData) => {
    if (!editingRefinancingEvent) {
      toast({
        title: "Error",
        description: "No event selected for editing.",
        variant: "destructive",
      });
      return;
    }

    // Validate rate before processing
    const rateValue = parseFloat(formData.newRate);
    if (isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
      toast({
        title: "Invalid rate",
        description: "Rate must be a valid number between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    const updatedEvent: DraftRefinancingEvent = {
      ...editingRefinancingEvent,
      refinancingYear: formData.timingType === "by-year" ? parseInt(formData.refinancingYear || "1") : null,
      atTermEnd: formData.timingType === "at-term-end",
      newRate: (rateValue / 100).toFixed(6), // Convert from percentage to decimal
      termType: formData.termType,
      newAmortizationMonths: formData.newAmortizationMonths ? parseInt(formData.newAmortizationMonths) : null,
      paymentFrequency: formData.paymentFrequency && formData.paymentFrequency !== "keep-current" ? formData.paymentFrequency : null,
      description: formData.description || null,
    };

    // For existing scenarios with real event IDs, update via API
    if (!isNewScenario && scenarioId && !editingRefinancingEvent.id.startsWith("temp-")) {
      try {
        await scenarioApi.updateRefinancingEvent(editingRefinancingEvent.id, buildRefinancingEventPayload(updatedEvent, scenarioId));
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenarioRefinancingEvents(scenarioId) });
        toast({
          title: "Event updated",
          description: "Refinancing event has been saved.",
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

    setRefinancingEvents(refinancingEvents.map((e) => (e.id === editingRefinancingEvent.id ? updatedEvent : e)));
    setIsAddingRefinancingEvent(false);
    setEditingRefinancingEvent(null);
    resetRefinancingEventForm();
  };

  const handleDeleteRefinancingEvent = async (eventId: string) => {
    // For existing scenarios with real event IDs, delete via API
    if (!isNewScenario && scenarioId && !eventId.startsWith("temp-")) {
      try {
        await scenarioApi.deleteRefinancingEvent(eventId);
        queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.scenarioRefinancingEvents(scenarioId) });
        toast({
          title: "Event deleted",
          description: "Refinancing event has been removed.",
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

    setRefinancingEvents(refinancingEvents.filter((e) => e.id !== eventId));
  };

  return {
    // React Hook Form for basic info
    basicInfoForm,
    // Form state (synced from React Hook Form for backward compatibility)
    name,
    setName: (value: string) => basicInfoForm.setValue("name", value),
    description: description || "",
    setDescription: (value: string) => basicInfoForm.setValue("description", value || undefined),
    // Other form state
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
    // React Hook Form for prepayment event
    prepaymentEventForm: prepaymentEventForm.form,
    // Refinancing events
    refinancingEvents,
    editingRefinancingEvent,
    isAddingRefinancingEvent,
    setIsAddingRefinancingEvent,
    setEditingRefinancingEvent,
    // React Hook Form for refinancing event
    refinancingEventForm: refinancingEventForm.form,
    // Actions
    handleSave,
    saveMutation,
    handleAddEvent,
    handleEditEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    resetEventForm,
    handleAddRefinancingEvent,
    handleEditRefinancingEvent,
    handleUpdateRefinancingEvent,
    handleDeleteRefinancingEvent,
    resetRefinancingEventForm,
    buildScenarioPayload,
    buildEventPayload,
  };
}

