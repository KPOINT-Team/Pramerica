import { useState } from 'react';
import { login } from '../services/authService.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LoginPage() {
  const { setAuthed } = useAuth();
  const [agentId, setAgentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(agentId, password);
      setAuthed(true);
    } catch (err) {
      setError(err.message === 'invalid_credentials'
        ? 'Invalid Agent ID or Password'
        : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0066b3] to-[#003d6b] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#0066b3] rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Video KYC</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to start your session</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 mb-1.5">
              Agent ID
            </label>
            <input
              id="agentId"
              type="text"
              required
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066b3] focus:border-transparent transition"
              placeholder="Enter your Agent ID"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066b3] focus:border-transparent transition"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 rounded-lg py-2 px-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0066b3] text-white font-semibold rounded-lg hover:bg-[#005299] focus:outline-none focus:ring-2 focus:ring-[#0066b3] focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Pramerica Life Insurance
        </p>
      </div>
    </div>
  );
}
