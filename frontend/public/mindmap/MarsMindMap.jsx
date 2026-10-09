import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Upload, Link2, Pencil, Check, Info, Clock, Trophy, Telescope, CheckCircle2,
  Lightbulb, HelpCircle, Satellite, Activity, X, Quote, Users,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Data: InSight Lander                                               */
/* ------------------------------------------------------------------ */
const DATA = {
  title: "InSight Lander",
  subtitle: "Interior Exploration using Seismic Investigations, Geodesy and Heat Transport",
  images: {
    center: "./mars3.jpg",
    what: "./mars1.jpg",
    timeline: "./mars4.jpg",
    legacy: "./mars2.jpg",
    contribute: "./mars-interior.svg",
  },
  what: [
    ["Name", "InSight Lander (Interior Exploration using Seismic Investigations, Geodesy and Heat Transport)"],
    ["Type", "Robotic stationary Mars lander"],
    ["Uses", "Studied Mars's internal structure by detecting marsquakes, investigating heat flow, monitoring weather, and measuring planetary rotation."],
    ["Location", "Elysium Planitia, Mars (Latitude: 4.502° N, Longitude: 135.623° E)"],
    ["Mission Declared Complete", "December 21, 2022"],
    ["Earth Launch", "May 5, 2018 — 11:05:01 UTC"],
    ["Mars Touchdown", "November 26, 2018 — approx. 19:52:59 UTC"],
    ["Final Communication", "December 15, 2022"],
  ],
  team: [
    ["Lead Organization", "NASA JPL"],
    ["Team Members", "Bruce Banerdt (PI), Sue Smrekar (Deputy PI), Tom Hoffman (Project Manager), Philippe Lognonné (SEIS Lead), Tilman Spohn (HP³ Lead)"],
    ["Partners", "Lockheed Martin Space, CNES, DLR"],
    ["Pilot", "None (Autonomous Landing)"],
  ],
  timeline: [
    ["May 5, 2018", "Launch from Earth", "Launched aboard an Atlas V rocket from Vandenberg Air Force Base, California."],
    ["Nov 26, 2018", "Successful Mars Landing", "Touched down in Elysium Planitia at 19:52:59 UTC after 6 minutes of atmospheric entry, descent, and landing."],
    ["Nov 26, 2018", "First Surface Image", "Transmitted first photograph from Mars confirming successful surface operations."],
    ["Dec 1, 2018", "Martian Wind Measurements", "Sensors recorded vibrations caused by Martian winds, providing early environmental observations."],
    ["Dec 19, 2018", "Seismometer Deployment", "Robotic arm placed the SEIS seismometer directly onto the Martian surface."],
    ["Feb 2019", "Main Science Investigation", "Began primary seismic investigation phase after instrument deployment."],
    ["Apr 6, 2019", "First Detected Marsquake", "Detected first confirmed seismic event originating from Mars."],
    ["Dec 15, 2022", "Last Communication", "Transmitted final signal as dust-covered solar panels could no longer provide sufficient energy."],
    ["Dec 21, 2022", "Mission Retirement Announced", "NASA officially declared the mission complete."],
  ],
  legacy: {
    quote: "The Machine That Listened to the Heart of Mars.",
    summary: "InSight revolutionized Mars exploration by investigating what lies beneath the surface. Its primary scientific legacy is the comprehensive seismic record it established.",
    impact: "Its findings help planetary scientists understand geological hazards and seismic activity vital for future crewed and robotic Mars missions.",
  },
  contribute: {
    status: "Yes, through archived scientific data.",
    ongoing: "Although InSight has ceased operations, its recorded seismic catalogue continues to be analyzed using advanced computational models.",
    areas: [
      "Investigating Mars's core and mantle composition",
      "Calibrating ongoing meteorite impacts",
      "Refining planetary formation models",
    ],
  },
  status: {
    known: {
      fact: "InSight successfully landed on November 26, 2018, deployed a seismometer, detected marsquakes, and ceased communicating in December 2022.",
      evidence: "Landing telemetry, instrument records, seismic data, and NASA mission announcements.",
    },
    inferred: {
      fact: "InSight's electronics and scientific instruments may have deteriorated further after the mission ended.",
      evidence: "Documented dust accumulation, reduced power generation, and long-term exposure to Martian temperature cycles (interpretations from environmental exposure, not absolute proof of individual component destruction).",
    },
    unknown: {
      fact: "The exact physical condition of InSight's internal electronics, instruments, and solar panels as of October 2026 is not established by available close-up observations.",
      evidence: "New high-resolution orbital imagery or direct on-site physical inspection by future Mars surface missions.",
    },
  },
};

