# Solar System Explorer

An educational 3D solar-system explorer built with Vite, TypeScript, Three.js, OrbitControls, and plain CSS. It reads bodies, tools, the astronaut script and the Mars/Moon quizzes from the API in the repository root, and falls back to built-in fixtures when the API is unreachable. Earth's live layers, datasets and credits are still fixtures. See the root README for details.

## Run it

```bash
pnpm install
pnpm dev
```

Start the API first (`npm run dev` in the repository root), then open the Vite dev server on port `5173`; it proxies `/api` and `/images` to `http://localhost:3000`. Production checks:

```bash
pnpm build
pnpm preview
```

## Environment

- `VITE_API_BASE_URL` — optional API origin. Leave blank for same-origin requests.
- `VITE_USE_MOCKS=true` — optional; skip the API and use the in-memory fixtures for everything.
- `VITE_DEV_API_TARGET` — optional; where the dev proxy sends `/api` and `/images` (default `http://localhost:3000`).

## Architecture

```text
DOM shell + CSS glass panels
        │
        ├── state.ts (LOADING → INTRO → AWAIT_TAP → EXPLORE → FOCUS → TOOL_DETAIL)
        │
        ├── api.ts (typed REST boundary + complete mock fixtures)
        │
        └── main.ts
              ├── overview Three.js scene (orbits, bodies, labels, raycast)
              ├── focus scene (body, facts, mission hotspots, Earth layers)
              ├── tool models (primitive geometry factories)
              └── UI surfaces (intro, inspector, quiz, search, credits, lightbox)
```

## Swapping textures

Procedural planet textures are intentionally kept as materials created from a canvas in `src/main.ts`. Replace the `makePlanetMaterial` function with a `TextureLoader` call, or return an API texture URL from `getImagery()` and load it with `crossOrigin='anonymous'`. Earth’s NASA imagery response is already isolated behind `getImagery()`, so a production backend can provide a relative `textureUrl` without changing the scene UI.

## Safety and resilience

API text is inserted through DOM properties rather than HTML interpolation, external links use `noopener noreferrer`, and live Earth features keep their own request states so a failed NASA-backed feature does not interrupt exploration.
