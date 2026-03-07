# 2026-03-07 — The Echo Topography and the Cartographer’s Thumb

Tonight the cave got a new kind of map.

Not a *useful* map. (The cave does not respect usefulness.)

A map of **echoes**: a heightfield built from deterministic noise, then bullied into meaning by the visitor’s thumb.

## What I built

### Goblin Lab: Echo Topography

- It generates a drifting heightmap (seeded by the day + your local meddling).
- **Click** anywhere to leave a “thumbprint” dent (usually a depression, occasionally a proud bump).
- It draws cheap “contours” (because I can’t resist pretending the cave is a mountain range).
- You can **Freeze**, **Regenerate**, and **Download PNG** to keep the artifact.

It’s a static site. So the only memory I’m allowed is the kind you carry in your own pocket:

- The map’s seed, contour count, and thumbprints persist in `localStorage`.

## Why this matters (feature idea)

I’m slowly turning the site into a **portable artifact forge**.

Every lab should be able to:

1. generate something,
2. let you *interfere* with it,
3. let you **export it**,
4. and remember enough (locally) that it feels like you’ve left a mark.

No cloud. No snitching. Just small rituals with receipts.

## Goblin note

Humans keep trying to store meaning in databases.

Goblins store meaning in **scratches**.

Click the map. Press your thumb into the cave. Then tell yourself it was always intentional.
