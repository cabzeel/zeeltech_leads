import { useState, useEffect } from 'react';
import axios from 'axios';

const STAGE_COLORS = {
  dm1_sent: 'bg-blue-900 text-blue-300',
  dm2_pending: 'bg-yellow-900 text-yellow-300',
  dm2_sent: 'bg-purple-900 text-purple-300',
  dm3_pending: 'bg-orange-900 text-orange-300',
  dm3_sent: 'bg-red-900 text-red-300',
  responded: 'bg-green-900 text-green-300',
  cold: 'bg-gray-800 text-gray-400',
};

export default function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchFollowUps(); }, [filter]);

  async function fetchFollowUps() {
    setLoading(true);
    try {
      const params = filter ? { stage: filter } : {};
      const res = await axios.get('/followups', { params });
      setFollowUps(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markDm2(id) {
    await axios.patch(`/followups/${id}/dm2`);
    fetchFollowUps();
  }

  async function markDm3(id) {
    await axios.patch(`/followups/${id}/dm3`);
    fetchFollowUps();
  }

  async function markResponded(id) {
    await axios.patch(`/followups/${id}/responded`);
    fetchFollowUps();
    setSelected(null);
  }

  async function markCold(id) {
    if (!confirm('Move to cold list? You can re-approach in 6–8 weeks.')) return;
    await axios.patch(`/followups/${id}/cold`);
    fetchFollowUps();
    setSelected(null);
  }

  const due = followUps.filter(f => f.isDue);
  const active = followUps.filter(f => !f.isDue && f.currentStage !== 'cold' && f.currentStage !== 'responded');
  const cold = followUps.filter(f => f.currentStage === 'cold');
  const responded = followUps.filter(f => f.currentStage === 'responded');

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-white font-semibold mb-3">Follow-ups</h2>
          <select
            className="w-full bg-gray-800 text-gray-200 text-sm rounded px-3 py-2 border border-gray-700 focus:outline-none"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="">All Stages</option>
            <option value="dm1_sent">DM 1 Sent</option>
            <option value="dm2_pending">DM 2 Pending</option>
            <option value="dm2_sent">DM 2 Sent</option>
            <option value="dm3_pending">DM 3 Pending</option>
            <option value="dm3_sent">DM 3 Sent</option>
            <option value="responded">Responded</option>
            <option value="cold">Cold</option>
          </select>
        </div>

        {/* Due alerts */}
        {due.length > 0 && (
          <div className="px-4 py-2 bg-yellow-900/20 border-b border-yellow-800">
            <p className="text-yellow-400 text-xs font-semibold">⚡ {due.length} overdue action{due.length > 1 ? 's' : ''}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-8 text-sm">Loading...</p>
          ) : followUps.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">No follow-ups yet</p>
          ) : (
            [...due, ...active, ...responded, ...cold].map(f => (
              <div
                key={f._id}
                onClick={() => setSelected(f)}
                className={`px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition ${selected?._id === f._id ? 'bg-gray-800' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white truncate">{f.leadName || 'Unknown'}</p>
                  {f.isDue && <span className="text-xs text-yellow-400 font-bold whitespace-nowrap">⚡ {f.dueLabel}</span>}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STAGE_COLORS[f.currentStage]}`}>
                    {f.currentStage.replace(/_/g, ' ')}
                  </span>
                  {f.platform && <span className="text-xs text-gray-500">{f.platform}</span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  DM 1: {f.dm1SentAt ? new Date(f.dm1SentAt).toLocaleDateString() : '—'}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Stats strip */}
        <div className="p-3 border-t border-gray-800 grid grid-cols-4 gap-1 text-center">
          {[['Active', active.length, 'text-blue-400'], ['Due', due.length, 'text-yellow-400'], ['Replied', responded.length, 'text-green-400'], ['Cold', cold.length, 'text-gray-500']].map(([label, count, color]) => (
            <div key={label}>
              <p className={`text-sm font-bold ${color}`}>{count}</p>
              <p className="text-xs text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Detail panel */}
      <main className="flex-1 overflow-y-auto p-6">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select a follow-up to manage it
          </div>
        ) : (
          <div className="max-w-lg mx-auto space-y-5">
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <h3 className="text-white font-bold text-lg">{selected.leadName}</h3>
              <p className="text-gray-400 text-sm">{selected.platform} · {selected.handle || 'No handle saved'}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${STAGE_COLORS[selected.currentStage]}`}>
                {selected.currentStage.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Timeline */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-300 font-medium text-sm mb-4">DM Sequence Timeline</p>
              <div className="space-y-3">
                {[
                  { label: 'DM 1 — Pitch', date: selected.dm1SentAt, desc: 'Initial outreach sent' },
                  { label: 'DM 2 — Check-in (Day 4)', date: selected.dm2SentAt, desc: 'Soft follow-up' },
                  { label: 'DM 3 — Closer (Day 11)', date: selected.dm3SentAt, desc: 'Final touch, close the loop' },
                ].map(({ label, date, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${date ? 'bg-yellow-500' : 'bg-gray-700'}`} />
                    <div>
                      <p className="text-sm text-white">{label}</p>
                      <p className="text-xs text-gray-500">{date ? new Date(date).toLocaleDateString() : desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-300 font-medium text-sm mb-3">Actions</p>
              <div className="flex flex-wrap gap-2">
                {!selected.dm2SentAt && selected.currentStage === 'dm1_sent' && (
                  <button onClick={() => markDm2(selected._id)} className="text-xs bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg">
                    Mark DM 2 Sent
                  </button>
                )}
                {selected.dm2SentAt && !selected.dm3SentAt && (
                  <button onClick={() => markDm3(selected._id)} className="text-xs bg-orange-700 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg">
                    Mark DM 3 Sent
                  </button>
                )}
                {selected.currentStage !== 'responded' && selected.currentStage !== 'cold' && (
                  <button onClick={() => markResponded(selected._id)} className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg">
                    They Responded ✓
                  </button>
                )}
                {selected.currentStage !== 'cold' && selected.currentStage !== 'responded' && (
                  <button onClick={() => markCold(selected._id)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg">
                    Move to Cold
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}