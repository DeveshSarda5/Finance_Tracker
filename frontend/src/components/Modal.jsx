export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-900/40 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-cream-border bg-cream-surface p-6 shadow-panel"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-espresso-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-taupe-500 hover:bg-brown-100 hover:text-espresso-900"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
