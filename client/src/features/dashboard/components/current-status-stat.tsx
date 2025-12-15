import { StatDisplay } from "@/shared/components";

interface CurrentStatusStatProps {
  label: string;
  value: string;
  testId?: string;
  children?: React.ReactNode;
}

export function CurrentStatusStat({ label, value, testId, children }: CurrentStatusStatProps) {
  return (
    <StatDisplay label={label} value={value} testId={testId} size="md">
      {children}
    </StatDisplay>
  );
}
