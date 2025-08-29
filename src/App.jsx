import React, { useEffect, useMemo, useState } from "react";

/** ============ THEME (unchanged) ============ */
const theme = {
  header: {
    bg: "bg-[#0070D2]",
    tab: "bg-[#0A6BC4] text-white",
    tabInactive: "bg-[#E6F0FB] text-[#0A4F8F] hover:bg-[#D7E8FB]",
  },
  buttons: {
    primary: "bg-[#4F46E5] hover:bg-[#4338CA] text-white",
    subtle: "border border-sky-200 bg-white text-sky-800 hover:bg-sky-50",
    ghost: "border border-gray-300 bg-white hover:bg-gray-50",
  },
  chip: {
    danger: "bg-[#FEE2E2] text-[#B91C1C]",
    success: "bg-[#D1FAE5] text-[#065F46]",
    warn: "bg-[#FEF3C7] text-[#92400E]",
    info: "bg-[#DBEAFE] text-[#1E40AF]",
  },
};

/** ============ MOCK DATA ============ */
const MOCK_CUSTOMER = {
  name: "Jordan Example",
  property: "Sample Property",
  balance: "£1,000.00",
};

const MOCK_WORKS = [
  { date: "2025-08-10", type: "Repair job", desc: "Pilot light issue", next: "2025-09-02" },
  { date: "2025-08-11", type: "Repair job", desc: "Pilot light issue", next: "2025-09-03" },
  { date: "2025-08-12", type: "Repair job", desc: "Pilot light issue", next: "2025-09-04" },
];

const MOCK_INVOICES = [
  { date: "2024-11-20", type: "Invoice", no: "#A101", desc: "Annual service", total: "£875.00" },
  { date: "2024-11-21", type: "Invoice", no: "#A102", desc: "Annual service", total: "£995.00" },
  { date: "2024-11-22", type: "Invoice", no: "#A103", desc: "Annual service", total: "£1,115.00" },
];

const SAMPLE_RESULTS = [
  { id: "p1", name: "EXAMPLE — Hex Head Screw 16mm", sku: "SKU-001", price: 3.08, relevance: "High", supplier: "SampleCo" },
  { id: "p2", name: "EXAMPLE — Slotted Hex 16mm", sku: "SKU-002", price: 10.28, relevance: "Medium", supplier: "SampleCo" },
  { id: "p3", name: "GENERIC — M16 x 1.5 Hex Bolt (Zinc)", sku: "GEN-016", price: 1.75, relevance: "Low", supplier: "Generic" },
];

/** ============ SMALL UTILS ============ */
const Avatar = ({ seed, size = 32, className = "" }) => {
  // Primary: DiceBear initials (no auth or local files).
  const src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;
  // Fallback: simple gray circle
  const fallback =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><rect width='100%' height='100%' rx='${size/2}' fill='#E5E7EB'/></svg>`
    );
  return (
    <img
      src={src}
      alt={seed}
      width={size}
      height={size}
      className={`rounded-full border ${className}`}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={(e) => {
        if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
      }}
    />
  );
};

/** ============ SHARED UI ============ */
function Card({ title, actions, children, className = "" }) {
  return (
    <div className={`rounded-md border border-gray-200 bg-white shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="border-b px-3 py-2 flex items-center justify-between bg-gray-50">
          <div className="text-sm font-medium text-gray-700">{title}</div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-3">{children}</div>
    </div>
  );
}

/** ============ HEADER / NAV ============ */
function TopBar() {
  return (
    <header className={`w-full ${theme.header.bg} shadow`}>
      <div className="mx-auto max-w-[1200px] px-4 py-2 flex items-center gap-4">
        <input
          placeholder="Search"
          className="rounded-md bg-white/95 px-3 py-1.5 text-sm shadow-inner w-40"
        />
        <nav className="flex items-center gap-2 text-sm">
          {["Customers", "Diary", "Suppliers", "Reporting"].map((t, i) => (
            <span
              key={t}
              className={`rounded-md px-3 py-1 ${
                i === 1 ? theme.header.tab : theme.header.tabInactive
              }`}
            >
              {t}
            </span>
          ))}
        </nav>
        <div className="ml-auto" />
      </div>
    </header>
  );
}

