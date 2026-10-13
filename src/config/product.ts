/**
 * Single source of truth for the KINESYS KX-1 SIGNAL launch site.
 *
 * Everything the brief calls "editable" lives here: copy, frame counts, file paths, colourways and
 * every specification. All numbers are FICTIONAL / ILLUSTRATIVE until the product is finalised.
 */

export const BRAND = {
  name: "KINESYS",
  model: "KX-1 SIGNAL",
  tagline: "Sound, re-engineered for the way you move.",
  launch: "Drop 11.21",
  contact: "hello@kinesys.example",
  location: "Studio 04 — Fictional Harbour District",
};

/* ───────────────────────── image sequences ─────────────────────────
 * Frames are loaded from  `${dir}/${prefix}${NNNN}.${ext}`  (1-indexed, zero-padded).
 * Drop real renders in the same folders and adjust `count` / `mobileCount` — nothing else changes.
 * Missing frames are tolerated: the renderer holds the nearest loaded frame, and if the first
 * frame can't be loaded at all, a labelled placeholder illustration is shown instead.
 */
export type SequenceConfig = {
  id: string;
  dir: string;
  mobileDir: string;
  count: number;
  mobileCount: number;
  prefix: string;
  ext: string;
  pad: number;
};

const seq = (id: string, count: number, mobileCount: number): SequenceConfig => ({
  id,
  dir: `/images/headphones/${id}`,
  mobileDir: `/images/headphones/${id}-mobile`,
  count,
  mobileCount,
  prefix: "frame_",
  ext: "webp",
  pad: 4,
});

export const SEQUENCES = {
  hero: seq("hero", 36, 18),
  rotation: seq("rotation", 96, 48),
  exploded: seq("exploded", 60, 30),
  finale: seq("finale", 40, 20),
};

export const IMAGES = {
  colors: {
    silver: "/images/headphones/colors/silver.webp",
    black: "/images/headphones/colors/black.webp",
    violet: "/images/headphones/colors/violet.webp",
  },
  features: {
    sound: "/images/headphones/features/sound.webp",
    anc: "/images/headphones/features/anc.webp",
    comfort: "/images/headphones/features/comfort.webp",
    controls: "/images/headphones/features/controls.webp",
  },
};

/* ───────────────────────── story beats (rotation sequence) ───────────────────────── */
export const BEATS = [
  { title: "Meet your new frequency.", body: "KX-1 SIGNAL arrives as a single sculpted gesture — chrome, leather and one line of light.", tag: "01 / Presence" },
  { title: "Designed to move differently.", body: "A floating headband and counter-weighted cups carry the silhouette through a full turn.", tag: "02 / Silhouette" },
  { title: "Every curve. Every detail.", body: "Machined shells, a knurled signal dial and a stitched cushion, cut from the same line.", tag: "03 / Form" },
  { title: "Precision you can feel.", body: "Brushed aluminium meets memory-foam leather. The LED ring is the only thing that glows.", tag: "04 / Material" },
  { title: "Made to move with you.", body: "From the first beat to the last train home. Same product, new angle.", tag: "05 / Motion" },
];

/* ───────────────────────── exploded view ───────────────────────── */
export const COMPONENTS = [
  { name: "Outer earcup shells", note: "Brushed aluminium, anodised + polished bevel" },
  { name: "Internal speaker drivers", note: "Dual-layer dynamic driver, lime-capped" },
  { name: "Cushioning", note: "Stitched protein leather over memory foam" },
  { name: "Headband", note: "Floating spring-steel strap, padded underside" },
  { name: "Internal frame", note: "Vented graphite chassis and hinge" },
  { name: "Control components", note: "Knurled signal dial + single-press button" },
];

/* ───────────────────────── colourways ───────────────────────── */
export const COLORWAYS = [
  { id: "silver", name: "Chrome Silver", image: IMAGES.colors.silver, bg: "#1b2fd0", bg2: "#0a1160", accent: "#c6ff2e", fg: "#ffffff", note: "Cobalt reflections, polished bevel." },
  { id: "black", name: "Midnight Black", image: IMAGES.colors.black, bg: "#3a0f5c", bg2: "#0c0516", accent: "#c6ff2e", fg: "#ffffff", note: "Dark chrome, plum leather." },
  { id: "violet", name: "Electric Violet", image: IMAGES.colors.violet, bg: "#c6ff2e", bg2: "#8fd400", accent: "#2b0a66", fg: "#0b0620", note: "Anodised violet against acid lime." },
] as const;

/* ───────────────────────── features ───────────────────────── */
export const FEATURES = {
  battery: { hours: "40", label: "hours (illustrative)", fastCharge: "10 min → 5 h (illustrative)" },
};

/* ───────────────────────── specifications (ILLUSTRATIVE) ───────────────────────── */
export const SPECS: { key: string; label: string; value: string }[] = [
  { key: "dimensions", label: "Product dimensions", value: "190 × 165 × 82 mm (illustrative)" },
  { key: "weight", label: "Weight", value: "268 g (illustrative)" },
  { key: "connectivity", label: "Connectivity", value: "Bluetooth LE Audio · USB-C audio · 3.5 mm (illustrative)" },
  { key: "anc", label: "Noise cancellation", value: "Adaptive hybrid ANC, 4 modes (illustrative)" },
  { key: "battery", label: "Battery life", value: "Up to 40 h with ANC on (illustrative)" },
  { key: "charging", label: "Charging", value: "USB-C · 10 min ≈ 5 h playback (illustrative)" },
  { key: "colors", label: "Available colours", value: "Chrome Silver · Midnight Black · Electric Violet" },
  { key: "accessories", label: "Included accessories", value: "Hard travel case · USB-C cable · 3.5 mm cable (illustrative)" },
];

export const NAV = [
  { label: "Story", href: "#story" },
  { label: "Engineering", href: "#engineering" },
  { label: "Features", href: "#features" },
  { label: "Colours", href: "#collection" },
  { label: "Specs", href: "#specs" },
];
