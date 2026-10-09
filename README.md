# Solar System Explorer API

REST back-end for Solar System Explorer, an educational 3D web app. It serves basic facts for 11 solar system bodies, deep content for Mars and the Moon (surface tools, three images per tool, a quiz) and the script for the astronaut narrator.

Node.js 20+, Express 5, TypeScript, zod. Content lives in JSON files under `data/`; there is no database.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The API is then at `http://localhost:3000`.

| Variable      | Default                 | Purpose                                                        |
| ------------- | ----------------------- | -------------------------------------------------------------- |
| `PORT`        | `3000`                  | Port to listen on                                              |
| `CORS_ORIGIN` | `http://localhost:5173` | Origin allowed by CORS. Comma-separate to allow more than one. |

## Scripts

| Script                          | What it does                                                    |
| ------------------------------- | --------------------------------------------------------------- |
| `npm run dev`                   | Start with reload on change (tsx)                               |
| `npm run build`                 | Compile `src/` to `dist/`                                       |
| `npm start`                     | Run the compiled server (`npm run build` first)                 |
| `npm test`                      | Run the vitest + supertest suite (no network needed)            |
| `npm run generate:placeholders` | Regenerate the SVG placeholder cards in `public/images/tools/`  |

## Front-end

The 3D client (Vite + TypeScript + Three.js) lives in `frontend/` as its own package, managed with pnpm.

```bash
npm run dev                  # API on http://localhost:3000
pnpm --dir frontend install
pnpm --dir frontend dev      # app on http://localhost:5173
```

The Vite dev server proxies `/api` and `/images` to the API, so no CORS setup is needed locally. For a deployed build, set `VITE_API_BASE_URL` to the API origin and add the site's origin to `CORS_ORIGIN`.

What is live and what is still mocked in `frontend/src/api/index.ts`:

| Feature | Source |
| --- | --- |
| Bodies, Mars and Moon tools, tool images, astronaut script, Mars and Moon quizzes | This API |
| Earth imagery, active fires, climate probe, data search, dataset links, credits, Earth quiz | Built-in fixtures (the API does not serve these yet) |
| "Mean temp" fact | Shows "No data" (the API has no `meanSurfaceTempC` field) |

If the API cannot be reached when the page loads, or `VITE_USE_MOCKS=true` is set, the client falls back to its fixtures for everything; the pill in the top-right corner reads "LIVE API" or "MOCK DATA" until the first view change.

## Project layout

```
data/         seed content (bodies, tools, quiz, astronaut script)
public/       static files; public/images/... is served at /images/...
scripts/      generate-placeholders.ts
src/
  routes/       URL -> controller wiring
  controllers/  HTTP in/out
  services/     content loading and lookups
  schemas/      zod schemas for data files and request bodies
  middleware/   validation, rate limiting, error handling
tests/
```

## Behaviour worth knowing

- **Errors** always look like `{ "error": { "code": string, "message": string } }`. Codes: `NOT_FOUND` (404), `VALIDATION_ERROR` and `INVALID_JSON` (400), `PAYLOAD_TOO_LARGE` (413), `RATE_LIMITED` (429), `INTERNAL_ERROR` (500).
- **Startup validation.** Every file in `data/` is parsed with zod and cross-checked (parent ids, tool ids referenced by quizzes, correct option present, `hasData` only on Mars and the Moon). If anything is wrong the server prints the file and field and exits with code 1.
- **Quiz answers** are held server-side. `GET /api/quiz/:bodyId` builds each question from a fixed list of public fields, so `correctOptionId` and `explanation` only ever leave through `POST /api/quiz/:bodyId/answer`.
- **Rate limit:** 100 requests per 15 minutes per IP on `/api/*`. Static images are not counted, since one tool screen loads three of them.
- **CORS** is limited to `CORS_ORIGIN`. Images are sent with `Cross-Origin-Resource-Policy: cross-origin` so the front-end can display them from another origin.
- **Image URLs** in responses are paths relative to the API origin (`/images/tools/curiosity-top.svg`). The front-end prefixes its API base URL.
- If the API is deployed behind a reverse proxy, set Express's `trust proxy` in `src/app.ts`, otherwise every client shares the proxy's IP for rate limiting.

### Data conventions

- `location.latDeg` is north-positive; `location.lonDeg` is east-positive in the range -180 to 180.
- `rotationPeriodHours` is always a positive magnitude. Retrograde rotation (Venus, Uranus, Pluto) is expressed by `axialTiltDeg` above 90, so a renderer should apply the tilt and spin in the normal direction, not flip the spin as well.
- The Sun has `parentId: null`, with `distanceFromParentMillionKm` and `orbitalPeriodDays` set to `0`.
- `visual.hasRings` is a rendering hint and is `true` only for Saturn. Jupiter, Uranus and Neptune have faint rings that are not visible at this scale.
- Keys starting with `_` in the data files (`_comment`, `_todo`) are notes for maintainers. JSON has no comments, so TODOs are stored this way; they are stripped when the data is loaded and never appear in a response.

## Endpoints and curl examples

