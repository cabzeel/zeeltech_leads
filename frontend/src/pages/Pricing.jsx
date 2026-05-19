const SERVICES = [
  { phase: 1, name: 'Website Design & Development', xaf: '250k–400k', usd: '$500–750', tier: 'mid', notes: '5-page · MERN · Vercel' },
  { phase: 1, name: 'Landing Page Design', xaf: '150k–200k', usd: '$300–450', tier: 'basic', notes: 'Pixel tracking · GTM · CRO' },
  { phase: 1, name: 'Website Redesign & Revamp', xaf: '200k–350k', usd: '$400–700', tier: 'mid', notes: 'SEO preserved · before/after' },
  { phase: 1, name: 'Website Maintenance & Support', xaf: '50k–80k/mo', usd: '$100–150/mo', tier: 'retainer', notes: 'Monthly retainer' },
  { phase: 1, name: 'Web Hosting & Deployment', xaf: '30k–60k', usd: '$60–120', tier: 'basic', notes: 'Add-on · one-time setup' },
  { phase: 2, name: 'Web App Development', xaf: '600k–1M', usd: '$1,200–2,000', tier: 'top', notes: 'Auth · booking · full MERN' },
  { phase: 2, name: 'API Integration', xaf: '100k–200k', usd: '$200–400', tier: 'mid', notes: 'Stripe · Flutterwave · add-on' },
  { phase: 2, name: 'E-commerce Development', xaf: '500k–900k', usd: '$1,000–1,800', tier: 'top', notes: 'Cart · checkout · admin' },
  { phase: 2, name: 'Custom Admin Dashboard', xaf: '400k–700k', usd: '$800–1,400', tier: 'top', notes: 'Charts · CRUD · role-based' },
  { phase: 3, name: 'Search Engine Optimization', xaf: '100k–200k/mo', usd: '$200–400/mo', tier: 'retainer', notes: 'Technical + local + schema' },
  { phase: 3, name: 'Speed & Performance Optimization', xaf: '80k–150k', usd: '$150–300', tier: 'mid', notes: 'Before/after Lighthouse' },
  { phase: 3, name: 'UI/UX Design & Prototyping', xaf: '150k–300k', usd: '$300–600', tier: 'mid', notes: 'Figma · prototype · handoff' },
  { phase: 3, name: 'Mobile Responsive Design Audit', xaf: '50k–80k', usd: '$100–150', tier: 'basic', notes: 'Quick-win · written report' },
  { phase: 4, name: 'Google Ads & Paid Media', xaf: '100k–200k/mo', usd: '$200–500/mo', tier: 'retainer', notes: 'Setup fee separate' },
  { phase: 4, name: 'Conversion Rate Optimization', xaf: '150k–250k', usd: '$300–500', tier: 'mid', notes: 'Heatmaps · A/B · audit' },
  { phase: 5, name: 'Domain Setup & DNS Management', xaf: '30k–50k', usd: '$60–100', tier: 'basic', notes: 'SPF/DKIM/DMARC + Cloudflare' },
  { phase: 5, name: 'CMS Setup & Configuration', xaf: '80k–150k', usd: '$150–300', tier: 'mid', notes: 'WordPress · Sanity · Strapi' },
  { phase: 5, name: 'WhatsApp & Chatbot Integration', xaf: '100k–200k', usd: '$200–400', tier: 'mid', notes: 'Tidio (budget) · Twilio (premium)' },
];

const ADDONS = [
  { name: 'WhatsApp chatbot (Tidio/Crisp)', xaf: '40k–60k', usd: '$80–120' },
  { name: 'WhatsApp API flow (Twilio)', xaf: '80k–120k', usd: '$150–250' },
  { name: 'Stripe payment integration', xaf: '75k–100k', usd: '$150–200' },
  { name: 'Flutterwave / local payment', xaf: '60k–80k', usd: '$120–160' },
  { name: 'Facebook Pixel + GTM setup', xaf: '30k–50k', usd: '$60–100' },
  { name: 'Google Analytics 4 setup', xaf: '25k–40k', usd: '$50–80' },
  { name: 'Basic on-page SEO setup', xaf: '50k–80k', usd: '$100–150' },
  { name: 'Contact form + email notifications', xaf: '20k–35k', usd: '$40–70' },
  { name: 'Booking / reservation system', xaf: '80k–150k', usd: '$150–300' },
  { name: 'Monthly maintenance retainer', xaf: '50k–100k/mo', usd: '$100–200/mo' },
  { name: 'Hosting setup + SSL', xaf: '30k–50k', usd: '$60–100' },
  { name: 'Domain + DNS + business email', xaf: '25k–40k', usd: '$50–80' },
  { name: 'Extra revision round', xaf: '15k/round', usd: '$30/round' },
  { name: 'Rush delivery (under 5 days)', xaf: '+30% surcharge', usd: '+30% surcharge' },
];

