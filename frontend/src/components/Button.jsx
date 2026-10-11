const variants = {
  primary: 'bg-brown-600 text-cream-surface hover:bg-brown-700 focus-visible:outline-brown-600',
  secondary:
    'bg-cream-surface text-espresso-700 border border-cream-border hover:border-brown-400 hover:text-espresso-900 focus-visible:outline-brown-400',
  danger: 'bg-rust-600 text-cream-surface hover:bg-rust-700 focus-visible:outline-rust-600',
  ghost: 'text-taupe-500 hover:bg-brown-100/60 hover:text-espresso-900 focus-visible:outline-brown-400',
};

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold
        tracking-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
