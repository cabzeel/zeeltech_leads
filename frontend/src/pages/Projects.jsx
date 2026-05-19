import { useState, useEffect } from 'react';
import axios from 'axios';

const STATUS_COLORS = {
  proposal_sent: 'bg-blue-900 text-blue-300',
  deposit_pending: 'bg-yellow-900 text-yellow-300',
  in_progress: 'bg-purple-900 text-purple-300',
  review: 'bg-orange-900 text-orange-300',
  delivered: 'bg-teal-900 text-teal-300',
  completed: 'bg-green-900 text-green-300',
  cancelled: 'bg-red-900 text-red-300',
};

const TIER_COLORS = {
  basic: 'text-green-400',
  mid: 'text-yellow-400',
  top: 'text-red-400',
};

const EMPTY_FORM = {
  clientName: '', businessName: '', service: '', tier: 'mid',
  market: 'cameroon', currency: 'XAF', totalPrice: '',
  depositAmount: '', balanceAmount: '', contactChannel: '',
  contactHandle: '', deadline: '', notes: '',
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchProjects(); fetchStats(); }, [filterStatus]);

  async function fetchProjects() {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const res = await axios.get('/projects', { params });
      setProjects(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function fetchStats() {
    try {
      const res = await axios.get('/projects/stats/revenue');
      setStats(res.data.data);
    } catch (err) { console.error(err); }
  }

  async function saveProject() {
    setSaving(true);
    try {
      if (selected?._id && showForm === 'edit') {
        await axios.patch(`/projects/${selected._id}`, form);
      } else {
        await axios.post('/projects', form);
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setSelected(null);
      fetchProjects();
      fetchStats();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  }

  async function markDeposit(id) {
    if (!confirm('Mark deposit as paid? This will start the project.')) return;
    await axios.patch(`/projects/${id}/deposit`);
    fetchProjects(); fetchStats();
    setSelected(null);
  }

  async function markComplete(id) {
    if (!confirm('Mark project as completed? This confirms balance received.')) return;
    await axios.patch(`/projects/${id}/complete`);
    fetchProjects(); fetchStats();
    setSelected(null);
  }

  async function deleteProject(id) {
    if (!confirm('Delete this project?')) return;
    await axios.delete(`/projects/${id}`);
    fetchProjects(); fetchStats();
    setSelected(null);
  }

  function openEdit(project) {
    setForm({
      clientName: project.clientName || '',
      businessName: project.businessName || '',
      service: project.service || '',
      tier: project.tier || 'mid',
      market: project.market || 'cameroon',
      currency: project.currency || 'XAF',
      totalPrice: project.totalPrice || '',
      depositAmount: project.depositAmount || '',
      balanceAmount: project.balanceAmount || '',
      contactChannel: project.contactChannel || '',
      contactHandle: project.contactHandle || '',
      deadline: project.deadline ? project.deadline.slice(0, 10) : '',
      notes: project.notes || '',
    });
    setSelected(project);
    setShowForm('edit');
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Projects</h2>
            <button
              onClick={() => { setForm(EMPTY_FORM); setShowForm('new'); setSelected(null); }}
              className="text-xs bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-3 py-1.5 rounded-lg"
            >
              + New
            </button>
          </div>
          <select
            className="w-full bg-gray-800 text-gray-200 text-sm rounded px-3 py-2 border border-gray-700 focus:outline-none"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Revenue stats */}
        {stats && (
          <div className="px-4 py-3 border-b border-gray-800 grid grid-cols-2 gap-2">
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <p className="text-yellow-400 text-sm font-bold">{stats.totalXAF?.toLocaleString()} XAF</p>
              <p className="text-gray-500 text-xs">Earned</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <p className="text-green-400 text-sm font-bold">${stats.totalUSD}</p>
              <p className="text-gray-500 text-xs">Earned USD</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <p className="text-white text-sm font-bold">{stats.completedDeals}</p>
              <p className="text-gray-500 text-xs">Closed</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <p className="text-purple-400 text-sm font-bold">{stats.inProgress}</p>
              <p className="text-gray-500 text-xs">In Progress</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-8 text-sm">Loading...</p>
          ) : projects.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">No projects yet</p>
          ) : (
            projects.map(p => (
              <div
                key={p._id}
                onClick={() => { setSelected(p); setShowForm(false); }}
                className={`px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition ${selected?._id === p._id && !showForm ? 'bg-gray-800' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white truncate">{p.clientName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[p.status]}`}>
                    {p.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{p.service}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-semibold ${TIER_COLORS[p.tier]}`}>{p.tier.toUpperCase()}</span>
                  <span className="text-xs text-gray-500">{p.totalPrice?.toLocaleString()} {p.currency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main panel */}
      <main className="flex-1 overflow-y-auto p-6">
        {showForm ? (
          <div className="max-w-lg mx-auto">
            <h3 className="text-white font-bold text-lg mb-5">{showForm === 'edit' ? 'Edit Project' : 'New Project'}</h3>
            <div className="space-y-4">
              {[
                { label: 'Client Name', key: 'clientName', placeholder: 'Full name' },
                { label: 'Business Name', key: 'businessName', placeholder: 'Company / restaurant / hotel' },
                { label: 'Service', key: 'service', placeholder: 'e.g. Website Design & Development' },
                { label: 'Contact Handle', key: 'contactHandle', placeholder: '@handle or number' },
                { label: 'Notes', key: 'notes', placeholder: 'Any notes...', textarea: true },
              ].map(({ label, key, placeholder, textarea }) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 block mb-1">{label}</label>
                  {textarea ? (
                    <textarea
                      className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none resize-none"
                      rows={3} placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    />
                  ) : (
                    <input
                      className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Tier</label>
                  <select className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                    value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                    <option value="basic">Basic</option>
                    <option value="mid">Mid</option>
                    <option value="top">Top</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Market</label>
                  <select className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                    value={form.market} onChange={e => setForm(f => ({ ...f, market: e.target.value, currency: e.target.value === 'cameroon' ? 'XAF' : 'USD' }))}>
                    <option value="cameroon">Cameroon</option>
                    <option value="international">International</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Total Price ({form.currency})</label>
                  <input type="number" className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                    placeholder="0" value={form.totalPrice}
                    onChange={e => setForm(f => ({ ...f, totalPrice: e.target.value, depositAmount: (e.target.value / 2).toFixed(0), balanceAmount: (e.target.value / 2).toFixed(0) }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Deadline</label>
                  <input type="date" className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                    value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Contact Channel</label>
                  <select className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                    value={form.contactChannel} onChange={e => setForm(f => ({ ...f, contactChannel: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="instagram">Instagram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="facebook">Facebook</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={saveProject} disabled={saving}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-gray-900 font-semibold text-sm py-2.5 rounded-lg transition">
                  {saving ? 'Saving...' : 'Save Project'}
                </button>
                <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  className="px-4 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : selected ? (
          <div className="max-w-lg mx-auto space-y-5">
            {/* Header */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">{selected.clientName}</h3>
                  <p className="text-gray-400 text-sm">{selected.businessName}</p>
                  <p className="text-gray-400 text-sm mt-1">{selected.service}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[selected.status]}`}>
                  {selected.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className={`text-sm font-bold ${TIER_COLORS[selected.tier]}`}>{selected.tier?.toUpperCase()}</p>
                  <p className="text-gray-500 text-xs">Tier</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-yellow-400 text-sm font-bold">{selected.totalPrice?.toLocaleString()} {selected.currency}</p>
                  <p className="text-gray-500 text-xs">Total</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-white text-sm font-bold">{selected.market}</p>
                  <p className="text-gray-500 text-xs">Market</p>
                </div>
              </div>
            </div>

            {/* Payment status */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-300 font-medium text-sm mb-3">Payment Status</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Deposit (50%) — {selected.depositAmount?.toLocaleString()} {selected.currency}</span>
                  <span className={`text-xs font-semibold ${selected.depositPaid ? 'text-green-400' : 'text-yellow-400'}`}>
                    {selected.depositPaid ? '✓ Paid' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Balance (50%) — {selected.balanceAmount?.toLocaleString()} {selected.currency}</span>
                  <span className={`text-xs font-semibold ${selected.balancePaid ? 'text-green-400' : 'text-yellow-400'}`}>
                    {selected.balancePaid ? '✓ Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-300 font-medium text-sm mb-3">Actions</p>
              <div className="flex flex-wrap gap-2">
                {!selected.depositPaid && (
                  <button onClick={() => markDeposit(selected._id)} className="text-xs bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg">
                    Mark Deposit Paid
                  </button>
                )}
                {selected.depositPaid && !selected.balancePaid && (
                  <button onClick={() => markComplete(selected._id)} className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg">
                    Mark Complete + Balance Paid
                  </button>
                )}
                <button onClick={() => openEdit(selected)} className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg">
                  Edit
                </button>
                <button onClick={() => deleteProject(selected._id)} className="text-xs bg-red-800 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg">
                  Delete
                </button>
              </div>
            </div>

            {selected.notes && (
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <p className="text-gray-300 font-medium text-sm mb-2">Notes</p>
                <p className="text-gray-400 text-sm">{selected.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select a project or create a new one
          </div>
        )}
      </main>
    </div>
  );
}