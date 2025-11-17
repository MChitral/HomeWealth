import { MortgageBalanceChart } from "../mortgage-balance-chart";

export default function MortgageBalanceChartExample() {
  const data = [
    { year: 0, balance: 400000, principal: 0, interest: 0 },
    { year: 2, balance: 360000, principal: 30000, interest: 10000 },
    { year: 4, balance: 315000, principal: 65000, interest: 20000 },
    { year: 6, balance: 265000, principal: 105000, interest: 30000 },
    { year: 8, balance: 210000, principal: 150000, interest: 40000 },
    { year: 10, balance: 150000, principal: 200000, interest: 50000 },
  ];

  return (
    <div className="p-6 bg-background">
      <MortgageBalanceChart data={data} />
    </div>
  );
}