const STATUS_META = [
  { key: "known", label: "Known", icon: CheckCircle2, text: "text-emerald-300", border: "border-emerald-400/40", evLabel: "Evidence" },
  { key: "inferred", label: "Inferred", icon: Lightbulb, text: "text-amber-300", border: "border-amber-400/40", evLabel: "Evidence" },
  { key: "unknown", label: "Unknown", icon: HelpCircle, text: "text-rose-300", border: "border-rose-400/40", evLabel: "What is needed" },
];

const glass = "backdrop-blur-md bg-slate-900/80 border border-orange-500/30 rounded-2xl shadow-[0_0_24px_rgba(249,115,22,0.14)]";

/* ------------------------------------------------------------------ */
/* Image slot: upload (object URL), hover overlay, editable URL        */
/* ------------------------------------------------------------------ */
function ImageSlot({ src, onChange, alt, className = "", round = false }) {
  const inputRef = useRef(null);
  const blobRef = useRef(null);
  const [editingUrl, setEditingUrl] = useState(false);
  const [draft, setDraft] = useState("");
  const [broken, setBroken] = useState(false);

  useEffect(() => setBroken(false), [src]);
  useEffect(() => () => blobRef.current && URL.revokeObjectURL(blobRef.current), []);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    blobRef.current = URL.createObjectURL(file);
    onChange(blobRef.current);
    e.target.value = "";
  };
  const applyUrl = () => {
    if (draft.trim()) onChange(draft.trim());
    setEditingUrl(false);
  };

  return (
    <div className={`group relative overflow-hidden bg-slate-950 ${round ? "rounded-full" : "rounded-xl"} ${className}`}>
      {broken ? (
        <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">Image unavailable</div>
      ) : (
        <img src={src} alt={alt} onError={() => setBroken(true)} className="h-full w-full object-cover" draggable={false} />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-950/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
        {editingUrl ? (
          <div className="flex w-[85%] items-center gap-1">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applyUrl(); if (e.key === "Escape") setEditingUrl(false); }}
              placeholder="https://…"
              className="min-w-0 flex-1 rounded bg-slate-800 px-2 py-1 text-xs text-white outline-none ring-1 ring-orange-500/50"
            />
            <button onClick={applyUrl} aria-label="Apply URL" className="rounded bg-orange-500 p-1 text-slate-900"><Check size={14} /></button>
            <button onClick={() => setEditingUrl(false)} aria-label="Cancel" className="rounded bg-slate-700 p-1 text-white"><X size={14} /></button>
          </div>
        ) : (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-orange-400"
            >
              <Upload size={13} /> {round ? "Replace" : "Upload / Replace Image"}
            </button>
            {!round && (
              <button
                onClick={() => { setDraft(src.startsWith("blob:") ? "" : src); setEditingUrl(true); }}
                className="flex items-center gap-1 text-[11px] text-orange-200 hover:text-white"
              >
                <Link2 size={12} /> Use image URL
              </button>
            )}
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cards                                                              */
/* ------------------------------------------------------------------ */
function Card({ icon: Icon, title, image, onImage, children }) {
  return (
    <section className={`${glass} flex flex-col gap-3 p-4`}>
      <header className="flex items-center gap-2 text-orange-300">
        <Icon size={18} />
        <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
      </header>
      <ImageSlot src={image} onChange={onImage} alt={title} className="h-40 w-full shrink-0" />
      {children}
    </section>
  );
}

function Timeline({ items }) {
  const [active, setActive] = useState(0);
  return (
    <ol className="relative ml-2 border-l border-orange-500/40">
      {items.map(([date, head, text], i) => (
        <li key={i} className="relative pb-3 pl-5 last:pb-0">
          <button
            onClick={() => setActive(i)}
            aria-label={`${date} ${head}`}
            className={`absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-2 transition ${
              i === active ? "border-orange-300 bg-orange-300 shadow-[0_0_10px_#fb923c]" : "border-orange-500/60 bg-slate-900 hover:bg-orange-500/40"
            }`}
          />
          <button onClick={() => setActive(i)} className="block text-left">
            <div className={`text-xs font-bold ${i === active ? "text-orange-300" : "text-slate-400"}`}>
              {date} <span className={i === active ? "text-white" : "text-slate-300"}>— {head}</span>
            </div>
            {i === active && <p className="mt-0.5 text-xs leading-snug text-slate-200">{text}</p>}
          </button>
        </li>
      ))}
    </ol>
  );
}

function StatusCard({ meta, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const Icon = meta.icon;
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const area = "w-full resize-y rounded-lg bg-slate-950/80 p-2 text-xs leading-relaxed text-slate-100 outline-none ring-1 ring-orange-500/50";
  return (
    <div className={`${glass} flex flex-col gap-2 p-4 ${meta.border}`}>
      <div className="flex items-center justify-between">
        <h3 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${meta.text}`}>
          <Icon size={16} /> {meta.label}
        </h3>
        <button
          onClick={() => setEditing((e) => !e)}
          className="flex items-center gap-1 rounded-full border border-orange-500/40 px-2 py-0.5 text-[11px] text-orange-200 hover:bg-orange-500/20"
        >
          {editing ? <><Check size={12} /> Done</> : <><Pencil size={12} /> Edit</>}
        </button>
      </div>
      {editing ? (
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-orange-300">Fact
            <textarea autoFocus rows={4} value={value.fact} onChange={set("fact")} className={area} />
          </label>
          <label className="block text-[11px] font-semibold text-orange-300">{meta.evLabel}
            <textarea rows={4} value={value.evidence} onChange={set("evidence")} className={area} />
          </label>
        </div>
      ) : (
        <div className="space-y-2 text-xs leading-relaxed">
          <p className="text-slate-200"><span className="font-semibold text-orange-300">Fact: </span>{value.fact}</p>
          <p className="text-slate-400"><span className="font-semibold text-orange-300">{meta.evLabel}: </span>{value.evidence}</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */
export default function MarsMindMap() {
  const [images, setImages] = useState(DATA.images);
  const [status, setStatus] = useState(DATA.status);
  const setImage = (slot) => (url) => setImages((i) => ({ ...i, [slot]: url }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <style>{`
        @keyframes mm-spin { to { transform: rotate(360deg); } }
        @keyframes mm-flow { to { stroke-dashoffset: -24; } }
        @keyframes mm-pulse { 0%,100% { opacity:.55 } 50% { opacity:1 } }
      `}</style>
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20px 30px,#fff,transparent),radial-gradient(1px 1px at 120px 90px,#fdba74,transparent),radial-gradient(1.5px 1.5px at 220px 160px,#fff,transparent),radial-gradient(1px 1px at 300px 40px,#fff,transparent)",
          backgroundSize: "340px 200px",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-6">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-orange-300">Mars · Elysium Planitia</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{DATA.title}</h1>
          <p className="mx-auto mt-1 max-w-xl text-xs text-slate-400">{DATA.subtitle}</p>
        </header>

        <div className="relative">
          <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <defs>
              <filter id="mm-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.6" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {[[34, 30], [66, 30], [34, 70], [66, 70]].map(([x, y], i) => (
              <g key={i} filter="url(#mm-glow)">
                <path d={`M50 50 L${x} ${y}`} stroke="#f97316" strokeOpacity=".35" strokeWidth="3" vectorEffect="non-scaling-stroke" fill="none" />
                <path d={`M50 50 L${x} ${y}`} stroke="#fdba74" strokeWidth="1.5" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" fill="none" style={{ animation: "mm-flow 1.2s linear infinite" }} />
                <circle cx={x} cy={y} r="0.8" fill="#fdba74" style={{ animation: "mm-pulse 2s ease-in-out infinite" }} />
              </g>
            ))}
          </svg>

          <div className="relative grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-x-[26%] lg:gap-y-24">
            <Card icon={Info} title="What is this" image={images.what} onImage={setImage("what")}>
              <dl className="space-y-1.5 text-xs">
                {DATA.what.map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="w-24 shrink-0 font-semibold text-orange-300">{k}</dt>
                    <dd className="text-slate-200">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="rounded-lg border border-orange-500/20 bg-slate-950/50 p-2.5">
                <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-orange-300"><Users size={13} /> Mission Team</h3>
                <dl className="space-y-1.5 text-xs">
                  {DATA.team.map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="w-24 shrink-0 font-semibold text-orange-200/80">{k}</dt>
                      <dd className="text-slate-300">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Card>

            <Card icon={Clock} title="Mission Timeline" image={images.timeline} onImage={setImage("timeline")}>
              <Timeline items={DATA.timeline} />
            </Card>

            <Card icon={Trophy} title="Discover the Legacy" image={images.legacy} onImage={setImage("legacy")}>
              <blockquote className="flex gap-2 rounded-lg border-l-2 border-orange-400 bg-orange-500/10 p-2.5 text-sm font-semibold italic text-orange-100">
                <Quote size={16} className="mt-0.5 shrink-0 text-orange-400" />
                {DATA.legacy.quote}
              </blockquote>
              <p className="text-xs leading-relaxed text-slate-300">{DATA.legacy.summary}</p>
              <div className="text-xs leading-relaxed">
                <span className="font-bold uppercase tracking-widest text-orange-300">Key impact </span>
                <span className="text-slate-300">{DATA.legacy.impact}</span>
              </div>
            </Card>

            <Card icon={Telescope} title="Can it still contribute?" image={images.contribute} onImage={setImage("contribute")}>
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <CheckCircle2 size={13} /> {DATA.contribute.status}
              </div>
              <p className="text-xs leading-relaxed text-slate-300">{DATA.contribute.ongoing}</p>
              <ol className="space-y-2">
                {DATA.contribute.areas.map((a, i) => (
                  <li key={a} className="flex items-center gap-3 text-xs">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-orange-400/60 font-bold text-orange-300">{i + 1}</span>
                    <span className="font-semibold text-white">{a}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <div className="mt-6 flex justify-center lg:pointer-events-none lg:absolute lg:left-1/2 lg:top-1/2 lg:mt-0 lg:-translate-x-1/2 lg:-translate-y-1/2">
            <div className="pointer-events-auto relative h-52 w-52 sm:h-60 sm:w-60">
              <div className="absolute -inset-3 rounded-full border border-dashed border-orange-400/60" style={{ animation: "mm-spin 18s linear infinite" }}>
                <Satellite size={18} className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-950 p-0.5 text-orange-300" />
              </div>
              <div className="absolute -inset-1 rounded-full border border-orange-300/70 shadow-[0_0_30px_rgba(249,115,22,0.6)]" style={{ animation: "mm-pulse 3s ease-in-out infinite" }} />
              <ImageSlot round src={images.center} onChange={setImage("center")} alt={DATA.title} className="h-full w-full border-2 border-orange-300/80" />
              <div className="absolute -bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-orange-500/40 bg-slate-900/90 px-3 py-1 text-xs font-bold text-orange-200">
                <Activity size={13} className="text-orange-400" /> {DATA.title}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STATUS_META.map((m) => (
            <StatusCard key={m.key} meta={m} value={status[m.key]} onChange={(v) => setStatus((s) => ({ ...s, [m.key]: v }))} />
          ))}
        </div>
      </div>
    </div>
  );
}

const rootEl = typeof document !== "undefined" && document.getElementById("root");
if (rootEl) createRoot(rootEl).render(<MarsMindMap />);
