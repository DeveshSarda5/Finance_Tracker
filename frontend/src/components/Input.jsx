export default function Input({ label, error, prefix, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-espresso-700">{label}</span>}
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-taupe-500">
            {prefix}
          </span>
        )}
        <input
          className={`w-full rounded-lg border bg-cream-surface py-2 text-sm text-espresso-900 outline-none
            transition placeholder:text-taupe-400
            focus:border-brown-500 focus:ring-1 focus:ring-brown-500
            ${prefix ? 'pl-7 pr-3' : 'px-3'}
            ${error ? 'border-rust-600' : 'border-cream-border'} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="mt-1 block text-xs text-rust-600">{error}</span>}
    </label>
  );
}
