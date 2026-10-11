export default function ProgressBar({ percent, color = '#dc2626' }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const isOver = percent > 100;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-brown-100">
      <div
        className="h-full rounded-full transition-all duration-300"
        // Over-budget uses a distinctly darker shade of the same red family
        // rather than a different hue — the base color is already red for
        // every expense category, so "worse" needs to read through depth,
        // not a hue swap.
        style={{ width: `${clamped}%`, backgroundColor: isOver ? '#7f1d1d' : color }}
      />
    </div>
  );
}
