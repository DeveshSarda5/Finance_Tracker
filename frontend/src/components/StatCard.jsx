const toneClasses = {
  positive: 'text-finance-income bg-finance-incomeSoft',
  negative: 'text-finance-expense bg-finance-expenseSoft',
  investment: 'text-finance-investment bg-finance-investmentSoft',
  neutral: 'text-brown-600 bg-brown-100',
};

export default function StatCard({ label, value, tone = 'neutral', icon }) {
  return (
    <div className="group rounded-2xl border border-cream-border bg-cream-surface p-6 shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:shadow-panel">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-taupe-500">{label}</span>
        {icon && (
          <span
            className={`rounded-full p-2 text-base transition-transform duration-150 group-hover:scale-110 ${toneClasses[tone]}`}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-lg font-bold tracking-tight text-espresso-900 tabular-nums">{value}</p>
    </div>
  );
}
