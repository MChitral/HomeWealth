import { useQuery } from "@tanstack/react-query";
import { RenewalCard } from "@/features/dashboard/components/renewal-card";
import { mortgageApi } from "@/features/mortgage-tracking/api";
import { EmptyWidgetState } from "@/features/dashboard/components/empty-widget-state";

interface RenewalTabProps {
  mortgageId: string;
}

export function RenewalTab({ mortgageId }: RenewalTabProps) {
  const { data: renewalStatus, isLoading } = useQuery({
    queryKey: ["renewal", mortgageId],
    queryFn: () => mortgageApi.fetchRenewalStatus(mortgageId),
    enabled: !!mortgageId,
  });

  if (isLoading) return <div>Loading analysis...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {renewalStatus ? (
          <RenewalCard status={renewalStatus} />
        ) : (
          <EmptyWidgetState title="Renewal Analysis" description="Could not load renewal data." />
        )}
      </div>
    </div>
  );
}