function CustomerHeader() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-3 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-600 text-white">
          Active
        </span>
        <span className="rounded px-2 py-0.5 text-xs font-medium bg-rose-600 text-white">
          {MOCK_CUSTOMER.balance}
        </span>
      </div>
      <div className="ml-3 text-sm text-gray-700">
        Customer: <span className="font-semibold">{MOCK_CUSTOMER.name}</span> / {MOCK_CUSTOMER.property}
      </div>
      <div className="ml-auto">🔔</div>
    </div>
  );
}

/** ============ LEFT COLUMN ============ */
function LeftColumn() {
  // generic center (not a real address)
  const lat = 51.505; // mock
  const lon = -0.09;  // mock
  const delta = 0.02;
  const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`;

  return (
    <div className="space-y-3">
      {/* Map (generic area) */}
      <Card>
        <div className="relative">
          <div className="h-32 md:h-40 overflow-hidden rounded-md border border-gray-200">
            <iframe
              title="Location map"
              className="h-full w-full"
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`}
            />
          </div>
          <span className="absolute bottom-1 right-2 text-[10px] text-gray-500 bg-white/80 px-1 rounded">
            © OpenStreetMap (mock location)
          </span>
        </div>
      </Card>

      {/* Customers viewing this (mock avatars) */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm text-gray-700 font-medium">Customers viewing this</span>
        <Avatar seed="AA" />
        <Avatar seed="BB" />
      </div>

      <Card title="Service reminders">
        <ul className="text-sm text-gray-700 space-y-1">
          <li className="flex items-center justify-between">
            <span>Domestic Gas Safety Certificate</span>
            <span className={`rounded px-2 py-0.5 text-xs ${theme.chip.warn}`}>Important</span>
          </li>
          <li>Annual Appliance Service</li>
        </ul>
      </Card>

      <Card title="Contracts">
        <div className="text-sm text-gray-700 flex items-center gap-2">
          Gold Service Plan (Expires:{" "}
          <span className={`rounded px-1.5 py-0.5 text-xs ${theme.chip.success}`}>128 days</span>
          )
        </div>
      </Card>

      <Card title="Other details">
        <dl className="text-xs text-gray-600 grid grid-cols-2 gap-x-3 gap-y-1">
          <dt>Customer type</dt>
          <dd className="text-gray-800">Private customer</dd>
          <dt>SLA</dt>
          <dd className="text-gray-800">24h response</dd>
          <dt>After-sales</dt>
          <dd className="text-gray-800">On</dd>
        </dl>
      </Card>
    </div>
  );
}

/** ============ NOTES ============ */
function NotesCard({ title, content, chipText, chipColor }) {
  return (
    <Card title={title}>
      <div className="flex items-center justify-between text-sm">
        <span>{content}</span>
        <span className={`px-2 py-0.5 text-xs rounded ${chipColor}`}>{chipText}</span>
      </div>
    </Card>
  );
}

/** ============ TABS ============ */
function TabsRow({ active, onSelect }) {
  const tabs = ["All works", "Communications", "Contacts", "Branches", "Work address", "Assets", "Files"];
  return (
    <div className="mb-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => onSelect(t)}
            className={`rounded-md px-3 py-1 border ${
              t === active
                ? "bg-white text-sky-900 border-sky-300"
                : "bg-sky-50 text-sky-800 hover:bg-sky-100 border-sky-100"
            }`}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto">
          <button className={`rounded-md px-3 py-1 text-sm ${theme.buttons.ghost}`}>Quick links ▾</button>
        </div>
      </div>
    </div>
  );
}

/** ============ PARTS FINDER (drawer list) ============ */
function ResultRow({ item, onCopySKU, onAddToJob }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b last:border-0">
      <div className="min-w-0 flex-1">
        <div className="text-xs text-gray-500">{item.supplier}</div>
        <div className="truncate font-medium">{item.name}</div>
        <div className="text-xs text-gray-600">
          <span className="font-mono">{item.sku}</span> • £{item.price.toFixed(2)} • Relevance: {item.relevance}
        </div>
      </div>
      <div className="shrink-0 flex flex-col gap-1">
        <button onClick={() => navigator.clipboard.writeText(item.name)} className={`rounded px-2 py-1 text-xs ${theme.buttons.ghost}`}>Copy</button>
        <button onClick={() => onCopySKU(item.sku)} className={`rounded px-2 py-1 text-xs ${theme.buttons.ghost}`}>Copy SKU</button>
        <button onClick={() => onAddToJob(item)} className={`rounded px-2 py-1 text-xs ${theme.buttons.primary}`}>Add</button>
      </div>
    </div>
  );
}

