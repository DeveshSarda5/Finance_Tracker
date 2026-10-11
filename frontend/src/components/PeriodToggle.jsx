const OPTIONS = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: '6months', label: '6 Months' },
];

export default function PeriodToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-cream-border bg-cream-bg p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
            value === opt.value
              ? 'bg-brown-600 text-cream-surface shadow-soft'
              : 'text-taupe-500 hover:text-espresso-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
