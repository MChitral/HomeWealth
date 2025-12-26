import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { mortgageApi, type RenewalOptionsResponse, type RenewalNegotiationEntry } from "../api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, TrendingUp, FileText } from "lucide-react";
import { mortgageQueryKeys } from "../api";
import { useToast } from "@/shared/hooks/use-toast";
import { format } from "date-fns";

interface RenewalWorkflowWizardProps {
  mortgageId: string;
}

export function RenewalWorkflowWizard({ mortgageId }: RenewalWorkflowWizardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [negotiationDate, setNegotiationDate] = useState(new Date().toISOString().split("T")[0]);
  const [offeredRate, setOfferedRate] = useState("");
  const [negotiatedRate, setNegotiatedRate] = useState("");
  const [status, setStatus] = useState<"pending" | "accepted" | "rejected" | "counter_offered">(
    "pending"
  );
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch workflow data
  const { data: workflowData, isLoading: isLoadingWorkflow } = useQuery({
    queryKey: [...mortgageQueryKeys.mortgages(), mortgageId, "renewal-workflow"],
    queryFn: () => mortgageApi.startRenewalWorkflow(mortgageId),
    enabled: !!mortgageId && activeTab === "overview",
  });

  // Fetch renewal options
  const { data: renewalOptions, isLoading: isLoadingOptions } = useQuery({
    queryKey: [...mortgageQueryKeys.mortgages(), mortgageId, "renewal-options"],
    queryFn: () => mortgageApi.fetchRenewalOptions(mortgageId),
    enabled: !!mortgageId && activeTab === "compare",
  });

  // Fetch negotiation history
  const { data: negotiations, isLoading: isLoadingNegotiations } = useQuery({
    queryKey: [...mortgageQueryKeys.mortgages(), mortgageId, "renewal-negotiations"],
    queryFn: () => mortgageApi.fetchRenewalNegotiations(mortgageId),
    enabled: !!mortgageId && activeTab === "negotiations",
  });

  const trackNegotiationMutation = useMutation({
    mutationFn: async () => {
      if (!workflowData?.currentTerm?.id) {
        throw new Error("No current term found");
      }
      return mortgageApi.trackRenewalNegotiation(mortgageId, {
        termId: workflowData.currentTerm.id,
        negotiationDate,
        offeredRate: offeredRate ? parseFloat(offeredRate) : undefined,
        negotiatedRate: negotiatedRate ? parseFloat(negotiatedRate) : undefined,
        status,
        notes: notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...mortgageQueryKeys.mortgages(), mortgageId, "renewal-negotiations"],
      });
      toast({
        title: "Negotiation Tracked",
        description: "Your rate negotiation has been recorded.",
      });
      // Reset form
      setOfferedRate("");
      setNegotiatedRate("");
      setStatus("pending");
      setNotes("");
    },
    onError: (error) => {
      console.error("Failed to track negotiation:", error);
      toast({
        title: "Error",
        description: "Failed to track negotiation. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoadingWorkflow && activeTab === "overview") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Renewal Workflow</CardTitle>
        <CardDescription>Manage your mortgage renewal process</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compare">Compare Options</TabsTrigger>
            <TabsTrigger value="negotiations">Negotiations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Renewal Recommendation */}
            <RenewalComparisonCard mortgageId={mortgageId} />

            {workflowData?.renewalStatus && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Days Until Renewal</p>
                    <p className="text-2xl font-bold">
                      {workflowData.renewalStatus.daysUntilRenewal}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Renewal Date</p>
                    <p className="text-lg font-semibold">
                      {format(new Date(workflowData.renewalStatus.renewalDate), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Rate</p>
                  <p className="text-lg font-semibold">
                    {workflowData.renewalStatus.currentRate.toFixed(2)}%
                  </p>
                </div>
                {workflowData.renewalStatus.estimatedPenalty && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Estimated Penalty (if broken today)
                    </p>
                    <p className="text-lg font-semibold">
                      $
                      {workflowData.renewalStatus.estimatedPenalty.amount.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({workflowData.renewalStatus.estimatedPenalty.method})
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="compare" className="space-y-4">
            {isLoadingOptions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : renewalOptions ? (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stay with Current Lender</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Rate</p>
                      <p className="text-2xl font-bold">
                        {renewalOptions.stayWithCurrentLender.estimatedRate.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Penalty</p>
                      <p className="text-lg font-semibold">
                        $
                        {renewalOptions.stayWithCurrentLender.estimatedPenalty.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Switch Lender</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Rate</p>
                      <p className="text-2xl font-bold">
                        {renewalOptions.switchLender.estimatedRate.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Penalty</p>
                      <p className="text-lg font-semibold">
                        $
                        {renewalOptions.switchLender.estimatedPenalty.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Closing Costs</p>
                      <p className="text-lg font-semibold">
                        $
                        {renewalOptions.switchLender.estimatedClosingCosts.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="negotiations" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Track Rate Negotiation</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="negotiation-date">Negotiation Date</Label>
                      <Input
                        id="negotiation-date"
                        type="date"
                        value={negotiationDate}
                        onChange={(e) => setNegotiationDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="counter_offered">Counter Offered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="offered-rate">Offered Rate (%)</Label>
                      <Input
                        id="offered-rate"
                        type="number"
                        step="0.001"
                        value={offeredRate}
                        onChange={(e) => setOfferedRate(e.target.value)}
                        placeholder="5.490"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="negotiated-rate">Negotiated Rate (%)</Label>
                      <Input
                        id="negotiated-rate"
                        type="number"
                        step="0.001"
                        value={negotiatedRate}
                        onChange={(e) => setNegotiatedRate(e.target.value)}
                        placeholder="5.250"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this negotiation..."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={() => trackNegotiationMutation.mutate()}
                    disabled={trackNegotiationMutation.isPending || !workflowData?.currentTerm}
                  >
                    {trackNegotiationMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Tracking...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Track Negotiation
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Negotiation History</h3>
                {isLoadingNegotiations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : negotiations && negotiations.length > 0 ? (
                  <div className="space-y-3">
                    {negotiations.map((negotiation: RenewalNegotiationEntry) => (
                      <div
                        key={negotiation.id}
                        className="rounded-lg border p-4 space-y-2 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {format(new Date(negotiation.negotiationDate), "MMMM d, yyyy")}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              Status: {negotiation.status.replace("_", " ")}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            {negotiation.offeredRate && (
                              <div>
                                <p className="text-xs text-muted-foreground">Offered</p>
                                <p className="font-semibold">
                                  {(parseFloat(negotiation.offeredRate) * 100).toFixed(3)}%
                                </p>
                              </div>
                            )}
                            {negotiation.negotiatedRate && (
                              <div>
                                <p className="text-xs text-muted-foreground">Negotiated</p>
                                <p className="font-semibold text-green-600">
                                  {(parseFloat(negotiation.negotiatedRate) * 100).toFixed(3)}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        {negotiation.notes && (
                          <p className="text-sm text-muted-foreground pt-2 border-t">
                            {negotiation.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No negotiations tracked yet.</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
