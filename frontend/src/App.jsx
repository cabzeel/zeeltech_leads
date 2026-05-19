import { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import FollowUps from './pages/FollowUps';
import Projects from './pages/Projects';
import Services from './pages/Services';
import WeeklyReview from './pages/WeeklyReview';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';

// ── STATUS CONFIG ──
const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-yellow-100 text-yellow-700',
  outreach_sent: 'bg-purple-100 text-purple-700',
  replied: 'bg-green-100 text-green-700',
  converted: 'bg-emerald-100 text-emerald-700',
};
const STATUS_OPTIONS = ['new', 'reviewed', 'outreach_sent', 'replied', 'converted'];

// ── LEADS TAB (existing functionality + social search) ──
function Leads() {
  const [leads, setLeads] = useState([]);
  const [scraping, setScraping] = useState(false);
  const [filters, setFilters] = useState({ market: '', category: '', status: '' });
  const [selectedLead, setSelectedLead] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [generatingId, setGeneratingId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState('');
  const [contactFields, setContactFields] = useState({ instagram: '', facebook: '', whatsapp: '', email: '' });
  const [socialUrls, setSocialUrls] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isSuperAdmin } = useAuth();

  useEffect(() => { fetchLeads(); }, [filters]);

  async function fetchLeads() {
    setLoading(true);
    try {
      const params = {};
      if (filters.market) params.market = filters.market;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      const res = await axios.get('/leads', { params });
      setLeads(res.data.data || []);
    } catch (err) { console.error('Failed to fetch leads:', err); }
    finally { setLoading(false); }
  }

  async function triggerScrape() {
    if (!confirm('Start a manual scrape? This may take several minutes.')) return;
    setScraping(true);
    try {
      await axios.get('/scrape');
      alert('Scrape started! New leads will appear once it completes.');
    } catch (err) { alert('Failed to trigger scrape.'); }
    finally { setScraping(false); }
  }

  async function updateStatus(id, status) {
    await axios.patch(`/leads/${id}/status`, { status });
    fetchLeads();
    if (selectedLead?._id === id) setSelectedLead(prev => ({ ...prev, status }));
  }

  async function saveContactFields(id) {
    await axios.patch(`/leads/${id}/contacts`, contactFields);
    fetchLeads();
  }

  async function saveNotes(id) {
    await axios.patch(`/leads/${id}/notes`, { notes });
    fetchLeads();
  }

  async function generateMessage(lead) {
    setGeneratingId(lead._id);
    setGeneratedMessage('');
    try {
      const res = await axios.post(`/leads/${lead._id}/message`);
      setGeneratedMessage(res.data.message);
    } catch (err) { console.error('Failed to generate message:', err); }
    finally { setGeneratingId(null); }
  }

  async function fetchSocialUrls(lead) {
    try {
      const res = await axios.get(`/leads/${lead._id}/social-search`);
      setSocialUrls(res.data.data);
    } catch (err) { console.error(err); }
  }

  async function deleteLead(id) {
    if (!confirm('Delete this lead?')) return;
    await axios.delete(`/leads/${id}`);
    setSelectedLead(null);
    fetchLeads();
  }

  function copyMessage() {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openLead(lead) {
    setSelectedLead(lead);
    setGeneratedMessage(lead.generatedMessage || '');
    setNotes(lead.notes || '');
    setSocialUrls(null);
    setContactFields({
      instagram: lead.instagram || '',
      facebook: lead.facebook || '',
      whatsapp: lead.whatsapp || '',
      email: lead.email || '',
    });
  }

  return (
    <div className="flex h-full">
      <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 space-y-2">
          {isSuperAdmin && (
            <button onClick={triggerScrape} disabled={scraping}
              className="w-full text-xs bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 text-white font-semibold py-2 rounded-lg transition">
              {scraping ? 'Scraping...' : '⚡ Manual Scrape'}
            </button>
          )}
          <select className="w-full bg-gray-800 text-gray-200 text-sm rounded px-3 py-2 border border-gray-700 focus:outline-none"
            value={filters.market} onChange={e => setFilters(f => ({ ...f, market: e.target.value }))}>
            <option value="">All Markets</option>
            <option value="Toronto">Toronto</option>
            <option value="Buea">Buea</option>
            <option value="Douala">Douala</option>
            <option value="Yaounde">Yaoundé</option>
          </select>
          <select className="w-full bg-gray-800 text-gray-200 text-sm rounded px-3 py-2 border border-gray-700 focus:outline-none"
            value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
            <option value="">All Categories</option>
            <option value="restaurants">Restaurants</option>
            <option value="hotels">Hotels</option>
            <option value="guest houses">Guest Houses</option>
          </select>
          <select className="w-full bg-gray-800 text-gray-200 text-sm rounded px-3 py-2 border border-gray-700 focus:outline-none"
            value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-8 text-sm">Loading leads...</p>
          ) : leads.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">No leads found</p>
          ) : leads.map(lead => (
            <div key={lead._id} onClick={() => openLead(lead)}
              className={`px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition ${selectedLead?._id === lead._id ? 'bg-gray-800' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white truncate">{lead.businessName}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[lead.status]}`}>
                  {lead.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{lead.category} · {lead.market}</p>
              <p className="text-xs text-gray-500 mt-0.5">⭐ {lead.rating} {lead.website ? '· Has website' : '· No website'}</p>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-800">
          <p className="text-center text-gray-500 text-xs">{leads.length} leads</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {!selectedLead ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">Select a lead to view details</div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Business Info */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedLead.businessName}</h2>
                  <p className="text-sm text-gray-400">{selectedLead.category} · {selectedLead.market}</p>
                </div>
                <button onClick={() => deleteLead(selectedLead._id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-500 text-xs">Rating</p><p className="text-white">⭐ {selectedLead.rating}</p></div>
                <div><p className="text-gray-500 text-xs">Source</p><p className="text-white">{selectedLead.source}</p></div>
                <div>
                  <p className="text-gray-500 text-xs">Website</p>
                  {selectedLead.website
                    ? <a href={selectedLead.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate block">{selectedLead.website}</a>
                    : <p className="text-red-400">No website</p>}
                </div>
                <div><p className="text-gray-500 text-xs">Phone</p><p className="text-white">{selectedLead.phone || '—'}</p></div>
                <div><p className="text-gray-500 text-xs">Location</p><p className="text-white">{selectedLead.location || '—'}</p></div>
                <div><p className="text-gray-500 text-xs">Temperature</p><p className="text-white capitalize">{selectedLead.leadTemperature}</p></div>
              </div>
            </div>

            {/* Social Search — one click find on Instagram/Facebook */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-300">Find on Social Media</p>
                <button onClick={() => fetchSocialUrls(selectedLead)}
                  className="text-xs bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition">
                  Get Search Links
                </button>
              </div>
              {socialUrls && (
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: '📸 Instagram', url: socialUrls.instagram, color: 'bg-pink-800 hover:bg-pink-700' },
                    { label: '📘 Facebook', url: socialUrls.facebook, color: 'bg-blue-800 hover:bg-blue-700' },
                    { label: '🔍 Google', url: socialUrls.google, color: 'bg-gray-700 hover:bg-gray-600' },
                  ].map(({ label, url, color }) => (
                    <a key={label} href={url} target="_blank" rel="noreferrer"
                      className={`text-xs ${color} text-white px-3 py-1.5 rounded-lg transition`}>
                      {label}
                    </a>
                  ))}
                </div>
              )}
              {!socialUrls && <p className="text-xs text-gray-500">Click "Get Search Links" to find this business on social media in one click.</p>}
            </div>

            {/* Status */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-sm font-medium text-gray-300 mb-3">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => updateStatus(selectedLead._id, s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${selectedLead.status === s ? 'border-white text-white bg-gray-700' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Generator */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-300">Outreach Message</p>
                <button onClick={() => generateMessage(selectedLead)} disabled={generatingId === selectedLead._id}
                  className="text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition">
                  {generatingId === selectedLead._id ? 'Generating...' : 'Generate Message'}
                </button>
              </div>
              {generatedMessage ? (
                <div className="space-y-3">
                  <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{generatedMessage}</div>
                  <button onClick={copyMessage} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition">
                    {copied ? 'Copied!' : 'Copy Message'}
                  </button>
                </div>
              ) : <p className="text-sm text-gray-500">No message generated yet.</p>}
            </div>

            {/* Contact Channels */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-sm font-medium text-gray-300 mb-3">Contact Channels</p>
              <div className="space-y-3">
                {[
                  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                  { key: 'whatsapp', label: 'WhatsApp', placeholder: '+237...' },
                  { key: 'email', label: 'Email', placeholder: 'contact@business.com' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <div className="flex gap-2">
                      <input className="flex-1 bg-gray-800 text-gray-200 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none"
                        placeholder={placeholder} value={contactFields[key] || ''}
                        onChange={e => setContactFields(prev => ({ ...prev, [key]: e.target.value }))} />
                      {selectedLead[key] && (
                        <a href={selectedLead[key]} target="_blank" rel="noreferrer"
                          className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg">Open</a>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={() => saveContactFields(selectedLead._id)}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition">
                  Save Channels
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-sm font-medium text-gray-300 mb-3">Notes</p>
              <textarea className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg p-3 border border-gray-700 focus:outline-none resize-none"
                rows={4} placeholder="Add notes about this lead..." value={notes}
                onChange={e => setNotes(e.target.value)} />
              <button onClick={() => saveNotes(selectedLead._id)}
                className="mt-2 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition">
                Save Notes
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── NAV TABS CONFIG ──
function getNavTabs(isSuperAdmin) {
  const tabs = [
    { id: 'leads', label: 'Leads', icon: '👥', adminOnly: false },
    { id: 'followups', label: 'Follow-ups', icon: '📬', adminOnly: false },
    { id: 'projects', label: 'Projects', icon: '🗂', adminOnly: true },
    { id: 'services', label: 'Services', icon: '🧠', adminOnly: true },
    { id: 'review', label: 'Weekly Review', icon: '📊', adminOnly: true },
    { id: 'pricing', label: 'Pricing', icon: '💰', adminOnly: true },
    { id: 'settings', label: 'Settings', icon: '⚙️', adminOnly: true },
  ];
  return tabs.filter(t => !t.adminOnly || isSuperAdmin);
}

// ── MAIN SHELL ──
function Shell() {
  const { user, loading, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('leads');
  const tabs = getNavTabs(isSuperAdmin);

  if (loading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>;
  }

  if (!user) return <Login />;

  const renderTab = () => {
    switch (activeTab) {
      case 'leads': return <Leads />;
      case 'followups': return <FollowUps />;
      case 'projects': return isSuperAdmin ? <Projects /> : null;
      case 'services': return isSuperAdmin ? <Services /> : null;
      case 'review': return isSuperAdmin ? <WeeklyReview /> : null;
      case 'pricing': return isSuperAdmin ? <Pricing /> : null;
      case 'settings': return isSuperAdmin ? <Settings /> : null;
      default: return <Leads />;
    }
  };

  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-yellow-500">ZeelTech</h1>
            <p className="text-xs text-gray-500">Agency Command Center</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{user.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isSuperAdmin ? 'bg-yellow-900 text-yellow-400' : 'bg-blue-900 text-blue-400'}`}>
            {isSuperAdmin ? 'Super Admin' : 'Employee'}
          </span>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="bg-gray-900 border-b border-gray-800 px-4 flex gap-1 flex-shrink-0 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition ${
              activeTab === tab.id
                ? 'border-yellow-500 text-yellow-400 font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}>
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex">
        {renderTab()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}