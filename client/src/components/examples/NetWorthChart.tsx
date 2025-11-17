import { NetWorthChart } from "../net-worth-chart";

export default function NetWorthChartExample() {
  const data = [
    { year: 0, netWorth: 100000 },
    { year: 2, netWorth: 185000 },
    { year: 4, netWorth: 280000 },
    { year: 6, netWorth: 385000 },
    { year: 8, netWorth: 500000 },
    { year: 10, netWorth: 625000 },
  ];

  return (
    <div className="p-6 bg-background">
      <NetWorthChart data={data} />
    </div>
  );
}
