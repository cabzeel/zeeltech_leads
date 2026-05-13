import { useState, useEffect } from "react";
import axios from "axios";

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-700",
  reviewed: "bg-yellow-100 text-yellow-700",
  outreach_sent: "bg-purple-100 text-purple-700",
  replied: "bg-green-100 text-green-700",
  converted: "bg-emerald-100 text-emerald-700",
};

const STATUS_OPTIONS = ["new", "reviewed", "outreach_sent", "replied", "converted"];

export default function App() {
  const [leads, setLeads] = useState([]);
  const [filters, setFilters] = useState({ market: "", category: "", status: "" });
  const [selectedLead, setSelectedLead] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [generatingId, setGeneratingId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  async function fetchLeads() {
    setLoading(true);
    try {
      const params = {};
      if (filters.market) params.market = filters.market;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      const res = await axios.get("/leads", { params });
      setLeads(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    await axios.patch(`/leads/${id}/status`, { status });
    fetchLeads();
    if (selectedLead?._id === id) {
      setSelectedLead(prev => ({ ...prev, status }));
    }
  }

  async function saveNotes(id) {
    await axios.patch(`/leads/${id}/notes`, { notes });
    fetchLeads();
  }

  async function generateMessage(lead) {
    setGeneratingId(lead._id);
    setGeneratedMessage("");
    try {
      const res = await axios.post(`/leads/${lead._id}/message`);
      setGeneratedMessage(res.data.message);
    } catch (err) {
      console.error("Failed to generate message:", err);
    } finally {
      setGeneratingId(null);
    }
  }

  async function deleteLead(id) {
    if (!confirm("Delete this lead?")) return;
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
    setGeneratedMessage(lead.generatedMessage || "");
    setNotes(lead.notes || "");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">ZeelLeads</h1>
          <p className="text-xs text-gray-400">Hospitality Lead Management</p>
        </div>
        <span className="text-sm text-gray-400">{leads.length} leads</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Lead List */}
        <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b border-gray-800 space-y-2">
            <select
              className="w-full bg-gray-800 text-gray-200 text-sm rounded px-3 py-2 border border-gray-700 focus:outline-none"
              value={filters.market}
              onChange={e => setFilters(f => ({ ...f, market: e.target.value }))}
            >
              <option value="">All Markets</option>
              <option value="Toronto">Toronto</option>
              <option value="Buea">Buea</option>
              <option value="Douala">Douala</option>
              <option value="Yaounde">Yaoundé</option>
            </select>
            <select
              className="w-full bg-gray-800 text-gray-200 text-sm rounded px-3 py-2 border border-gray-700 focus:outline-none"
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              <option value="restaurants">Restaurants</option>
              <option value="hotels">Hotels</option>
              <option value="guest houses">Guest Houses</option>
            </select>
            <select
              className="w-full bg-gray-800 text-gray-200 text-sm rounded px-3 py-2 border border-gray-700 focus:outline-none"
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          {/* Lead List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-center text-gray-500 py-8 text-sm">Loading leads...</p>
            ) : leads.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">No leads found</p>
            ) : (
              leads.map(lead => (
                <div
                  key={lead._id}
                  onClick={() => openLead(lead)}
                  className={`px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition ${selectedLead?._id === lead._id ? "bg-gray-800" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-white truncate">{lead.businessName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[lead.status]}`}>
                      {lead.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{lead.category} · {lead.market}</p>
                  <p className="text-xs text-gray-500 mt-0.5">⭐ {lead.rating} {lead.website ? "· Has website" : "· No website"}</p>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selectedLead ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Select a lead to view details
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Business Info */}
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedLead.businessName}</h2>
                    <p className="text-sm text-gray-400">{selectedLead.category} · {selectedLead.market}</p>
                  </div>
                  <button
                    onClick={() => deleteLead(selectedLead._id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Rating</p>
                    <p className="text-white">⭐ {selectedLead.rating}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Source</p>
                    <p className="text-white">{selectedLead.source}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Website</p>
                    {selectedLead.website ? (
                      <a href={selectedLead.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate block">
                        {selectedLead.website}
                      </a>
                    ) : (
                      <p className="text-red-400">No website</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="text-white">{selectedLead.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Location</p>
                    <p className="text-white">{selectedLead.location || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Temperature</p>
                    <p className="text-white capitalize">{selectedLead.leadTemperature}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <p className="text-sm font-medium text-gray-300 mb-3">Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedLead._id, s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        selectedLead.status === s
                          ? "border-white text-white bg-gray-700"
                          : "border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Generator */}
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-300">Outreach Message</p>
                  <button
                    onClick={() => generateMessage(selectedLead)}
                    disabled={generatingId === selectedLead._id}
                    className="text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    {generatingId === selectedLead._id ? "Generating..." : "Generate Message"}
                  </button>
                </div>

                {generatedMessage ? (
                  <div className="space-y-3">
                    <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {generatedMessage}
                    </div>
                    <button
                      onClick={copyMessage}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      {copied ? "Copied!" : "Copy Message"}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No message generated yet.</p>
                )}
              </div>

              {/* Notes */}
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <p className="text-sm font-medium text-gray-300 mb-3">Notes</p>
                <textarea
                  className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg p-3 border border-gray-700 focus:outline-none resize-none"
                  rows={4}
                  placeholder="Add notes about this lead..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                <button
                  onClick={() => saveNotes(selectedLead._id)}
                  className="mt-2 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition"
                >
                  Save Notes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}