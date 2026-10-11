import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatCurrency } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

// Income vs. expense encodes polarity (money in vs. money out), matching
// the app-wide semantic scheme: green for income, red for expense.
const INCOME_COLOR = '#16a34a';
const INCOME_HOVER = '#15803d';
const EXPENSE_COLOR = '#dc2626';
const EXPENSE_HOVER = '#b91c1c';

function formatBucketLabel(bucket, granularity) {
  const [year, month, day] = bucket.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (granularity === 'month') {
    return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
  }
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Compact axis label — lakh/crore grouping without the decimals a full
// currency formatter would add (too noisy at tick-label scale).
function formatAxisRupees(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export default function MonthlyTrendChart({ series, granularity = 'day' }) {
  if (!series?.length) {
    return <p className="py-14 text-center text-sm text-taupe-500">Not enough data yet.</p>;
  }

  const data = {
    labels: series.map((s) => formatBucketLabel(s.bucket, granularity)),
    datasets: [
      {
        label: 'Income',
        data: series.map((s) => s.income),
        backgroundColor: INCOME_COLOR,
        hoverBackgroundColor: INCOME_HOVER,
        borderRadius: 4,
        hoverBorderWidth: 0,
      },
      {
        label: 'Expenses',
        data: series.map((s) => s.expense),
        backgroundColor: EXPENSE_COLOR,
        hoverBackgroundColor: EXPENSE_HOVER,
        borderRadius: 4,
        hoverBorderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#8A7B6C',
          font: { family: 'Manrope', size: 11 },
          maxRotation: 0,
          autoSkip: true,
          autoSkipPadding: 12,
        },
      },
      y: {
        grid: { color: '#EFE4D2' },
        border: { display: false },
        ticks: { color: '#8A7B6C', font: { family: 'Manrope', size: 11 }, callback: formatAxisRupees },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { boxWidth: 10, font: { family: 'Manrope', size: 12 }, color: '#4A3728' },
      },
      tooltip: {
        backgroundColor: '#2E2118',
        titleFont: { family: 'Manrope', weight: '600' },
        bodyFont: { family: 'Manrope' },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
  };

  return (
    <div style={{ height: 280 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
