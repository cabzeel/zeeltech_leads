import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await axios.get('/auth/users');
      setUsers(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function createUser() {
    setSaving(true);
    setError('');
    try {
      await axios.post('/auth/register', form);
      setForm({ name: '', email: '', password: '', role: 'employee' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally { setSaving(false); }
  }

  async function toggleActive(u) {
    await axios.patch(`/auth/users/${u._id}`, { isActive: !u.isActive });
    fetchUsers();
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Current user */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-xs font-semibold mb-3">LOGGED IN AS</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className="text-xs text-yellow-400 font-semibold">{user?.role?.toUpperCase()}</span>
            </div>
            <button onClick={logout}
              className="text-xs bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
              Sign Out
            </button>
          </div>
        </div>

        {/* User management */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold">Team Members</p>
            <button onClick={() => setShowForm(!showForm)}
              className="text-xs bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-3 py-1.5 rounded-lg">
              {showForm ? 'Cancel' : '+ Add Employee'}
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-800 rounded-lg p-4 mb-4 space-y-3">
              <p className="text-gray-300 text-sm font-medium">New Employee Account</p>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Employee name' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'employee@email.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: 'Temporary password' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 block mb-1">{label}</label>
                  <input type={type}
                    className="w-full bg-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none"
                    placeholder={placeholder} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Role</label>
                <select className="w-full bg-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none"
                  value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="employee">Employee</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <button onClick={createUser} disabled={saving}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 text-gray-900 font-semibold text-sm py-2 rounded-lg">
                {saving ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500 text-sm">No team members yet.</p>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u._id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{u.name}</p>
                    <p className="text-gray-400 text-xs">{u.email}</p>
                    <div className="flex gap-2 mt-0.5">
                      <span className={`text-xs font-semibold ${u.role === 'superadmin' ? 'text-yellow-400' : 'text-blue-400'}`}>
                        {u.role}
                      </span>
                      <span className={`text-xs ${u.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {u.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </div>
                  </div>
                  {u._id !== user?.id && (
                    <button onClick={() => toggleActive(u)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition ${u.isActive ? 'bg-red-800 hover:bg-red-700 text-white' : 'bg-green-800 hover:bg-green-700 text-white'}`}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Access level reference */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-white font-semibold mb-3">Access Levels</p>
          <div className="space-y-2">
            {[
              ['Super Admin (You)', 'Full access — all tabs, all data, user management', 'text-yellow-400'],
              ['Employee', 'Lead management only — Leads + Follow-ups tabs', 'text-blue-400'],
            ].map(([role, desc, color]) => (
              <div key={role} className="flex gap-3 bg-gray-800 rounded-lg px-4 py-3">
                <p className={`text-sm font-semibold ${color} flex-shrink-0 w-36`}>{role}</p>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}