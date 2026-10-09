import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Upload, Link2, Pencil, Check, Rocket, Camera, Info, Clock, Trophy, Telescope,
  CheckCircle2, Lightbulb, HelpCircle, Satellite, Disc3, X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Data                                                               */
/* ------------------------------------------------------------------ */
const IMG = (n) => `./img${n}.jpg`;

const DATASETS = {
  antares: {
    tabLabel: "Apollo 14 Lunar Module (Antares)",
    icon: Rocket,
    title: "Lunar Module Antares",
    images: { center: IMG(1), what: IMG(3), timeline: IMG(4), legacy: IMG(7), contribute: IMG(2) },
    what: [
      ["Official Name", "Lunar Module (LM) Antares"],
      ["Mission", "Apollo 14"],
      ["Destination", "Moon"],
      ["Landing Date", "February 5, 1971"],
      ["Region", "Fra Mauro highlands"],
      ["Crew", "Alan B. Shepard Jr. (Commander), Edgar D. Mitchell (LM Pilot), Stuart A. Roosa (CM Pilot)"],
      ["Coordinates", "Approx. 3.646° S, 17.472° W"],
      ["Source", "NASA Planetary Data System"],
    ],
    timeline: [
      ["Jan 31, 1971", "Launch from Earth aboard Saturn V."],
      ["Feb 4, 1971", "Arrival in lunar orbit (Kitty Hawk CM & Antares LM)."],
      ["Feb 5, 1971", "Landing at Fra Mauro; Shepard and Mitchell explore surface and collect samples."],
      ["Feb 6, 1971", "Departure from Moon (ascent stage liftoff after ~33 hrs 30 mins)."],
      ["Feb 7, 1971", "Ascent stage deliberately directed to impact Moon (3.42° S, 19.67° W)."],
      ["Feb 9, 1971", "Return to Earth; splashdown in the Pacific Ocean."],
    ],
    legacy: [
      ["3", "astronauts participated in Apollo 14."],
      ["2", "astronauts walked on the Moon; 2 lunar surface excursions conducted."],
      ["~93 lb", "(42 kg) of lunar samples returned."],
      ["Sep 30, 1977", "ALSEP operations formally ended."],
    ],
    contribute: [
      ["Measuring the Earth–Moon distance", "Laser pulses & retroreflector."],
      ["Understanding lunar motion and gravity", "Orbit, rotation & gravitational physics."],
      ["Reusing archived scientific data", "Recovering and re-analyzing ALSEP records."],
    ],
    status: {
      known: "Verified by NASA records. Antares landed at Fra Mauro on Feb 5, 1971. Two stages (descent/ascent). Surface activities and experiments deployed.",
      inferred: "Landing legs supported module on surface. Ascent stage enabled return without full descent stage. Geological samples help reconstruct Moon history.",
      unknown: "Exact temperature of every component throughout mission; precise moment-to-moment component states; hypothetical system failure outcomes.",
    },
  },
  hasselblad: {
    tabLabel: "Apollo 11 Hasselblad Data Camera",
    icon: Camera,
    title: "Hasselblad Data Camera",
    images: { center: IMG(5), what: IMG(8), timeline: IMG(6), legacy: IMG(7), contribute: IMG(8) },
    what: [
      ["Official Name", "Hasselblad Data Camera (Apollo 11 lunar surface camera)"],
      ["Mission", "Apollo 11"],
      ["Launch", "July 16, 1969"],
      ["Landing", "July 20, 1969"],
      ["Destination", "Moon (Tranquility Base, Sea of Tranquility)"],
      ["Crew", "Neil A. Armstrong, Edwin E. “Buzz” Aldrin Jr., Michael Collins"],
      ["Camera Type", "Modified 70 mm film camera with Zeiss Biogon 60 mm, f/5.6 lens"],
      ["Fate", "Body/lens left on Moon; film magazines returned to Earth."],
    ],
    timeline: [
      ["Jul 16, 1969", "Launch from Earth aboard Saturn V."],
      ["Jul 19, 1969", "Arrival in lunar orbit (Columbia CM & Eagle LM)."],
      ["Jul 20, 1969", "Landing at Tranquility Base; surface exploration & photography."],
      ["Jul 21, 1969", "Ascent stage liftoff after ~21 hrs 36 mins."],
      ["Jul 21, 1969", "Camera body/lens left at Tranquility Base to reduce return weight."],
      ["Jul 24, 1969", "Splashdown in Pacific Ocean; exposed film returned to Earth."],
    ],
    legacy: [
      ["3", "astronauts participated; 2 walked on the Moon."],
      ["1", "lunar surface excursion lasting ~2 hours 31 minutes."],
      ["~47.5 lb", "(21.55 kg) of lunar samples returned."],
      ["2", "film magazines provided for the surface camera."],
      ["July 1969", "Hardware remains at Tranquility Base; photographs preserved."],
    ],
    contribute: [
      ["Studying lunar geology", "Detailed visual records of rocks, soil, and craters."],
      ["Making measurements from photographs", "Calibrated glass Réseau plate grid for photogrammetry."],
      ["Preserving and reanalyzing historical data", "Continuous scientific reference and mission reconstruction."],
    ],
    status: {
      known: "Modified Hasselblad 70mm camera with Zeiss Biogon 60mm lens. Body left on lunar surface; film magazines returned to Earth.",
      inferred: "Camera abandoned specifically to maximize payload margin for returning samples.",
      unknown: "Current physical condition of the camera body on the Moon after decades of solar radiation and micrometeoroid impacts.",
    },
  },
};

