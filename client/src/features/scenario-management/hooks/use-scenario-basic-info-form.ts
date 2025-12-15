import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Zod schema for scenario basic info form validation
 */
export const scenarioBasicInfoFormSchema = z.object({
  name: z
    .string()
    .min(1, "Scenario name is required")
    .max(100, "Scenario name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

export type ScenarioBasicInfoFormData = z.infer<typeof scenarioBasicInfoFormSchema>;

interface UseScenarioBasicInfoFormProps {
  initialName?: string;
  initialDescription?: string | null;
}

const defaultValues: ScenarioBasicInfoFormData = {
  name: "",
  description: undefined,
};

/**
 * React Hook Form hook for scenario basic info form
 * Replaces 2 useState calls with a single useForm hook
 */
export function useScenarioBasicInfoForm({
  initialName,
  initialDescription,
}: UseScenarioBasicInfoFormProps = {}) {
  const form = useForm<ScenarioBasicInfoFormData>({
    resolver: zodResolver(scenarioBasicInfoFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Sync form with initial data when it loads
  useEffect(() => {
    if (initialName !== undefined || initialDescription !== undefined) {
      form.reset({
        name: initialName || "",
        description: initialDescription || undefined,
      });
    }
  }, [initialName, initialDescription, form]);

  return form;
}
