# Vehicle Damage Scanner

Mobile-first PWA for **Susquehanna CDJR** lot inspections (wholesale + retail). Walk a vehicle, capture the standard angles, run damage analysis, and export a report.

Photos are stored on the device (IndexedDB). In live mode they are sent to OpenAI GPT-4o vision for analysis. There is no login in v1 and no third-party auto-body SaaS.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

`.env.local`:

```bash
# Required for live GPT-4o vision analysis.
# Leave empty (or omit this file) to run the full app in demo mode.
OPENAI_API_KEY=
```

| `OPENAI_API_KEY` | What you get |
| --- | --- |
| Empty / missing | **Demo mode** — full capture → analyze → report UI with sample findings and a Demo badge |
| Set | **Live mode** — `POST /api/analyze` calls GPT-4o vision; UI shows a Live badge |

Restart `npm run dev` after changing the key.

## Phone / lot use

1. Put the phone on the lot Wi-Fi (or a hotspot) and open the app in Safari or Chrome.
2. **Add to Home Screen** so it runs as a PWA (camera + full screen, no browser chrome).
   - iPhone: Share → Add to Home Screen
   - Android Chrome: menu → Install app / Add to Home Screen
3. Camera access needs **HTTPS** or **localhost**. A LAN `http://192.168…` URL often blocks `capture`.
4. Use **Camera** for the rear camera, or **Gallery** if you already shot the walkaround.
5. Turn brightness up; wipe the lens; stand 8–10 ft for sides/front/rear; get close for wheels and glass.
6. Skip any angle you cannot shoot. Add extra close-ups from Review.
7. On a desktop without a car, use **Fill empty slots with sample photos** on the review screen, then **Analyze damage**.

Inspections stay on that phone until you delete them.

## Flow

1. **New inspection** — optional VIN, year/make/model, stock/RO, odometer, inspector
2. **Guided walkaround** — front, rear, driver, passenger, four corners, roof/hood, wheels/tires, windshield/glass, interior
3. **Analyze** — per-photo findings: type, severity (minor / moderate / severe), location, description, confidence, callout box
4. **Report** — severity counts, inspector notes, per-photo annotations
5. **Export** — PDF and JSON

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

Node 20+ recommended.

## Stack

- Next.js App Router + TypeScript + Tailwind
- OpenAI official SDK (`gpt-4o`) — not Gemini
- Local persistence via IndexedDB