function PartsFinderControls({ query, setQuery, engine, setEngine, topK, setTopK, model, setModel, type, setType }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <label className="text-sm">Query:</label>
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="16mm hexagon slotted head…" className="flex-1 rounded-md border px-3 py-2 text-sm"/>
        <label className="text-sm">Top-K</label>
        <input type="number" min={1} max={50} value={topK} onChange={(e)=>setTopK(Number(e.target.value))} className="w-16 rounded-md border px-2 py-1 text-sm"/>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <fieldset className="flex items-center gap-3">
          <legend className="mr-2 text-gray-600">Engine:</legend>
          {["Lexical","Hybrid","Weaviate","Verba"].map((e)=>(
            <label key={e} className="flex items-center gap-1">
              <input type="radio" name="engine" checked={engine===e} onChange={()=>setEngine(e)}/> {e}
            </label>
          ))}
        </fieldset>
        <div className="flex items-center gap-2">
          <span>Model</span>
          <select value={model} onChange={(e)=>setModel(e.target.value)} className="rounded-md border px-2 py-1">
            <option>All</option><option>Boiler</option><option>Pump</option><option>Generic</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span>Part type</span>
          <select value={type} onChange={(e)=>setType(e.target.value)} className="rounded-md border px-2 py-1">
            <option>All</option><option>Bolt</option><option>Screw</option><option>Valve</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function PartsFinderPanel({ compact }) {
  const [query, setQuery] = useState("16mm hex…");
  const [engine, setEngine] = useState("Weaviate");
  const [model, setModel] = useState("All");
  const [type, setType] = useState("All");
  const [topK, setTopK] = useState(9);
  const results = useMemo(()=> SAMPLE_RESULTS.slice(0, Math.min(topK, SAMPLE_RESULTS.length)), [topK]);
  function addToJob(item){ alert(`Attached to job: ${item.name} (SKU ${item.sku})`); }

  return (
    <div className={compact? "space-y-3" : "space-y-4"}>
      <div className="text-base font-semibold">Find a part</div>
      <PartsFinderControls {...{query,setQuery,engine,setEngine,topK,setTopK,model,setModel,type,setType}}/>
      <div className="mt-1 -mx-2 px-2 max-h-[60vh] overflow-y-auto border rounded">
        {results.map((r)=>(
          <ResultRow key={r.id} item={r} onCopySKU={(sku)=>navigator.clipboard.writeText(sku)} onAddToJob={addToJob}/>
        ))}
      </div>
      <div className="pt-1">
        <a href="#" className="text-sm text-sky-700 hover:underline">Open Verba ↗</a>
      </div>
    </div>
  );
}

/** ============ VERBA CHAT ============ */
function VerbaChat({ context }) {
  const [messages, setMessages] = useState([
    { role: 'system', text: `Context: ${context.module} | Customer: ${context.customer}` },
    { role: 'ai', text: 'Hi! Ask me about part compatibility, alternatives, or pricing.' },
  ]);
  const [input, setInput] = useState('');
  function send(){ if(!input.trim()) return; setMessages([...messages, { role: 'user', text: input }]); setInput(''); }
  return (
    <div className="flex flex-col h-full gap-3">
      <div className="text-base font-semibold">Verba companion</div>
      <div className="flex gap-2 text-xs">
        <span className="rounded px-2 py-0.5 bg-sky-50 text-sky-800">scope: {context.module}</span>
        <span className="rounded px-2 py-0.5 bg-emerald-50 text-emerald-800">customer: {context.customer}</span>
      </div>
      <div className="flex-1 overflow-auto rounded border p-3 bg-white">
        {messages.map((m,i)=> (
          <div key={i} className={`mb-2 ${m.role==='user'?'text-right':''}`}>
            <span className={`inline-block rounded px-2 py-1 ${m.role==='user'?'bg-[#E6F0FB] text-[#0A4F8F]':'bg-gray-100 text-gray-800'}`}>{m.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask Verba…" className="flex-1 rounded border px-3 py-2 text-sm"/>
        <button onClick={send} className={`rounded-md px-3 py-2 text-sm ${theme.buttons.primary}`}>Send</button>
      </div>
    </div>
  );
}

/** ============ RIGHT DRAWER ============ */
function RightDrawer({ open, onClose, tab, setTab, context }) {
  return (
    <div className={`fixed inset-0 z-40 ${open? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/20 transition-opacity ${open? "opacity-100" : "opacity-0"}`} onClick={onClose}/>
      <aside
        className={`absolute right-0 top-0 h-full w-full md:w-[34%] bg-white border-l shadow-xl p-4 transition-transform ${
          open? "translate-x-0" : "translate-x-full"
        }`} role="dialog" aria-modal="true"
      >
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="font-semibold">TOOLS</div>
          <button onClick={onClose} className={`rounded-md px-2 py-1 text-sm ${theme.buttons.ghost}`}>Close</button>
        </div>

        <div className="pt-3 h-[calc(100%-52px)] overflow-y-auto">
          <div className="mb-3 flex gap-2 sticky top-0 bg-white pb-2">
            <button onClick={()=>setTab('search')} className={`rounded px-2 py-1 text-sm border ${tab==='search'?'bg-sky-50 border-sky-200 text-sky-900':'bg-white'}`}>Find a part</button>
            <button onClick={()=>setTab('verba')} className={`rounded px-2 py-1 text-sm border ${tab==='verba'?'bg-sky-50 border-sky-200 text-sky-900':'bg-white'}`}>Verba chat</button>
          </div>
          {tab==='search' ? <PartsFinderPanel compact/> : <VerbaChat context={context}/>}
        </div>
      </aside>
    </div>
  );
}

/** ============ RIGHT-COLUMN TABLES ============ */
function OngoingHistoryTables({ onOpenDrawer }) {
  return (
    <div className="space-y-3">
      <Card
        title="On going works"
        actions={
          <>
            <button className={`rounded-md px-3 py-1 text-sm ${theme.buttons.primary}`}>Add new estimate</button>
            <button className={`rounded-md px-3 py-1 text-sm ${theme.buttons.primary}`}>Add new job</button>
            <button onClick={()=>onOpenDrawer('search')} className={`rounded-md px-3 py-1 text-sm ${theme.buttons.subtle}`}>Find part</button>
            <button onClick={()=>onOpenDrawer('verba')} className="rounded-md px-2 py-1 text-sm border bg-white shadow-sm" title="Open Spotlight / Verba">⌘K</button>
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-sky-50 text-sky-900">
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Next visit booked</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_WORKS.map((w, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2">{w.date}</td>
                  <td className="px-3 py-2">{w.type}</td>
                  <td className="px-3 py-2">{w.desc}</td>
                  <td className="px-3 py-2">{w.next}</td>
                  <td className="px-3 py-2"><button className="text-sky-700 hover:underline">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="History">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Record no</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Total</th>
                <th className="px-3 py-2 text-left">Balance</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_INVOICES.map((inv, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2">{inv.date}</td>
                  <td className="px-3 py-2">{inv.type}</td>
                  <td className="px-3 py-2">{inv.no}</td>
                  <td className="px-3 py-2">{inv.desc}</td>
                  <td className="px-3 py-2">{inv.total}</td>
                  <td className="px-3 py-2">£0.00</td>
                  <td className="px-3 py-2"><button className="text-sky-700 hover:underline">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/** ============ APP ============ */
export default function CommusoftFSMMock() {
  const [activeTab, setActiveTab] = useState("All works");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("search");

  useEffect(() => {
    function onKey(e) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setDrawerTab("verba");
        setDrawerOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const context = { module: "parts", customer: MOCK_CUSTOMER.name };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <TopBar />
      <CustomerHeader />

      <div className="mx-auto max-w-[1200px] px-4 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="md:col-span-1"><LeftColumn /></div>
        <div className="md:col-span-2 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NotesCard title="Notes" content="Urgent boiler leak follow-up required (mock)" chipText="Important" chipColor="bg-red-100 text-red-700" />
            <NotesCard title="Notes" content="Annual service scheduled for September (mock)" chipText="Reminder" chipColor="bg-yellow-100 text-yellow-800" />
          </div>
          <TabsRow active={activeTab} onSelect={setActiveTab} />
          <OngoingHistoryTables onOpenDrawer={(which)=>{ setDrawerTab(which); setDrawerOpen(true); }} />
        </div>
      </div>

      <RightDrawer open={drawerOpen} onClose={()=>setDrawerOpen(false)} tab={drawerTab} setTab={setDrawerTab} context={context} />
    </div>
  );
}

