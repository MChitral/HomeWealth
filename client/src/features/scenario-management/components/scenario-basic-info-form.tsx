import { FormProvider } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { ScenarioBasicInfoFormData } from "../hooks/use-scenario-basic-info-form";

interface ScenarioBasicInfoFormProps {
  form: UseFormReturn<ScenarioBasicInfoFormData>;
}

/**
 * Scenario Basic Info Form Component
 * Uses React Hook Form for form management and validation
 */
export function ScenarioBasicInfoForm({ form }: ScenarioBasicInfoFormProps) {
  return (
    <FormProvider {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="scenario-name">Scenario Name</FormLabel>
              <FormControl>
                <Input
                  id="scenario-name"
                  placeholder="e.g., Balanced Strategy"
                  {...field}
                  data-testid="input-scenario-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="scenario-description">Description (Optional)</FormLabel>
              <FormControl>
                <Input
                  id="scenario-description"
                  placeholder="Brief description of this strategy"
                  {...field}
                  value={field.value || ""}
                  data-testid="input-scenario-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <label htmlFor="horizon" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Projection Horizon (years)
          </label>
          <Select defaultValue="10">
            <SelectTrigger id="horizon" data-testid="select-horizon">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 Years</SelectItem>
              <SelectItem value="15">15 Years</SelectItem>
              <SelectItem value="20">20 Years</SelectItem>
              <SelectItem value="25">25 Years</SelectItem>
              <SelectItem value="30">30 Years</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            Note: Horizon selection is not yet connected to projections
          </p>
        </div>
      </div>
    </FormProvider>
  );
}
