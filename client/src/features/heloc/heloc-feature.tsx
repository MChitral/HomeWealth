import { usePageTitle } from "@/shared/hooks/use-page-title";
import { HelocDashboard } from "./components/heloc-dashboard";

export default function HelocFeature() {
  usePageTitle("HELOC Accounts | Mortgage Strategy");

  return (
    <div className="space-y-6">
      <HelocDashboard />
    </div>
  );
}


