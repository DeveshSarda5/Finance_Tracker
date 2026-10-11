import { useEffect, useState, useCallback } from 'react';
import apiClient from '../api/client';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import PeriodToggle from '../components/PeriodToggle';
import SpendingByCategoryChart from '../charts/SpendingByCategoryChart';
import MonthlyTrendChart from '../charts/MonthlyTrendChart';
import { formatCurrency } from '../utils/format';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [loading, setLoading] = useState(true);

  const [categoryPeriod, setCategoryPeriod] = useState('month');
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [trendPeriod, setTrendPeriod] = useState('6months');
  const [trend, setTrend] = useState({ series: [], granularity: 'month' });
  const [trendLoading, setTrendLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [summaryRes, budgetRes, investmentRes] = await Promise.all([
        apiClient.get('/analytics/summary'),
        apiClient.get('/budgets'),
        apiClient.get('/investments'),
      ]);
      setSummary(summaryRes.data);
      setBudgets(budgetRes.data.budgets);
      setTotalInvested(investmentRes.data.totalInvested);
      setLoading(false);
    }
    load();
  }, []);

  const loadCategories = useCallback(async (period) => {
    setCategoryLoading(true);
    const { data } = await apiClient.get('/analytics/spending-by-category', { params: { period } });
    setCategories(data.categories);
    setCategoryLoading(false);
  }, []);

  const loadTrend = useCallback(async (period) => {
    setTrendLoading(true);
    const { data } = await apiClient.get('/analytics/trend', { params: { period } });
    setTrend({ series: data.series, granularity: data.granularity });
    setTrendLoading(false);
  }, []);

  useEffect(() => {
    loadCategories(categoryPeriod);
  }, [categoryPeriod, loadCategories]);

  useEffect(() => {
    loadTrend(trendPeriod);
  }, [trendPeriod, loadTrend]);

  if (loading) {
    return (
      <AppLayout>
        <p className="text-sm text-taupe-500">Loading dashboard…</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold tracking-tight text-espresso-900">Dashboard</h1>
      <p className="mt-1 text-sm text-taupe-500">Your finances this month, at a glance.</p>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Income" value={formatCurrency(summary.totalIncome)} tone="positive" icon="↑" />
        <StatCard label="Expenses" value={formatCurrency(summary.totalExpense)} tone="negative" icon="↓" />
        <StatCard
          label="Net savings"
          value={formatCurrency(summary.netSavings)}
          tone={summary.netSavings >= 0 ? 'positive' : 'negative'}
          icon="₹"
        />
        <StatCard label="Total invested" value={formatCurrency(totalInvested)} tone="investment" icon="◎" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="Spending by category"
          action={<PeriodToggle value={categoryPeriod} onChange={setCategoryPeriod} />}
        >
          <div className={`transition-opacity duration-150 ${categoryLoading ? 'opacity-40' : 'opacity-100'}`}>
            <SpendingByCategoryChart categories={categories} />
          </div>
        </Card>
        <Card
          title="Income vs. expenses"
          action={<PeriodToggle value={trendPeriod} onChange={setTrendPeriod} />}
        >
          <div className={`transition-opacity duration-150 ${trendLoading ? 'opacity-40' : 'opacity-100'}`}>
            <MonthlyTrendChart series={trend.series} granularity={trend.granularity} />
          </div>
        </Card>
      </div>

      <Card title="Budget progress" className="mt-6">
        {budgets.length === 0 ? (
          <p className="py-8 text-center text-sm text-taupe-500">
            No budgets set for this month yet. Head to the Budgets page to create one.
          </p>
        ) : (
          <div className="space-y-5">
            {budgets.map((b) => (
              <div key={b.id} className="-mx-2 rounded-lg px-2 py-1 transition-colors hover:bg-cream-bg">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-espresso-900">{b.category_name}</span>
                  <span className="text-taupe-500 tabular-nums">
                    {formatCurrency(b.spent)} / {formatCurrency(b.amount_limit)} ({b.percentUsed}%)
                  </span>
                </div>
                <ProgressBar percent={b.percentUsed} color={b.category_color} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
