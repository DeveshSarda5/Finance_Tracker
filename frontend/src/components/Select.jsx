export default function Select({ label, className = '', children, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-espresso-700">{label}</span>}
      <select
        className={`w-full rounded-lg border border-cream-border bg-cream-surface px-3 py-2 text-sm text-espresso-900
          outline-none transition focus:border-brown-500 focus:ring-1 focus:ring-brown-500 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
