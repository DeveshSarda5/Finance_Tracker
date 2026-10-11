export default function Card({ title, action, className = '', children }) {
  return (
    <div className={`rounded-2xl border border-cream-border bg-cream-surface p-6 shadow-soft ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold tracking-tight text-espresso-900">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
