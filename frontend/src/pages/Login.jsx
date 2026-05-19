import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return setError('Email and password required');
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500">ZeelTech</h1>
          <p className="text-gray-400 text-sm mt-1">Agency Command Center</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
          <h2 className="text-white font-semibold text-lg">Sign in</h2>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 block mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-yellow-500 transition"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Password</label>
            <input
              type="password"
              className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-yellow-500 transition"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-gray-900 font-semibold text-sm py-2.5 rounded-lg transition"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">ZeelTech Web Solutions · v2.0</p>
      </div>
    </div>
  );
}