const STATUS_META = [
  { key: "known", label: "Known", icon: CheckCircle2, tone: "text-emerald-300 border-emerald-400/40" },
  { key: "inferred", label: "Inferred", icon: Lightbulb, tone: "text-amber-300 border-amber-400/40" },
  { key: "unknown", label: "Unknown", icon: HelpCircle, tone: "text-fuchsia-300 border-fuchsia-400/40" },
];

const glass = "backdrop-blur-md bg-slate-900/80 border border-cyan-500/30 rounded-2xl shadow-[0_0_24px_rgba(34,211,238,0.12)]";

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
              className="min-w-0 flex-1 rounded bg-slate-800 px-2 py-1 text-xs text-white outline-none ring-1 ring-cyan-500/50"
            />
            <button onClick={applyUrl} aria-label="Apply URL" className="rounded bg-cyan-500 p-1 text-slate-900"><Check size={14} /></button>
            <button onClick={() => setEditingUrl(false)} aria-label="Cancel" className="rounded bg-slate-700 p-1 text-white"><X size={14} /></button>
          </div>
        ) : (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-cyan-400"
            >
              <Upload size={13} /> {round ? "Replace" : "Upload image"}
            </button>
            {!round && (
              <button
                onClick={() => { setDraft(src.startsWith("blob:") ? "" : src); setEditingUrl(true); }}
                className="flex items-center gap-1 text-[11px] text-cyan-200 hover:text-white"
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
function Card({ icon: Icon, title, image, onImage, children, className = "" }) {
  return (
    <section className={`${glass} flex flex-col gap-3 p-4 ${className}`}>
      <header className="flex items-center gap-2 text-cyan-300">
        <Icon size={18} />
        <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
      </header>
      <ImageSlot src={image} onChange={onImage} alt={title} className="h-36 w-full shrink-0" />
      {children}
    </section>
  );
}

function Timeline({ items }) {
  const [active, setActive] = useState(0);
  return (
    <ol className="relative ml-2 border-l border-cyan-500/40">
      {items.map(([date, text], i) => (
        <li key={i} className="relative pb-3 pl-5 last:pb-0">
          <button
            onClick={() => setActive(i)}
            aria-label={date}
            className={`absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-2 transition ${
              i === active ? "border-cyan-300 bg-cyan-300 shadow-[0_0_10px_#22d3ee]" : "border-cyan-500/60 bg-slate-900 hover:bg-cyan-500/40"
            }`}
          />
          <button onClick={() => setActive(i)} className="block text-left">
            <div className={`text-xs font-bold ${i === active ? "text-cyan-300" : "text-slate-400"}`}>{date}</div>
            <p className={`text-xs leading-snug transition ${i === active ? "text-white" : "text-slate-400"}`}>{text}</p>
          </button>
        </li>
      ))}
    </ol>
  );
}

function StatusCard({ meta, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const Icon = meta.icon;
  return (
    <div className={`${glass} flex flex-col gap-2 p-4 ${meta.tone.split(" ")[1]}`}>
      <div className="flex items-center justify-between">
        <h3 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${meta.tone.split(" ")[0]}`}>
          <Icon size={16} /> {meta.label}
        </h3>
        <button
          onClick={() => setEditing((e) => !e)}
          className="flex items-center gap-1 rounded-full border border-cyan-500/40 px-2 py-0.5 text-[11px] text-cyan-200 hover:bg-cyan-500/20"
        >
          {editing ? <><Check size={12} /> Done</> : <><Pencil size={12} /> Edit</>}
        </button>
      </div>
      {editing ? (
        <textarea
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          className="w-full resize-y rounded-lg bg-slate-950/80 p-2 text-xs leading-relaxed text-slate-100 outline-none ring-1 ring-cyan-500/50"
        />
      ) : (
        <p className="text-xs leading-relaxed text-slate-300">{value || <em className="text-slate-500">No notes yet.</em>}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */
export default function ApolloMindMap() {
  const [mode, setMode] = useState("antares");
  // Per-dataset editable state so switching tabs never loses user edits/uploads.
  const [overrides, setOverrides] = useState({});
  const data = DATASETS[mode];
  const images = { ...data.images, ...(overrides[mode]?.images || {}) };
  const status = { ...data.status, ...(overrides[mode]?.status || {}) };

  const setImage = (slot) => (url) =>
    setOverrides((o) => ({ ...o, [mode]: { ...o[mode], images: { ...o[mode]?.images, [slot]: url } } }));
  const setStatus = (key) => (text) =>
    setOverrides((o) => ({ ...o, [mode]: { ...o[mode], status: { ...o[mode]?.status, [key]: text } } }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <style>{`
        @keyframes mm-spin { to { transform: rotate(360deg); } }
        @keyframes mm-flow { to { stroke-dashoffset: -24; } }
        @keyframes mm-pulse { 0%,100% { opacity:.55 } 50% { opacity:1 } }
      `}</style>
      {/* starfield */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20px 30px,#fff,transparent),radial-gradient(1px 1px at 120px 90px,#9be7ff,transparent),radial-gradient(1.5px 1.5px at 220px 160px,#fff,transparent),radial-gradient(1px 1px at 300px 40px,#fff,transparent)",
          backgroundSize: "340px 200px",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-6">
        {/* Toggle */}
        <div className="mb-6 flex justify-center">
          <div role="tablist" className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-cyan-500/30 bg-slate-900/80 p-1 backdrop-blur-md">
            {Object.entries(DATASETS).map(([key, d]) => {
              const Icon = d.icon;
              const on = key === mode;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setMode(key)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                    on ? "bg-cyan-500 text-slate-900 shadow-[0_0_16px_rgba(34,211,238,0.6)]" : "text-cyan-200 hover:bg-cyan-500/15"
                  }`}
                >
                  <Icon size={15} /> {d.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Radial canvas */}
        <div className="relative">
          {/* connector lines (desktop only): center -> each card's inner corner */}
          <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <defs>
              <filter id="mm-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.6" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {[[34, 30], [66, 30], [34, 70], [66, 70]].map(([x, y], i) => (
              <g key={i} filter="url(#mm-glow)">
                <path d={`M50 50 L${x} ${y}`} stroke="#22d3ee" strokeOpacity=".35" strokeWidth="3" vectorEffect="non-scaling-stroke" fill="none" />
                <path d={`M50 50 L${x} ${y}`} stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" fill="none" style={{ animation: "mm-flow 1.2s linear infinite" }} />
                <circle cx={x} cy={y} r="0.8" fill="#67e8f9" style={{ animation: "mm-pulse 2s ease-in-out infinite" }} />
              </g>
            ))}
          </svg>

          <div className="relative grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-x-[26%] lg:gap-y-24">
            <Card icon={Info} title="What is this" image={images.what} onImage={setImage("what")}>
              <dl className="space-y-1.5 text-xs">
                {data.what.map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="w-24 shrink-0 font-semibold text-cyan-300">{k}</dt>
                    <dd className="text-slate-200">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card icon={Clock} title="Mission Timeline" image={images.timeline} onImage={setImage("timeline")}>
              <Timeline key={mode} items={data.timeline} />
            </Card>

            <Card icon={Trophy} title="Discover the Legacy" image={images.legacy} onImage={setImage("legacy")}>
              <ul className="space-y-2">
                {data.legacy.map(([big, text]) => (
                  <li key={big + text} className="flex items-baseline gap-2 text-xs">
                    <span className="shrink-0 text-base font-bold text-cyan-300 drop-shadow-[0_0_6px_#22d3ee]">{big}</span>
                    <span className="text-slate-300">{text}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card icon={Telescope} title="Can it still contribute?" image={images.contribute} onImage={setImage("contribute")}>
              <ol className="space-y-2">
                {data.contribute.map(([head, sub], i) => (
                  <li key={head} className="flex gap-3 text-xs">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-400/60 font-bold text-cyan-300">{i + 1}</span>
                    <span>
                      <span className="block font-semibold text-white">{head}</span>
                      <span className="text-slate-400">{sub}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          {/* Center node */}
          <div className="mt-6 flex justify-center lg:pointer-events-none lg:absolute lg:left-1/2 lg:top-1/2 lg:mt-0 lg:-translate-x-1/2 lg:-translate-y-1/2">
            <div className="pointer-events-auto relative h-52 w-52 sm:h-60 sm:w-60">
              <div className="absolute -inset-3 rounded-full border border-dashed border-cyan-400/60" style={{ animation: "mm-spin 18s linear infinite" }}>
                <Satellite size={18} className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-950 p-0.5 text-cyan-300" />
              </div>
              <div className="absolute -inset-1 rounded-full border border-cyan-300/70 shadow-[0_0_30px_rgba(34,211,238,0.55)]" style={{ animation: "mm-pulse 3s ease-in-out infinite" }} />
              <ImageSlot round src={images.center} onChange={setImage("center")} alt={data.title} className="h-full w-full border-2 border-cyan-300/80" />
              <div className="absolute -bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-cyan-500/40 bg-slate-900/90 px-3 py-1 text-xs font-bold text-cyan-200">
                <Disc3 size={13} className="text-cyan-400" style={{ animation: "mm-spin 4s linear infinite" }} /> {data.title}
              </div>
            </div>
          </div>
        </div>

        {/* Status footer */}
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STATUS_META.map((m) => (
            <StatusCard key={mode + m.key} meta={m} value={status[m.key]} onChange={setStatus(m.key)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Standalone page support: mount when index.html provides #root.
const rootEl = typeof document !== "undefined" && document.getElementById("root");
if (rootEl) createRoot(rootEl).render(<ApolloMindMap />);
