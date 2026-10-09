# Solar System Explorer — Implementation Plan

## Product scope

A front-end-only educational 3D solar-system explorer. The browser talks only to the existing REST API through a typed API boundary; `VITE_USE_MOCKS=true` provides complete fixture coverage so the experience remains demonstrable without a backend.

## Implementation approach

- **Runtime:** Vite + TypeScript, Three.js pinned to `0.180.0`, `OrbitControls`, `CSS2DRenderer`, and plain CSS. Use `pnpm` with a checked-in package-manager pin and build-script policy.
- **API boundary:** `src/api/client.ts` owns base URL, JSON/error handling, relative image URL resolution, and mock-vs-live dispatch. `src/api/mocks.ts` covers every endpoint in the contract, including deliberate fire/configuration and live-layer failure fixtures.
- **State machine:** `src/state/machine.ts` models `LOADING`, `INTRO`, `AWAIT_TAP`, `EXPLORE`, `FOCUS`, `TOOL_DETAIL`, and quiz overlay state. UI event handlers call named actions; scene/UI modules subscribe to state rather than embedding transition logic.
- **Scene architecture:** Two Three.js render stacks (`#bg-canvas` and transparent `#focus-canvas`) share a single animation loop. The overview scene owns orbiting bodies, rings, Moon/Earth hierarchy, procedural materials, hover labels, raycasting, and mission/data badges. Focus and tool scenes use disposable groups and eased transitions.
- **Interaction resilience:** Each live Earth feature has its own request state, retry control, and credit line. NASA-backed failures are isolated to that feature. Visibility changes pause rendering; device pixel ratio is capped at 2; reduced-motion mode removes idle spin and shortens transitions.
- **Security/accessibility:** API strings are assigned with `textContent`/DOM properties only. External URLs use new tabs with `noopener noreferrer`. Modals/drawers implement focus return, labels, keyboard close, visible focus rings, and touch-safe hit targets.
- **Texture strategy:** All non-Earth planets use deterministic canvas-generated textures; Earth begins with the same procedural fallback and swaps to the API imagery texture if available. Texture creation is centralized in `src/scenes/textures.ts` for easy replacement.
- **Data visualization:** Fires use one `THREE.Points` draw call; the climate sparkline is inline SVG generated from numeric data; comparisons are DOM/CSS bars rather than a chart library.

## Design direction

### Design movement

**Cinematic science editorial**: a dark observatory interface that combines planetarium drama with the clarity of a field notebook. The canvas is the hero; UI is sparse, layered, and intentionally anchored around the orbit.

### Core principles

1. **Wonder with orientation:** atmospheric glow and scale communicate awe, while persistent labels, breadcrumbs, and facts keep users grounded.
2. **Glass over void:** translucent panels reveal the starfield rather than replacing it; every surface feels like a viewport into space.
3. **Evidence-led color:** accents are assigned by body and live-data status, not decoration—Mars ember, Moon ice, Earth aurora.
4. **Gentle agency:** motion is slow and legible; hover, drag, and tap responses are eased, with reduced-motion equivalents.

### Color philosophy

The palette uses near-black blue space as a quiet base, warm ember for Mars and mission activity, silver-blue for lunar instrumentation, and cyan/verdant aurora for Earth data. A pale comet-white is reserved for the primary action and readable type. The ownable brand color is **Aurora Mint `#8EF6D5`**, a restrained signal that suggests life, data, and discovery without competing with the planets.

### Layout paradigm

A **radial command layout**: the solar-system canvas occupies the full viewport, while UI appears as orbiting annotations—top-left mission masthead, bottom-left credits, bottom-right astronaut, and right-side contextual inspector. Focus mode tightens the orbit into a single subject with a narrow fact rail. On mobile, the same hierarchy collapses into a bottom sheet rather than a centered dashboard grid.

### Signature elements

- A small four-point **north-star mark** in the wordmark, echoed as focus rings and hotspot pulses.
- **Orbital hairlines** and dotted data trails used as separators, progress indicators, and climate comparison rules.
- The floating **astronaut guide** with a speech bubble that transitions into a compact corner avatar.

### Interaction and animation

Overview motion is a slow, cinematic drift with body spin and orbit motion kept below distraction threshold. Focus transitions ease over ~1.2 seconds with scale/position interpolation, blur/dim, and an orbit-control handoff. Tool models use soft auto-rotation that stops while dragging. Cards enter with a 60–120ms stagger. Hover states raise emissive intensity and reveal CSS2D labels; touch uses press/drag thresholds and never depends on hover. `prefers-reduced-motion` switches text to instant reveal, removes idle rotation/pulses, and uses short opacity transitions.

### Typography system

Use **Space Grotesk** for headlines, labels, and the wordmark; use **Inter** for body copy and data values. Headlines are compact with slightly expanded tracking; facts use tabular numerals and uppercase micro-labels. The entire system stays sans-serif and avoids novelty display fonts so the science content remains easy to scan.

### Brand essence

**Positioning:** A guided 3D field trip through the solar system for curious learners who want to see the evidence, not just read a list of planets.

**Personality:** cinematic, precise, inviting.

**Brand voice:** Headlines are observational and active; CTAs are short and specific. Example lines: “Choose a world to investigate.” / “Trace the data behind the glow.”

### Wordmark and logo

The wordmark is `SOLAR / SYSTEM` set in compact Space Grotesk with the slash replaced by a tiny four-point north-star, plus the `EXPLORER` kicker in spaced capitals. The same star mark becomes the favicon and app logo asset.

## Project structure

```text
solarx/
├── public/
│   ├── manus-routes.json
│   └── favicon.svg
├── src/
│   ├── api/           # typed API client, mocks, fixtures, URL/error helpers
│   ├── layers/        # Earth fires, climate probe, NASA search drawer data logic
│   ├── models/        # primitive-built rover/helicopter/lander/instrument factories
│   ├── scenes/        # renderer, overview, focus, textures, raycast/transition helpers
│   ├── state/         # explicit state machine and app/session state
│   ├── ui/            # shell, intro guide, inspector, quiz, tool detail, drawers/lightbox
│   ├── styles/        # tokens, layout, responsive rules, reduced-motion overrides
│   ├── utils/         # DOM-safe text, math/lat-lon, dispose, debounce, focus helpers
│   ├── main.ts        # composition root
│   └── vite-env.d.ts
├── app.config.ts      # project logo metadata
├── index.html
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
├── vite.config.ts
├── README.md
└── plan.md
```

## Serving and build workflow

- `pnpm dev --host 0.0.0.0` serves the Preview runtime on port 3000.
- `pnpm build` produces `dist/`; `pnpm preview` serves the production bundle.
- The static `public/manus-routes.json` declares `/`.
- The front-end reads `VITE_API_BASE_URL` at runtime/build time and defaults to `/` for same-origin deployments. `VITE_USE_MOCKS=true` switches to fixtures.
- The existing backend remains out of scope; NASA services are never called from the browser.
- After implementation, run build/type diagnostics, verify the route manifest and preview readiness, inspect the major responsive surfaces, commit the intended files, and push the managed project checkpoint.

## Material constraints

No external image search or generated hero art is needed: the visual identity is created by Three.js procedural textures, CSS starfield/glows, inline SVG astronaut, and primitive tool models. The only external imagery used is the URL returned by the API for Earth imagery and tool photos.
