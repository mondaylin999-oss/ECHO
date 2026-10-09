# Solar System Explorer frontend outcomes

- On load, show a 3D starfield with Sun, Mercury through Pluto, thin orbit rings, Moon orbiting Earth, and a typing astronaut intro that ends with a pulsing “Tap to continue” action.
- After continuing, enable responsive pointer/touch exploration with hover labels, body selection, mission/live-data badges, limited OrbitControls, and keyboard Escape navigation.
- Focus mode must enlarge the selected body, blur/dim the background, preserve free rotation, and show name, summary, facts, and a back action; basic bodies expose facts only.
- Mars and Moon focus views must show tool hotspots, dataset links, a quiz action, and tool detail views with primitive 3D models, auto-rotation, drag rotation, photo cards, captions, and lightbox behavior.
- Earth focus view must show procedural fallback imagery, a NASA imagery credit/link, independently isolated fires/climate/search controls, loading/retry states, climate probe output with sparkline and Earth/Mars/Moon comparison, and NASA data search links.
- Quiz modal must load mock questions, answer one at a time, show progress/difficulty, lock answer feedback with explanations, preserve progress when closed, and finish with score/retry/close states.
- Data credits must stay visible and open a safe, DOM-rendered popover; all API-provided strings must use textContent or DOM properties, and external links must use noopener noreferrer.
- Responsive CSS must cover 360px through desktop, visible focus rings, reduced-motion behavior, DPR-safe rendering, tab-hidden pause, and touch-friendly controls.
- README must document setup, env vars, mock mode, scripts, architecture, and texture swapping; npm scripts must include dev, build, and preview.
