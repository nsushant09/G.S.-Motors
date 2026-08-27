import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { adminLogin, ApiRequestError } from '../../lib/api';
import { useAdminAuth } from '../../lib/adminAuth';
import { usePageMeta } from '../../hooks/usePageMeta';

export function AdminLogin() {
  usePageMeta('Admin login', 'GS Motors admin dashboard.');
  const { setToken, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin/cars" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = await adminLogin(email, password);
      setToken(token);
      navigate('/admin/cars', { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded border border-cream/15 bg-forest-deep p-8">
        <img src="/logo_light.png" alt="GS Motors" className="h-8 w-auto" />
        <h1 className="mt-6 font-display text-xl text-cream">Admin login</h1>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs text-cream/60">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-cream/20 bg-transparent px-4 py-2.5 text-sm text-cream focus:border-cream/50"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-cream/60">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-cream/20 bg-transparent px-4 py-2.5 text-sm text-cream focus:border-cream/50"
            />
          </label>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-cream px-6 py-3 text-sm font-medium text-forest transition-colors hover:bg-cream/90 disabled:opacity-50"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </div>
      </form>
    </div>
  );
}
