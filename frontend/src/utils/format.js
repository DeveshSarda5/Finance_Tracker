// Centralized formatting for an India-first audience: ₹ with lakh/crore
// grouping (1,00,000 not 100,000) and DD/MM/YYYY dates, regardless of the
// visitor's browser locale.

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount) {
  return currencyFormatter.format(Number(amount));
}

export function formatDate(isoDate) {
  if (!isoDate) return '—';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}
