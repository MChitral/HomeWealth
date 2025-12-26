import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { scenarioApi, scenarioQueryKeys } from "../api/scenario-api";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  payload: {
    prepaymentMonthlyPercent: number;
    investmentMonthlyPercent: number;
    expectedReturnRate: number;
    efPriorityPercent: number;
  };
}

export function ScenarioTemplateSelector() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["scenario-templates"],
    queryFn: scenarioApi.fetchTemplates,
  });

  const createFromTemplateMutation = useMutation({
    mutationFn: ({ templateId, name, description }: { templateId: string; name?: string; description?: string }) =>
      scenarioApi.createFromTemplate(templateId, name, description),
    onSuccess: (scenario) => {
      queryClient.invalidateQueries({ queryKey: scenarioQueryKeys.all() });
      navigate(`/scenarios/${scenario.id}/edit`);
    },
  });

  const handleCreateFromTemplate = (template: ScenarioTemplate) => {
    createFromTemplateMutation.mutate({
      templateId: template.id,
      name: template.name,
      description: template.description,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Templates</CardTitle>
        <CardDescription>
          Start with a pre-configured scenario template or create your own
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates?.map((template: ScenarioTemplate) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prepayment:</span>
                    <span className="font-medium">{template.payload.prepaymentMonthlyPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment:</span>
                    <span className="font-medium">{template.payload.investmentMonthlyPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Return:</span>
                    <span className="font-medium">{(template.payload.expectedReturnRate * 100).toFixed(1)}%</span>
                  </div>
                  {template.payload.efPriorityPercent > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Emergency Fund:</span>
                      <span className="font-medium">{template.payload.efPriorityPercent}%</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleCreateFromTemplate(template)}
                  disabled={createFromTemplateMutation.isPending}
                  className="w-full mt-auto"
                  variant="outline"
                >
                  {createFromTemplateMutation.isPending ? "Creating..." : "Use Template"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

