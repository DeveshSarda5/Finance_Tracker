import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', icon: '⌂' },
  { to: '/transactions', label: 'Transactions', icon: '⇄' },
  { to: '/budgets', label: 'Budgets', icon: '◎' },
  { to: '/investments', label: 'Investments', icon: '↗' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-cream-surface">
      <div className="px-7 py-7">
        <span className="text-lg font-extrabold tracking-tight text-espresso-900">FinDash</span>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-brown-100 text-brown-700' : 'text-taupe-500 hover:bg-brown-100/60 hover:text-espresso-900'
              }`
            }
          >
            <span className="w-4 text-center text-base leading-none">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="mx-4 mb-6 rounded-xl border border-cream-border p-4">
        <p className="truncate text-sm font-semibold text-espresso-900">{user?.name}</p>
        <p className="truncate text-xs text-taupe-500">{user?.email}</p>
        <button
          onClick={logout}
          className="mt-3 w-full rounded-lg border border-cream-border py-1.5 text-sm font-medium text-espresso-700 transition-colors hover:border-brown-400 hover:text-espresso-900"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