const RULES = [
  ['01', 'Never quote without knowing the scope', 'Ask via DM: pages? features? backend? CMS? payment?'],
  ['02', 'Always start with Mid for international', 'They have budget. Don\'t undersell. All comms via DM/WhatsApp.'],
  ['03', 'Basic is for Cameroon entry only', 'Use Basic to get foot in the door, then upsell to Mid/Top.'],
  ['04', '50% deposit before ANY work starts', 'No deposit = no work. Non-negotiable. Always.'],
  ['05', 'Charge extra for rush jobs', '+30% for anything under 5 days. Your time has value.'],
  ['06', 'Retainers are compounding revenue', 'Pitch maintenance on every delivery. Recurring XAF matters.'],
  ['07', 'Never discount more than 10%', 'Can\'t afford it? Offer Basic tier — not a discounted Mid.'],
  ['08', 'Upsell on every delivery', 'Website → SEO → Ads → CRO. Same client, deeper value.'],
  ['09', 'Scope creep = extra charge', 'New feature after agreement = new quote. Always.'],
  ['10', 'All discovery via messages — no calls', 'Ask qualifying questions via DM before quoting anything.'],
  ['11', 'XAF for Cameroon, USD for international', 'Never quote international clients in XAF.'],
];

const TIER_COLORS = { basic: 'text-green-400', mid: 'text-yellow-400', top: 'text-red-400', retainer: 'text-blue-400' };
const PHASE_LABELS = { 1: 'Core Foundation', 2: 'Backend & Integration', 3: 'SEO, Performance & Design', 4: 'Marketing & Analytics', 5: 'Infrastructure' };

export default function Pricing() {
  const phases = [1, 2, 3, 4, 5];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h2 className="text-white font-bold text-xl">Pricing Reference</h2>
          <p className="text-gray-400 text-sm mt-1">Internal only · Not for client distribution · All comms via DM/WhatsApp</p>
        </div>

        {/* Tier overview */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { tier: 'BASIC', color: 'border-green-500 text-green-400', xaf: '150k–250k XAF', usd: '$300–500', desc: 'Simple sites · No backend · Fastest close · Entry door for Cameroon' },
            { tier: 'MID', color: 'border-yellow-500 text-yellow-400', xaf: '300k–500k XAF', usd: '$600–1,000', desc: 'Full websites · CMS · Integrations · Your bread and butter' },
            { tier: 'TOP', color: 'border-red-500 text-red-400', xaf: '700k–1.2M XAF', usd: '$1,400–2,500', desc: 'Web apps · E-commerce · Dashboards · One deal = 3 Basics' },
          ].map(({ tier, color, xaf, usd, desc }) => (
            <div key={tier} className={`bg-gray-900 rounded-xl p-5 border-2 ${color.split(' ')[0]}`}>
              <p className={`font-bold text-lg ${color.split(' ')[1]}`}>{tier}</p>
              <p className={`text-sm font-semibold mt-1 ${color.split(' ')[1]}`}>{xaf}</p>
              <p className="text-green-400 text-sm">{usd}</p>
              <p className="text-gray-400 text-xs mt-2">{desc}</p>
            </div>
          ))}
        </div>

        {/* Services table */}
        <div>
          <h3 className="text-yellow-500 font-semibold mb-3">All 18 Services</h3>
          {phases.map(phase => (
            <div key={phase} className="mb-4">
              <div className="bg-gray-950 px-4 py-2 rounded-t-lg border border-gray-800">
                <p className="text-xs text-yellow-500 font-semibold">PHASE {phase} — {PHASE_LABELS[phase]}</p>
              </div>
              <div className="border border-t-0 border-gray-800 rounded-b-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">SERVICE</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">CAMEROON (XAF)</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">INTERNATIONAL (USD)</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">TIER</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">NOTES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SERVICES.filter(s => s.phase === phase).map((s, i) => (
                      <tr key={s.name} className={i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}>
                        <td className="px-4 py-2.5 text-sm text-white font-medium">{s.name}</td>
                        <td className="px-4 py-2.5 text-sm text-yellow-400">{s.xaf}</td>
                        <td className="px-4 py-2.5 text-sm text-green-400">{s.usd}</td>
                        <td className={`px-4 py-2.5 text-xs font-semibold ${TIER_COLORS[s.tier]}`}>{s.tier.toUpperCase()}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">{s.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div>
          <h3 className="text-yellow-500 font-semibold mb-3">Standard Add-ons</h3>
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">ADD-ON</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">CAMEROON (XAF)</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">INTERNATIONAL (USD)</th>
                </tr>
              </thead>
              <tbody>
                {ADDONS.map((a, i) => (
                  <tr key={a.name} className={i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}>
                    <td className="px-4 py-2.5 text-sm text-white">{a.name}</td>
                    <td className="px-4 py-2.5 text-sm text-yellow-400">{a.xaf}</td>
                    <td className="px-4 py-2.5 text-sm text-green-400">{a.usd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rules */}
        <div>
          <h3 className="text-yellow-500 font-semibold mb-3">Pricing Rules — Never Break These</h3>
          <div className="space-y-2">
            {RULES.map(([num, rule, detail]) => (
              <div key={num} className="bg-gray-900 rounded-lg px-4 py-3 border border-gray-800 flex gap-4">
                <span className="text-yellow-500 font-bold text-sm flex-shrink-0">{num}</span>
                <div>
                  <p className="text-white text-sm font-medium">{rule}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}