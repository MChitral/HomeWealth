interface CurrentStatusStatProps {
  label: string;
  value: string;
  testId?: string;
  children?: React.ReactNode;
}

export function CurrentStatusStat({ label, value, testId, children }: CurrentStatusStatProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
      <p className="text-2xl font-bold font-mono" data-testid={testId}>
        {value}
      </p>
      {children}
    </div>
  );
}