```bash
# Health
curl http://localhost:3000/api/health
# -> { "status": "ok" }

# Astronaut script
curl http://localhost:3000/api/astronaut/script
# -> { "speaker": "Astro", "lines": [ { "id": "line-1", "text": "..." } ], "endPrompt": "Tap to continue" }

# All 11 bodies
curl http://localhost:3000/api/bodies
# -> { "bodies": [ Body, ... ] }

# One body, plus its tool summaries (empty array unless hasData is true)
curl http://localhost:3000/api/bodies/mars
curl http://localhost:3000/api/bodies/jupiter
curl -i http://localhost:3000/api/bodies/vulcan      # 404

# One tool
curl http://localhost:3000/api/tools/curiosity
curl -i http://localhost:3000/api/tools/unknown      # 404

# Quiz questions (no answers). Only mars and moon; anything else is 404.
curl http://localhost:3000/api/quiz/moon
curl -i http://localhost:3000/api/quiz/earth         # 404

# Check an answer
curl -X POST http://localhost:3000/api/quiz/mars/answer \
  -H "Content-Type: application/json" \
  -d '{"questionId":"mars-q1","optionId":"b"}'
# -> { "correct": true, "correctOptionId": "b", "explanation": "..." }

# 400: invalid input (missing field, malformed JSON, or an optionId the question does not have)
curl -i -X POST http://localhost:3000/api/quiz/mars/answer \
  -H "Content-Type: application/json" -d '{"questionId":"mars-q1"}'

# 404: unknown question
curl -i -X POST http://localhost:3000/api/quiz/mars/answer \
  -H "Content-Type: application/json" -d '{"questionId":"mars-q99","optionId":"a"}'

# A tool image
curl http://localhost:3000/images/tools/curiosity-top.svg
```

Tool ids: `curiosity`, `perseverance`, `ingenuity`, `insight` (Mars); `apollo-11-eagle`, `lunar-roving-vehicle`, `laser-retroreflector`, `chandrayaan-3-vikram` (Moon).

## Replacing the placeholder images

Each tool has three images, `top`, `left` and `right`, stored as `public/images/tools/<tool-id>-<view>.svg`. They are generated cards, and their `credit` is "Placeholder illustration".

To swap in a real photo:

1. Put the file in `public/images/tools/` using the same base name, e.g. `curiosity-top.jpg`.
2. In `data/tools.json`, update that image's `url` extension if it changed, and write a real `alt`, `caption` and `credit`.
3. Delete the old `.svg`.
4. Run `npm test`, which checks that every image file referenced by the data exists.

`npm run generate:placeholders` only writes files for `.svg` URLs, so it will not overwrite real images.

Where to find real media:

- NASA Image and Video Library: https://images.nasa.gov
- NASA Photojournal (JPL): https://photojournal.jpl.nasa.gov
- NASA Science, Mars missions: https://science.nasa.gov/mars/
- Apollo Lunar Surface Journal: https://www.nasa.gov/history/alsj/
- ISRO Chandrayaan-3 gallery: https://www.isro.gov.in/Chandrayaan3.html

NASA imagery is generally free to use with credit (see https://www.nasa.gov/nasa-brand-center/images-and-media/). ISRO and other agencies have their own terms, so check before using their photos. Typical credit lines look like "NASA/JPL-Caltech" or "NASA/JPL-Caltech/MSSS".

## Facts to verify

The seed content was written from memory of published NASA and ISRO figures, without network access to check them against the sources. The items below are the ones most worth confirming; each also has a `_todo` note next to it in the data file.

| Where | Value | Why it needs a look |
| --- | --- | --- |
| `bodies.json` sun | distance and orbital period `0` | Convention for "no parent", not a measured value |
| `bodies.json` sun | `rotationPeriodHours` 609.12 | Sidereal period near the equator; the Sun rotates more slowly at its poles |
| `bodies.json` saturn, uranus, neptune | distance 1432.0, 2867.0, 4515.0 million km | NASA fact sheet revisions differ (1433.5, 2872.5, 4495.1) |
| `bodies.json` pluto | `axialTiltDeg` 122.53 | Also quoted as 119.5 |
| `bodies.json` moon | `axialTiltDeg` 6.68 | Relative to its orbit; about 1.54 relative to the ecliptic |
| `tools.json` curiosity | -4.5895, 137.4417 | Bradbury Landing. The brief's -5.4, 137.8 is the centre of Gale Crater, not the landing site |
| `tools.json` ingenuity | 18.44, 77.45 | Approximate position of Wright Brothers Field |
| `tools.json` laser-retroreflector | -3.644, -17.478 | Pinned to the Apollo 14 array at Fra Mauro so its hotspot does not sit on top of the Apollo 11 lander; confirm the coordinates |
| `tools.json` chandrayaan-3-vikram | -69.373, 32.319 | ISRO's first announcement gave about -69.368, 32.348 |
| `tools.json` insight | "more than 1,300 marsquakes" | Final count is quoted as 1,319 |
| `tools.json` curiosity | "roughly 900 kg" | Published mass is 899 kg |
| `tools.json` apollo-11-eagle | "about 21.5 hours on the surface" | Commonly quoted as 21 h 36 min |

Reference sources: NASA Planetary Fact Sheets (https://nssdc.gsfc.nasa.gov/planetary/factsheet/), NASA mission pages (https://science.nasa.gov), ISRO (https://www.isro.gov.in).
