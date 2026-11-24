# Rolex Empire (Version 1.0)

**Rolex Empire** is a 3D browser-based Ugandan street-food business simulation set in Kampala. Prepare chapati on a cast-iron *tava*, crack eggs with fresh vegetables and fillings, roll authentic Rolex in brown kraft paper, serve customers during 60-second shifts, earn Ugandan Shillings (UGX), and reinvest in equipment and staff.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4
- **3D Engine:** Three.js (WebGL, procedural PBR Canvas textures, GLB/glTF-ready `AssetManager`)
- **Audio:** Procedural Web Audio API synthesizer (zero external audio dependencies)
- **Persistence:** Browser `localStorage` (`rolex_empire_save_v1`)
- **Build & Hosting:** Vite 8 + Vercel SPA routing (`vercel.json`)

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

To verify TypeScript types and build the production bundle:

```bash
npm run lint
npm run build
```

## Public Pages & AdSense Preparation

The site includes clean client-side routes backed by `vercel.json` SPA rewrites:

- `/` — Home / Title Screen & Career Snapshot
- `/play` — Full-screen 3D Kampala Rolex Stall
- `/how-to-play` — Player Guide & Controls
- `/about` — Cultural Story & Version 1.0 Overview
- `/privacy-policy` — Privacy & Cookie Disclosures
- `/contact` — Feedback & Support Form

### Connecting Google AdSense After Approval

No fake ad scripts or dummy publisher IDs are shipped in the codebase. Once your domain is approved by Google AdSense:

1. Add the official Google AdSense `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID" crossorigin="anonymous"></script>` snippet to `index.html` (or configure `ads.txt` in `public/ads.txt`).
2. Set `VITE_ADSENSE_CLIENT` and optional slot IDs (`VITE_ADSENSE_HOME_SLOT`, `VITE_ADSENSE_GUIDE_SLOT`, `VITE_ADSENSE_ABOUT_SLOT`) in Vercel Environment Variables.
3. Redeploy on Vercel. Ad units render strictly on informational website pages and stay separated from the `/play` 3D viewport.

## Publishing to GitHub

```bash
git init
git add .
git commit -m "Release Rolex Empire v1.0"
git branch -M main
git remote add origin https://github.com/emkay0070/ROLEX-EMPIRE-.git
git push -u origin main
```

## Deploying to Vercel

1. Import the `emkay0070/ROLEX-EMPIRE-` GitHub repository in the Vercel dashboard.
2. Vercel detects `vite` automatically via `vercel.json` (`npm run build`, output directory `dist`).
3. Optional: add `VITE_ADSENSE_CLIENT` and slot variables in Project Settings &rarr; Environment Variables after AdSense approval.
4. Click **Deploy**. All routes (`/`, `/play`, `/how-to-play`, `/about`, `/privacy-policy`, `/contact`) are rewritten cleanly to `/index.html`.
