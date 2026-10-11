import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-cream-border bg-cream-surface p-8 shadow-soft">
        <span className="text-sm font-extrabold tracking-tight text-brown-600">FinDash</span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-espresso-900">Welcome back</h1>
        <p className="mt-1 text-sm text-taupe-500">Log in to your finance dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-sm text-rust-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-taupe-500">
          No account?{' '}
          <Link to="/register" className="font-semibold text-brown-600 hover:text-brown-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
