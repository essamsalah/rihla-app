# Rihla V3 — Judge testing instructions

## Access — complete before submission
App: https://rihla-jordan-essam.husheddegu256.chatgpt.site/
The Site is owner-private. Replace this paragraph with the tested judge access method before submitting. Do not provide a personal ChatGPT login or an API key. Public repository: https://github.com/essamsalah/rihla-app

## Quick planner check
1. Open Trip and choose Explore a sample plan.
2. Open Packing. For the unchanged starter plan, expect three planned outfits and seven unique pieces.
3. Shared walking shoes appear once with all three destinations. Check an item; the count updates.
4. Return to Trip, select a destination, then Choose my outfit.
5. Select a shirt, jacket and scarf. Expect three selected pieces, two preview steps and one packing-only item.
6. Continue, then use Pack all selected pieces without a preview. The selected pieces are added together; a new top replaces that stop's old top without removing unrelated categories.
7. Expand a destination in Packing to review/remove pieces and see missing categories. Download or Print / PDF the plan.

## Real two-garment preview
1. Choose a stop. Select Easy linen shirt and Light overshirt, or add your own clear photographed equivalents. Select only one item per category.
2. Continue. Upload one permitted front-facing person photo, JPEG/PNG under 8 MB.
3. Review the two-step sequence and consent. Press Preview 2 garments once. Each garment uses a separate generation and credits.
4. Keep the page open. YouCam applies the shirt, then uses that result for the jacket. If paused, Check existing preview reuses the current ticket. A terminal error shows a separate retry action that may use more credits.
5. Compare Original / Preview, then Pack this outfit. Both chosen garments are added to the destination plan.

Layering is experimental: earlier details may change. Scarves/accessories are packing-only. For lower-body reference images, use worn clothing as directed by the API guide. A full outfit selection replaces separate top/bottom selections.

## Local setup
Use Node 24+ (the project's declared minimum is 22.13). Extract rihla-source.zip or clone the final repository. See README.md for setup and license information.
```sh
npm run install:ci
npm run dev
```
Open the printed URL. Planning works without a key. For generation, configure your authorized YOUCAM_API_KEY in an untracked .dev.vars file and restart; use .env.example as a guide. Never commit that file.

Checks:
```sh
node --experimental-strip-types --test tests/*.test.mjs
npx tsc --noEmit
npm run build
```

## Persistence and limits
Saved planning metadata stays in that browser. Uploaded photos, queue progress and generated results are session-only; reloading loses them. Result links expire. No live weather, retail stock, checkout, booking or fit guarantee is implemented.
