import { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import apiClient from '../api/client';

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function BudgetFormModal({ open, onClose, onSaved, categories }) {
  const [form, setForm] = useState({ categoryId: '', amountLimit: '', period: currentPeriod() });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiClient.post('/budgets', { ...form, amountLimit: Number(form.amountLimit) });
      onSaved();
      onClose();
      setForm({ categoryId: '', amountLimit: '', period: currentPeriod() });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save budget');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Set a budget">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Category"
          required
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          <option value="" disabled>
            Choose a category
          </option>
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Input
          label="Monthly limit"
          prefix="₹"
          type="number"
          step="0.01"
          min="1"
          required
          value={form.amountLimit}
          onChange={(e) => setForm({ ...form, amountLimit: e.target.value })}
        />

        <Input
          label="Month"
          type="month"
          required
          value={form.period}
          onChange={(e) => setForm({ ...form, period: e.target.value })}
        />

        {error && <p className="text-sm text-rust-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
