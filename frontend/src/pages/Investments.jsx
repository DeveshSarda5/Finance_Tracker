import { useEffect, useState, useCallback } from 'react';
import apiClient from '../api/client';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import InvestmentFormModal from '../components/InvestmentFormModal';
import { formatCurrency, formatDate } from '../utils/format';

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await apiClient.get('/investments');
    setInvestments(data.investments);
    setTotalInvested(data.totalInvested);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!confirm('Remove this investment entry?')) return;
    await apiClient.delete(`/investments/${id}`);
    load();
  }

  const thisMonthTotal = investments
    .filter((i) => i.invested_date.slice(0, 7) === new Date().toISOString().slice(0, 7))
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-espresso-900">Investments</h1>
          <p className="mt-1 text-sm text-taupe-500">Track SIPs, deposits, and other contributions over time.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Add investment</Button>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total invested" value={formatCurrency(totalInvested)} tone="investment" icon="◎" />
        <StatCard label="This month" value={formatCurrency(thisMonthTotal)} tone="investment" icon="↗" />
      </div>

      <Card className="mt-6" title="Contribution history">
        {loading ? (
          <p className="py-10 text-center text-sm text-taupe-500">Loading…</p>
        ) : investments.length === 0 ? (
          <p className="py-10 text-center text-sm text-taupe-500">
            No investments logged yet. Add your first SIP or deposit!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-cream-border text-xs uppercase tracking-wide text-taupe-500">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Notes</th>
                  <th className="py-2 pr-4 text-right font-medium">Amount</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {investments.map((i) => (
                  <tr
                    key={i.id}
                    className="border-b border-cream-borderSoft transition-colors last:border-0 hover:bg-cream-bg"
                  >
                    <td className="py-3 pr-4 tabular-nums text-taupe-500 whitespace-nowrap">
                      {formatDate(i.invested_date)}
                    </td>
                    <td className="py-3 pr-4 font-medium text-espresso-900">{i.name}</td>
                    <td className="py-3 pr-4 text-taupe-500">{i.notes || '—'}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-right font-semibold tabular-nums text-finance-investment">
                      +{formatCurrency(i.amount)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => handleDelete(i.id)}
                        className="text-xs font-medium text-taupe-400 hover:text-rust-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <InvestmentFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={load} />
    </AppLayout>
  );
}
