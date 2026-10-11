import { useEffect, useState, useCallback } from 'react';
import apiClient from '../api/client';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import BudgetFormModal from '../components/BudgetFormModal';
import { formatCurrency } from '../utils/format';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await apiClient.get('/budgets');
    setBudgets(data.budgets);
    setLoading(false);
  }, []);

  useEffect(() => {
    apiClient.get('/categories').then((res) => setCategories(res.data.categories));
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!confirm('Remove this budget?')) return;
    await apiClient.delete(`/budgets/${id}`);
    load();
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-espresso-900">Budgets</h1>
          <p className="mt-1 text-sm text-taupe-500">Set monthly limits per category and track progress.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Set budget</Button>
      </div>

      <Card className="mt-6">
        {loading ? (
          <p className="py-10 text-center text-sm text-taupe-500">Loading…</p>
        ) : budgets.length === 0 ? (
          <p className="py-10 text-center text-sm text-taupe-500">No budgets yet for this month.</p>
        ) : (
          <div className="space-y-5">
            {budgets.map((b) => (
              <div
                key={b.id}
                className="-mx-2 rounded-lg border-b border-cream-borderSoft px-2 pb-4 pt-1 transition-colors last:border-0 last:pb-0 hover:bg-cream-bg"
              >
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-espresso-900">{b.category_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-taupe-500 tabular-nums">
                      {formatCurrency(b.spent)} / {formatCurrency(b.amount_limit)}
                    </span>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-xs font-medium text-taupe-400 hover:text-rust-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <ProgressBar percent={b.percentUsed} color={b.category_color} />
                <p className="mt-1 text-xs text-taupe-500">
                  {b.percentUsed}% used
                  {b.remaining < 0 ? ` · over by ${formatCurrency(Math.abs(b.remaining))}` : ` · ${formatCurrency(b.remaining)} left`}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <BudgetFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        categories={categories}
      />
    </AppLayout>
  );
}
