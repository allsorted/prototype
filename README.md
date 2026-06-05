# AllSorted — Prototype

Hosted, clickable prototype for **AllSorted** (GetAllSorted) — Irish meal planning + automated grocery delivery.

Plan meals → generate shopping list → inject into Tesco/Dunnes/SuperValu cart → confirm & pay.

## Live

https://allsorted.github.io/prototype/

## Structure

| File | Purpose |
|---|---|
| `index.html` | HTML shell — loads `data/recipes.js` then `app.js` |
| `data/recipes.js` | Recipe pool (`PHOTO`, `PLAN_A`, `PLAN_B`, `SWAP_POOL`, `ALL_RECIPES`, `window.RECIPES`) |
| `app.js` | All UI logic (React via CDN, `React.createElement` — no build step) |

No build step. Plain static files served by GitHub Pages. Open `index.html` over a static server (not `file://`) to run locally.

Migrated from the single-file `prototype.html` reference held in the AllSorted planning hub.
