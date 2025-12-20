import { StatDisplay } from "@/shared/components";

interface CurrentStatusStatProps {
  label: string;
  value: string;
  testId?: string;
  children?: React.ReactNode;
  className?: string;
}

export function CurrentStatusStat({
  label,
  value,
  testId,
  children,
  className,
}: CurrentStatusStatProps) {
  return (
    <StatDisplay label={label} value={value} testId={testId} size="md" className={className}>
      {children}
    </StatDisplay>
  );
}
