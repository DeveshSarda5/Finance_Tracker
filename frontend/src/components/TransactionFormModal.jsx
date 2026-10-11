import { useEffect, useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import apiClient from '../api/client';

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = { type: 'expense', amount: '', description: '', merchant: '', txnDate: today(), categoryId: '' };

function formFromTransaction(t) {
  return {
    type: t.type,
    amount: String(t.amount),
    description: t.description || '',
    merchant: t.merchant || '',
    txnDate: t.txn_date,
    categoryId: t.category_id ? String(t.category_id) : '',
  };
}

export default function TransactionFormModal({ open, onClose, onSaved, categories, transaction }) {
  const isEditing = Boolean(transaction);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(transaction ? formFromTransaction(transaction) : emptyForm);
    setError('');
  }, [open, transaction]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, amount: Number(form.amount), categoryId: form.categoryId || undefined };
      if (isEditing) {
        await apiClient.put(`/transactions/${transaction.id}`, payload);
      } else {
        await apiClient.post('/transactions', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save transaction');
    } finally {
      setSaving(false);
    }
  }

  const filteredCategories = categories.filter((c) => c.type === form.type);

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit transaction' : 'Add transaction'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, categoryId: '' })}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
          <Input
            label="Amount"
            prefix="₹"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>

        <Input
          label="Description"
          placeholder="e.g. Starbucks coffee"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Input
          label="Merchant (optional)"
          value={form.merchant}
          onChange={(e) => setForm({ ...form, merchant: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date"
            type="date"
            required
            value={form.txnDate}
            onChange={(e) => setForm({ ...form, txnDate: e.target.value })}
          />
          <Select
            label="Category (optional)"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Auto-detect</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        {form.type === 'expense' && !form.categoryId && (
          <p className="text-xs text-taupe-500">
            Leave category blank and our ML service will suggest one from the description.
          </p>
        )}

        {error && <p className="text-sm text-rust-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Save transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
