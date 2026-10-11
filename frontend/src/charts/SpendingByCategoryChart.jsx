import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../utils/format';

ChartJS.register(ArcElement, Tooltip, Legend);

// Overflow color for the aggregated "Other categories" slice — neutral, not
// part of the categorical identity set, since it isn't a real single category.
const OVERFLOW_COLOR = '#898781';
const MAX_SLICES = 6;

function groupTopCategories(categories) {
  if (categories.length <= MAX_SLICES + 1) return categories;

  const sorted = [...categories].sort((a, b) => b.total - a.total);
  const top = sorted.slice(0, MAX_SLICES);
  const rest = sorted.slice(MAX_SLICES);
  const restTotal = rest.reduce((sum, c) => sum + c.total, 0);

  return [...top, { categoryId: 'other', categoryName: 'Other categories', color: OVERFLOW_COLOR, total: restTotal }];
}

export default function SpendingByCategoryChart({ categories }) {
  if (!categories.length) {
    return <p className="py-14 text-center text-sm text-taupe-500">No expenses in this period yet.</p>;
  }

  const grouped = groupTopCategories(categories);

  const data = {
    labels: grouped.map((c) => c.categoryName),
    datasets: [
      {
        data: grouped.map((c) => c.total),
        backgroundColor: grouped.map((c) => c.color),
        hoverBackgroundColor: grouped.map((c) => c.color),
        borderWidth: 2,
        borderColor: '#FFFDF9',
        hoverBorderColor: '#FFFDF9',
        hoverBorderWidth: 3,
        // Pops the hovered slice outward — the doughnut's hover affordance.
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    interaction: { mode: 'nearest', intersect: true },
    animation: { duration: 250, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        position: 'right',
        labels: { boxWidth: 10, padding: 14, font: { size: 12, family: 'Manrope' }, color: '#4A3728' },
      },
      tooltip: {
        backgroundColor: '#2E2118',
        titleFont: { family: 'Manrope', weight: '600' },
        bodyFont: { family: 'Manrope' },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed)}`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: 260 }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
