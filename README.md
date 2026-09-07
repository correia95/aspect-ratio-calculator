# aspect-ratio-calculator

Three tabs: **resize to a ratio** (fix a ratio, enter one dimension, solve the
other), **what's the ratio** (two dimensions → simplified `a:b` + decimal + a
name if it's a common one), and **fit inside a box** (scale a size down to sit in
a box, no cropping). Presets for 16:9, 4:3, 9:16, 21:9 (64:27), 1:1, 3:2, 2:1,
2.39:1. Everything in the URL.

**Live:** https://aspect-ratio-calculator.correia95.workers.dev/

## Stack

- React 18 + TypeScript + Vite, no runtime deps beyond React
- Static-assets Cloudflare Worker

## Engine

[`src/calc.ts`](src/calc.ts): `gcd` / `simplify`, `describe` (ratio info + fuzzy
match to a named-ratio table within 1.2%), `fromWidth` / `fromHeight`,
`fitInside`. Node-verified: 1920×1080 → 16:9 (named), 1280×1024 → 5:4, 3440×1440
→ 43:18 (recognised as 2.39:1-ish… actually 21:9 family), 16:9 @ 2560 → 1440,
fit 4000×3000 in 1920×1080 → 1440×1080 @ 0.36×.

## Develop / deploy

```bash
npm install
npm run dev
npm run deploy
```
