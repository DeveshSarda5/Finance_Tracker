import { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import apiClient from '../api/client';

const today = () => new Date().toISOString().slice(0, 10);

export default function InvestmentFormModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', amount: '', investedDate: today(), notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiClient.post('/investments', { ...form, amount: Number(form.amount) });
      setForm({ name: '', amount: '', investedDate: today(), notes: '' });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save investment');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add investment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          placeholder="e.g. SIP - Index Fund"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
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
          <Input
            label="Date"
            type="date"
            required
            value={form.investedDate}
            onChange={(e) => setForm({ ...form, investedDate: e.target.value })}
          />
        </div>

        <Input
          label="Notes (optional)"
          placeholder="e.g. Monthly SIP installment"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        {error && <p className="text-sm text-rust-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save investment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
