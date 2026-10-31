# V3: multiple garments

Select one garment per category and any supported accessory category. Choosing a full outfit replaces separate top/bottom selections. Clothes are previewed sequentially, ordered full outfit/bottom/top/outerwear/shoes. Accessories, including scarves, are labeled packing-only and are not sent to the Clothes API.

Each generation uses credits. The review screen shows the number of generations and obtains consent before starting. Each subsequent request carries a signed sourceTicket; the server verifies the prior task has succeeded and uses its returned URL as src_file_url. The browser cannot submit an arbitrary source URL. No generated image needs to be downloaded in the browser to start the next step.

The queue snapshots the garments, destination, and original photo. Original/Preview comparison uses the original snapshot. If polling times out or has a transient error, checking again reuses the active ticket. A terminal failure retries only that step, with a visible credits notice. Successful earlier steps are retained in memory. Closing or reloading the page loses session photos and queue state.

## Verification — October 31, 2026

- TypeScript check and 21 automated tests passed, covering multi-category selection, category replacement, batch packing, source chaining, timeout resume, transient errors, terminal failure retry, URL validation and signed-ticket integrity.
- Real integration test through the local Worker API: YouCam's public documentation sample person + generated linen shirt, followed by generated terracotta outerwear. Both tasks succeeded; the final image visibly retains the shirt under the jacket. This is one controlled test, not a guarantee for every garment/pose combination.
- Test source: https://plugins-media.makeupar.com/strapi/assets/clothes_03_cccd5d4803.jpeg (documentation sample, not shipped as an app asset).
- API contract: https://docs.perfectcorp.com/reference/ai_clothes/v4.0

## Backup

V2 commit: 3c8c3b7a33ae18ac02e7edec644dced49563e0da.
Backup: ../rihla-backups/rihla-before-v3-2026-10-31.zip. This tracked-source archive excludes local API keys, uploaded photos and dependencies.
