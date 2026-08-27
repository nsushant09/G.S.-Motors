import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutList, LogOut, MessageSquareText } from 'lucide-react';
import { useAdminAuth } from '../../lib/adminAuth';

const LINKS = [
  { to: '/admin/cars', label: 'Cars', icon: LayoutList },
  { to: '/admin/quotes', label: 'Quotes', icon: MessageSquareText },
];

export function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-bone">
      <aside className="flex w-56 shrink-0 flex-col border-r border-moss/15 bg-forest text-cream">
        <div className="px-6 py-6">
          <img src="/logo_light.png" alt="GS Motors" className="h-8 w-auto" />
          <p className="mt-1 font-mono text-[10px] tracking-[0.15em] text-cream/50">ADMIN</p>
        </div>
        <nav className="flex-1 px-3">
          {LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `mb-1 flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors ${
                    isActive ? 'bg-cream/10 text-cream' : 'text-cream/70 hover:bg-cream/5 hover:text-cream'
                  }`
                }
              >
                <Icon size={16} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-3 pb-6">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm text-cream/70 transition-colors hover:bg-cream/5 hover:text-cream"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
