interface SummaryItemProps {
  label: string;
  value: string;
}

export function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-base font-mono font-medium">{value}</p>
    </div>
  );
}
