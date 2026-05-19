import { useState, useEffect } from 'react';
import axios from 'axios';

const EMPTY_FORM = {
  weekNumber: '', weekStart: '', weekEnd: '',
  prospectsFiltered: 0, dmsSent: 0, responses: 0, callsBooked: 0,
  dealsProposed: 0, dealsClosed: 0, revenueXAF: 0, revenueUSD: 0,
  currentService: '', skillAdvanced: '', builtThisWeek: '', shippedThisWeek: '',
  videoPosted: false, videoTopic: '',
  whatWorked: '', whatDidnt: '', focusNextWeek: '',
};

export default function WeeklyReview() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchReviews(); fetchStats(); }, []);

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await axios.get('/weekly-review');
      setReviews(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function fetchStats() {
    try {
      const res = await axios.get('/weekly-review/stats/cumulative');
      setStats(res.data.data);
    } catch (err) { console.error(err); }
  }

  async function saveReview() {
    setSaving(true);
    try {
      if (selected && showForm === 'edit') {
        await axios.patch(`/weekly-review/${selected._id}`, form);
      } else {
        await axios.post('/weekly-review', form);
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setSelected(null);
      fetchReviews();
      fetchStats();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  }

  async function deleteReview(id) {
    if (!confirm('Delete this review?')) return;
    await axios.delete(`/weekly-review/${id}`);
    fetchReviews(); fetchStats();
    setSelected(null);
  }

  function startNew() {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    setForm({
      ...EMPTY_FORM,
      weekNumber: reviews.length + 1,
      weekStart: weekStart.toISOString().slice(0, 10),
      weekEnd: weekEnd.toISOString().slice(0, 10),
    });
    setShowForm('new');
    setSelected(null);
  }

  function f(key, label, type = 'text', placeholder = '') {
    return { key, label, type, placeholder };
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Weekly Reviews</h2>
            <button onClick={startNew}
              className="text-xs bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-3 py-1.5 rounded-lg">
              + New Week
            </button>
          </div>
          {/* Cumulative stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-2">
              {[
                ['DMs Sent', stats.totalDmsSent, 'text-blue-400'],
                ['Responses', stats.totalResponses, 'text-green-400'],
                ['Deals', stats.totalDealsClosed, 'text-yellow-400'],
                ['Reply Rate', `${stats.responseRate}%`, 'text-purple-400'],
              ].map(([label, val, color]) => (
                <div key={label} className="bg-gray-800 rounded-lg p-2 text-center">
                  <p className={`text-sm font-bold ${color}`}>{val}</p>
                  <p className="text-gray-500 text-xs">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-8 text-sm">Loading...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">No reviews yet. Start your first week.</p>
          ) : (
            reviews.map(r => (
              <div
                key={r._id}
                onClick={() => { setSelected(r); setShowForm(false); }}
                className={`px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition ${selected?._id === r._id && !showForm ? 'bg-gray-800' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">Week {r.weekNumber}</p>
                  {r.videoPosted && <span className="text-xs text-pink-400">📹 Video</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(r.weekStart).toLocaleDateString()} — {new Date(r.weekEnd).toLocaleDateString()}
                </p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-blue-400">{r.dmsSent} DMs</span>
                  <span className="text-xs text-green-400">{r.responses} replies</span>
                  <span className="text-xs text-yellow-400">{r.dealsClosed} closed</span>
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
            <h3 className="text-white font-bold text-lg mb-5">
              {showForm === 'edit' ? `Edit Week ${form.weekNumber}` : `New Review — Week ${form.weekNumber}`}
            </h3>
            <div className="space-y-5">

              {/* Dates */}
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <p className="text-gray-300 font-medium text-sm mb-3">Week Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Week Start</label>
                    <input type="date" className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                      value={form.weekStart} onChange={e => setForm(f => ({ ...f, weekStart: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Week End</label>
                    <input type="date" className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                      value={form.weekEnd} onChange={e => setForm(f => ({ ...f, weekEnd: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Outreach metrics */}
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <p className="text-gray-300 font-medium text-sm mb-3">Outreach Metrics</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Prospects Filtered', 'prospectsFiltered'],
                    ['DMs Sent', 'dmsSent'],
                    ['Responses', 'responses'],
                    ['Deals Proposed', 'dealsProposed'],
                    ['Deals Closed', 'dealsClosed'],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <label className="text-xs text-gray-400 block mb-1">{label}</label>
                      <input type="number" min="0"
                        className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                        value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue */}
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <p className="text-gray-300 font-medium text-sm mb-3">Revenue</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Revenue (XAF)</label>
                    <input type="number" min="0"
                      className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                      value={form.revenueXAF}
                      onChange={e => setForm(f => ({ ...f, revenueXAF: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Revenue (USD)</label>
                    <input type="number" min="0"
                      className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                      value={form.revenueUSD}
                      onChange={e => setForm(f => ({ ...f, revenueUSD: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>
              </div>

              {/* Learning + Build */}
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <p className="text-gray-300 font-medium text-sm mb-3">Learning & Building</p>
                <div className="space-y-3">
                  {[
                    ['Current Service', 'currentService', 'e.g. Website Design & Development'],
                    ['Skill Advanced', 'skillAdvanced', 'What specifically did you learn?'],
                    ['Built This Week', 'builtThisWeek', 'What did you build?'],
                    ['Shipped This Week', 'shippedThisWeek', 'What was delivered or published?'],
                  ].map(([label, key, placeholder]) => (
                    <div key={key}>
                      <label className="text-xs text-gray-400 block mb-1">{label}</label>
                      <input className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                        placeholder={placeholder} value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <p className="text-gray-300 font-medium text-sm mb-3">Content</p>
                <div className="flex items-center gap-3 mb-3">
                  <input type="checkbox" id="videoPosted" checked={form.videoPosted}
                    onChange={e => setForm(f => ({ ...f, videoPosted: e.target.checked }))}
                    className="w-4 h-4 accent-yellow-500" />
                  <label htmlFor="videoPosted" className="text-sm text-gray-300">Video posted this week</label>
                </div>
                {form.videoPosted && (
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Video Topic</label>
                    <input className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                      placeholder="What was the video about?"
                      value={form.videoTopic}
                      onChange={e => setForm(f => ({ ...f, videoTopic: e.target.value }))} />
                  </div>
                )}
              </div>

              {/* Reflection */}
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <p className="text-gray-300 font-medium text-sm mb-3">Weekly Reflection</p>
                <div className="space-y-3">
                  {[
                    ['What worked this week?', 'whatWorked'],
                    ['What didn\'t work?', 'whatDidnt'],
                    ['Focus for next week', 'focusNextWeek'],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <label className="text-xs text-gray-400 block mb-1">{label}</label>
                      <textarea className="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none resize-none"
                        rows={2} value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={saveReview} disabled={saving}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-gray-900 font-semibold text-sm py-2.5 rounded-lg transition">
                  {saving ? 'Saving...' : 'Save Review'}
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
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Week {selected.weekNumber}</h3>
              <div className="flex gap-2">
                <button onClick={() => { setForm({ ...selected, weekStart: selected.weekStart?.slice(0,10), weekEnd: selected.weekEnd?.slice(0,10) }); setShowForm('edit'); }}
                  className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg">Edit</button>
                <button onClick={() => deleteReview(selected._id)}
                  className="text-xs bg-red-800 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg">Delete</button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-400 text-sm mb-4">{new Date(selected.weekStart).toLocaleDateString()} — {new Date(selected.weekEnd).toLocaleDateString()}</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Prospects', selected.prospectsFiltered, 'text-blue-400'],
                  ['DMs Sent', selected.dmsSent, 'text-blue-400'],
                  ['Responses', selected.responses, 'text-green-400'],
                  ['Proposed', selected.dealsProposed, 'text-yellow-400'],
                  ['Closed', selected.dealsClosed, 'text-yellow-400'],
                  ['XAF Earned', selected.revenueXAF?.toLocaleString(), 'text-yellow-400'],
                  ['USD Earned', `$${selected.revenueUSD}`, 'text-green-400'],
                  ['Video', selected.videoPosted ? '✓ Yes' : '✗ No', selected.videoPosted ? 'text-pink-400' : 'text-gray-500'],
                ].map(([label, val, color]) => (
                  <div key={label} className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className={`text-sm font-bold ${color}`}>{val}</p>
                    <p className="text-gray-500 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {(selected.builtThisWeek || selected.shippedThisWeek || selected.currentService) && (
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-2">
                <p className="text-gray-300 font-medium text-sm">Learning & Building</p>
                {selected.currentService && <p className="text-sm text-gray-300">🎯 Service: <span className="text-yellow-400">{selected.currentService}</span></p>}
                {selected.skillAdvanced && <p className="text-sm text-gray-400">📚 Learned: {selected.skillAdvanced}</p>}
                {selected.builtThisWeek && <p className="text-sm text-gray-400">🔨 Built: {selected.builtThisWeek}</p>}
                {selected.shippedThisWeek && <p className="text-sm text-gray-400">🚀 Shipped: {selected.shippedThisWeek}</p>}
              </div>
            )}

            {(selected.whatWorked || selected.whatDidnt || selected.focusNextWeek) && (
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-3">
                <p className="text-gray-300 font-medium text-sm">Reflection</p>
                {selected.whatWorked && <div><p className="text-xs text-green-400 font-semibold mb-1">WHAT WORKED</p><p className="text-sm text-gray-300">{selected.whatWorked}</p></div>}
                {selected.whatDidnt && <div><p className="text-xs text-red-400 font-semibold mb-1">WHAT DIDN'T</p><p className="text-sm text-gray-300">{selected.whatDidnt}</p></div>}
                {selected.focusNextWeek && <div><p className="text-xs text-yellow-400 font-semibold mb-1">FOCUS NEXT WEEK</p><p className="text-sm text-gray-300">{selected.focusNextWeek}</p></div>}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select a week or start a new review
          </div>
        )}
      </main>
    </div>
  );
}