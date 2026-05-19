import { useState, useEffect } from 'react';
import axios from 'axios';

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'bg-gray-800 text-gray-400', dot: 'bg-gray-600' },
  learning: { label: 'Learning', color: 'bg-blue-900 text-blue-300', dot: 'bg-blue-500' },
  building: { label: 'Building', color: 'bg-yellow-900 text-yellow-300', dot: 'bg-yellow-500' },
  ready_to_sell: { label: 'Ready to Sell', color: 'bg-green-900 text-green-300', dot: 'bg-green-500' },
  delivered: { label: 'Delivered', color: 'bg-purple-900 text-purple-300', dot: 'bg-purple-500' },
};

const TIER_COLORS = {
  basic: 'text-green-400',
  mid: 'text-yellow-400',
  top: 'text-red-400',
  retainer: 'text-blue-400',
};

const PHASES = [1, 2, 3, 4, 5];
const PHASE_LABELS = {
  1: 'Core Foundation',
  2: 'Backend & Integration',
  3: 'SEO, Performance & Design',
  4: 'Marketing, Ads & Analytics',
  5: 'Infrastructure & Integrations',
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  async function fetchServices() {
    setLoading(true);
    try {
      const res = await axios.get('/services');
      setServices(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function seedServices() {
    setSeeding(true);
    try {
      await axios.post('/services/seed');
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.error || 'Seed failed');
    } finally { setSeeding(false); }
  }

  async function updateStatus(id, status) {
    await axios.patch(`/services/${id}`, { status });
    fetchServices();
    setSelected(prev => prev ? { ...prev, status } : null);
  }

  async function saveNotes(id) {
    setSaving(true);
    try {
      await axios.patch(`/services/${id}`, { notes });
      fetchServices();
    } finally { setSaving(false); }
  }

  async function toggleCheckpoint(serviceId, idx) {
    await axios.patch(`/services/${serviceId}/checkpoint/${idx}`);
    fetchServices();
    // refresh selected
    const res = await axios.get('/services');
    const updated = res.data.data.find(s => s._id === serviceId);
    if (updated) setSelected(updated);
  }

  async function markDelivered(id) {
    await axios.patch(`/services/${id}/delivered`);
    fetchServices();
    setSelected(prev => prev ? { ...prev, status: 'delivered' } : null);
  }

  const byPhase = PHASES.reduce((acc, p) => {
    acc[p] = services.filter(s => s.phase === p);
    return acc;
  }, {});

  const readyCount = services.filter(s => s.status === 'ready_to_sell' || s.status === 'delivered').length;
  const deliveringCount = services.filter(s => s.status === 'delivered').length;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Service Mastery</h2>
            {services.length === 0 && (
              <button onClick={seedServices} disabled={seeding}
                className="text-xs bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-gray-900 font-semibold px-3 py-1.5 rounded-lg">
                {seeding ? 'Seeding...' : 'Seed 18 Services'}
              </button>
            )}
          </div>
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{readyCount}/18 ready to sell</span>
              <span>{deliveringCount} delivered</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all"
                style={{ width: `${(readyCount / 18) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-8 text-sm">Loading...</p>
          ) : services.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">Click "Seed 18 Services" to start</p>
          ) : (
            PHASES.map(phase => (
              <div key={phase}>
                <div className="px-4 py-2 bg-gray-950 border-b border-gray-800">
                  <p className="text-xs text-yellow-500 font-semibold">PHASE {phase} — {PHASE_LABELS[phase]}</p>
                </div>
                {byPhase[phase].map(s => {
                  const sc = STATUS_CONFIG[s.status];
                  return (
                    <div
                      key={s._id}
                      onClick={() => { setSelected(s); setNotes(s.notes || ''); }}
                      className={`px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition ${selected?._id === s._id ? 'bg-gray-800' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-white">{s.name}</p>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${sc.dot}`} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                        <span className={`text-xs font-semibold ${TIER_COLORS[s.tier]}`}>{s.tier}</span>
                      </div>
                      {s.deliveryCount > 0 && (
                        <p className="text-xs text-purple-400 mt-0.5">Delivered {s.deliveryCount}x</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Detail panel */}
      <main className="flex-1 overflow-y-auto p-6">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select a service to track your progress
          </div>
        ) : (
          <div className="max-w-lg mx-auto space-y-5">
            {/* Header */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">{selected.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-semibold ${TIER_COLORS[selected.tier]}`}>{selected.tier?.toUpperCase()}</span>
                    <span className="text-gray-500 text-xs">Phase {selected.phase}</span>
                    {selected.deliveryCount > 0 && (
                      <span className="text-xs text-purple-400">· Delivered {selected.deliveryCount}x</span>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_CONFIG[selected.status]?.color}`}>
                  {STATUS_CONFIG[selected.status]?.label}
                </span>
              </div>
            </div>

            {/* Status update */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-300 font-medium text-sm mb-3">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => (
                  <button
                    key={key}
                    onClick={() => updateStatus(selected._id, key)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      selected.status === key
                        ? 'border-yellow-500 text-yellow-400'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => markDelivered(selected._id)}
                  className="text-xs px-3 py-1.5 rounded-full border border-purple-600 text-purple-400 hover:bg-purple-900/30 transition"
                >
                  + Log Delivery
                </button>
              </div>
            </div>

            {/* Checkpoints */}
            {selected.checkpoints?.length > 0 && (
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <p className="text-gray-300 font-medium text-sm mb-3">
                  Mastery Checkpoints ({selected.checkpoints.filter(c => c.completed).length}/{selected.checkpoints.length})
                </p>
                <div className="space-y-2">
                  {selected.checkpoints.map((cp, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleCheckpoint(selected._id, idx)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition ${
                        cp.completed ? 'bg-yellow-500 border-yellow-500' : 'border-gray-600 group-hover:border-yellow-500'
                      }`}>
                        {cp.completed && <span className="text-gray-900 text-xs font-bold">✓</span>}
                      </div>
                      <span className={`text-sm transition ${cp.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {cp.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-yellow-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${(selected.checkpoints.filter(c => c.completed).length / selected.checkpoints.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-300 font-medium text-sm mb-3">Notes</p>
              <textarea
                className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg p-3 border border-gray-700 focus:outline-none resize-none"
                rows={3}
                placeholder="What have you learned? What's blocking you?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
              <button
                onClick={() => saveNotes(selected._id)}
                disabled={saving}
                className="mt-2 text-xs bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-3 py-1.5 rounded-lg transition"
              >
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}