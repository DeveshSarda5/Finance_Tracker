import { useEffect, useState, useCallback } from 'react';
import apiClient from '../api/client';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import TransactionFormModal from '../components/TransactionFormModal';
import { formatCurrency, formatDate } from '../utils/format';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadTransactions = useCallback(async (page = 1, searchTerm = search) => {
    setLoading(true);
    const { data } = await apiClient.get('/transactions', {
      params: { page, pageSize: 15, search: searchTerm || undefined },
    });
    setTransactions(data.transactions);
    setPagination(data.pagination);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    apiClient.get('/categories').then((res) => setCategories(res.data.categories));
    loadTransactions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return;
    await apiClient.delete(`/transactions/${id}`);
    loadTransactions(pagination.page);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadTransactions(1, search);
  }

  function openAddModal() {
    setEditingTransaction(null);
    setModalOpen(true);
  }

  function openEditModal(transaction) {
    setEditingTransaction(transaction);
    setModalOpen(true);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const response = await apiClient.get('/transactions/export', { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-espresso-900">Transactions</h1>
          <p className="mt-1 text-sm text-taupe-500">All your income and expenses.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
          <Button onClick={openAddModal}>+ Add transaction</Button>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="mt-6 max-w-sm">
        <Input
          placeholder="Search description or merchant…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <Card className="mt-4">
        {loading ? (
          <p className="py-10 text-center text-sm text-taupe-500">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="py-10 text-center text-sm text-taupe-500">No transactions yet. Add your first one!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-cream-border text-xs uppercase tracking-wide text-taupe-500">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Description</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 text-right font-medium">Amount</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-cream-borderSoft transition-colors last:border-0 hover:bg-cream-bg"
                  >
                    <td className="py-3 pr-4 tabular-nums text-taupe-500 whitespace-nowrap">{formatDate(t.txn_date)}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-espresso-900">{t.description || t.merchant || '—'}</p>
                      {t.merchant && t.description && <p className="text-xs text-taupe-500">{t.merchant}</p>}
                    </td>
                    <td className="py-3 pr-4">
                      {t.category_name ? (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: `${t.category_color}1f`, color: t.category_color }}
                        >
                          {t.category_name}
                          {t.auto_categorized ? ' ✨' : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-taupe-400">Uncategorized</span>
                      )}
                    </td>
                    <td
                      className={`py-3 pr-4 whitespace-nowrap text-right font-semibold tabular-nums ${
                        t.type === 'income' ? 'text-finance-income' : 'text-finance-expense'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="py-3 pr-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(t)}
                        className="text-xs font-medium text-taupe-400 hover:text-brown-600"
                      >
                        Edit
                      </button>
                      <span className="mx-1.5 text-cream-border">·</span>
                      <button
                        onClick={() => handleDelete(t.id)}
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

        {pagination.totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between text-sm">
            <Button
              variant="secondary"
              disabled={pagination.page <= 1}
              onClick={() => loadTransactions(pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="text-taupe-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadTransactions(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      <TransactionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => loadTransactions(pagination.page)}
        categories={categories}
        transaction={editingTransaction}
      />
    </AppLayout>
  );
}
