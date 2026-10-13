# KINESYS — KX-1 SIGNAL

Fictional premium over-ear headphone launch site. Next.js (App Router) · TypeScript · Tailwind v4 · Motion · Lucide · HTML canvas image sequences.

```bash
npm run dev        # http://localhost:3000
npm run lint && npm run build
npm run frames     # re-render every procedural frame (≈ 3 min). `frames:fast` = half-res preview
```

## Everything editable lives in `src/config/product.ts`
Copy, colourways, exploded-view parts, **specs (all illustrative)**, and the frame counts / paths of every image sequence.

## Image sequences
| Sequence | Desktop | Mobile | Used by |
|---|---|---|---|
| `hero` | `/images/headphones/hero/frame_0001.webp` (36) | `hero-mobile` (18) | Hero |
| `rotation` | `rotation` (96) | `rotation-mobile` (48) | 360° story |
| `exploded` | `exploded` (60) | `exploded-mobile` (30) | Exploded view |
| `finale` | `finale` (40) | `finale-mobile` (20) | Final reveal |

Stills: `colors/{silver,black,violet}.webp`, `features/{sound,anc,comfort,controls}.webp`.

The shipped frames are **procedurally rendered** by `scripts/generate-frames.mjs` (a tiny software 3D pipeline → SVG → WebP with alpha) because no product photography or 3D model exists. To use real renders, drop transparent, square WebP frames into the same folders and update `count` / `mobileCount`. If the first frames can't be loaded, the page shows a labelled placeholder illustration instead.

## How the scroll animation works
`src/lib/frame-sequence.ts` loads frame 1, then a coarse-to-fine sweep, and jumps the queue to frames near the playhead. `src/components/ScrollCanvas.tsx` maps scroll progress → frame index, eases the playhead (so fast flicks still pass through frames; reverse scroll just works), draws the nearest loaded frame to a DPR-aware canvas, and cleans up on unmount. Pinning is CSS `position: sticky` inside tall sections; progress comes from Motion's `useScroll`. `prefers-reduced-motion` swaps the pinned sequences for static stills + text.

The newsletter form validates client-side only; nothing is stored or sent.
