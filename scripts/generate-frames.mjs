// KX-1 SIGNAL — procedural product renderer.
//
// There is no photographic or 3D source for this fictional product, so this script builds the
// image sequences itself: a small software 3D pipeline (rotation, perspective, painter's algorithm,
// environment-mapped metal, leather shading) that emits an SVG per frame, which sharp rasterises
// to transparent WebP. Replace any generated sequence with real renders at the same paths and
// the website picks them up unchanged (see src/config/product.ts for counts / filenames).
//
//   npm run frames          full set (desktop + mobile)
//   npm run frames:fast     quick low-res pass for iterating on the look
//   node scripts/generate-frames.mjs --only=colors,stills

import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("public/images/headphones");
const FAST = process.argv.includes("--fast");
const ONLY = (process.argv.find((a) => a.startsWith("--only=")) || "").replace("--only=", "").split(",").filter(Boolean);
const want = (k) => ONLY.length === 0 || ONLY.includes(k);

/* ───────────────────────────── math helpers ───────────────────────────── */
const rad = (d) => (d * Math.PI) / 180;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const sgn = (v) => (v < 0 ? -1 : 1);
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb2hex = (c) => "#" + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("");
const mixHex = (a, b, t) => {
  const A = hex2rgb(a), B = hex2rgb(b);
  return rgb2hex(A.map((v, i) => lerp(v, B[i], clamp(t))));
};
const f = (n) => n.toFixed(2);

/* ───────────────────────────── palettes ───────────────────────────── */
const LIME = "#c6ff2e";
const PALETTES = {
  silver: {
    env: ["#120d26", "#2a45f0", "#eef2ff", "#aab2c9", "#1d1836", "#ffffff", "#6c74a6", "#1a1340"],
    cushion: ["#12081f", "#3b1560", "#8f55c9"],
    liner: "#0c0a14",
  },
  black: {
    env: ["#05040a", "#17122b", "#3d4259", "#0b0912", "#70758f", "#07060c", "#262340", "#0e0b18"],
    cushion: ["#07060b", "#1c1727", "#4b4466"],
    liner: "#050408",
  },
  violet: {
    env: ["#1e0848", "#6a2bff", "#e1d2ff", "#9657ff", "#14043a", "#f4ecff", "#5b21d6", "#2a0b66"],
    cushion: ["#12051f", "#43136b", "#9a56d6"],
    liner: "#0a0614",
  },
};

const LIGHT = norm([-0.45, 0.75, 0.55]);
const HALF = norm([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);

const envAt = (stops, t) => {
  const x = clamp(t) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return mixHex(stops[i], stops[i + 1], x - i);
};
const metal = (n, pal) => {
  const t = 0.5 + 0.5 * (n[1] * 0.9 + n[0] * 0.5) + 0.12 * Math.sin(n[0] * 5 + n[1] * 3);
  let c = envAt(pal.env, t);
  const sp = Math.pow(Math.max(0, dot(n, HALF)), 60);
  c = mixHex(c, "#ffffff", Math.min(1, sp * 0.9));
  return c;
};
const leather = (n, pal) => {
  const d = Math.max(0, dot(n, LIGHT));
  let c = mixHex(pal.cushion[0], pal.cushion[1], 0.3 + 0.7 * d);
  const sp = Math.pow(Math.max(0, dot(n, HALF)), 14);
  return mixHex(c, pal.cushion[2], sp * 0.7);
};
const darkPlastic = (n) => mixHex("#0b0a12", "#2b2942", Math.max(0, dot(n, LIGHT)) * 0.9);

/* ───────────────────────────── camera ───────────────────────────── */
function makeCamera({ yaw, pitch, zoom, k, focus, size, centre = [0, 0.62, 0] }) {
  const th = rad(yaw), ph = rad(pitch);
  const cy = Math.cos(th), sy = Math.sin(th), cp = Math.cos(ph), sp = Math.sin(ph);
  const rot = (p) => {
    const x = p[0] * cy + p[2] * sy;
    const z0 = -p[0] * sy + p[2] * cy;
    return [x, p[1] * cp - z0 * sp, p[1] * sp + z0 * cp];
  };
  const a = rot(centre), b = rot(focus);
  const c = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  const S = size * 0.255 * zoom;
  const F = 9;
  return {
    rot, S,
    project(p) {
      const q = rot(p);
      const pz = F / (F - (q[2] - c[2]));
      return [size / 2 + (q[0] - c[0]) * S * pz, size / 2 - (q[1] - c[1]) * S * pz, q[2]];
    },
  };
}

/* ───────────────────────────── geometry ───────────────────────────── */
const SUPER_N = 2.35;
const N_RING = 96;

function ringPoint(L, t, s = 1, x = 0) {
  const c = Math.cos(t), sn = Math.sin(t);
  const z = L.rz * s * sgn(c) * Math.pow(Math.abs(c), 2 / (L.n || SUPER_N));
  const y = L.y0 + L.ry * s * sgn(sn) * Math.pow(Math.abs(sn), 2 / (L.n || SUPER_N));
  return [x, y, z];
}
const ringPts = (L, x, s = 1, from = 0, to = Math.PI * 2, n = N_RING) =>
  Array.from({ length: n + (to - from < Math.PI * 2 - 1e-6 ? 1 : 0) }, (_, i) => ringPoint(L, from + ((to - from) * i) / n, s, x));

const poly = (cam, pts) => pts.map((p) => cam.project(p)).map((p) => `${f(p[0])},${f(p[1])}`).join(" ");
const pathOf = (cam, pts) => "M" + poly(cam, pts).replace(/ /g, "L") + "Z";

let uid = 0;
const gid = () => `g${uid++}`;

/** Linear gradient along the face's vertical (v) or horizontal (u) axis, shading a pretend-domed surface. */
function faceGradient(cam, L, x, nx, axis, mat, pal, defs) {
  const id = gid();
  const A = axis === "v" ? [x, L.y0 + L.ry, 0] : [x, L.y0, -L.rz];
  const B = axis === "v" ? [x, L.y0 - L.ry, 0] : [x, L.y0, L.rz];
  const pa = cam.project(A), pb = cam.project(B);
  const stops = [];
  for (let i = 0; i <= 6; i++) {
    const v = 1 - (2 * i) / 6;
    const nl = axis === "v" ? [nx, v * 0.85, 0] : [nx, 0, -v * 0.85];
    const n = norm(cam.rot(norm(nl)));
    const col = mat === "metal" ? metal(n, pal) : mat === "leather" ? leather(n, pal) : darkPlastic(n);
    stops.push(`<stop offset="${i / 6}" stop-color="${col}"/>`);
  }
  defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f(pa[0])}" y1="${f(pa[1])}" x2="${f(pb[0])}" y2="${f(pb[1])}">${stops.join("")}</linearGradient>`);
  return id;
}

function glowLine(cam, pts, width, colour, out, close = false) {
  const d = (close ? "M" + poly(cam, pts).replace(/ /g, "L") + "Z" : "M" + poly(cam, pts).replace(/ /g, "L"));
  out.push(`<path d="${d}" fill="none" stroke="${colour}" stroke-width="${f(width * 4)}" stroke-opacity="0.18" stroke-linecap="round" stroke-linejoin="round"/>`);
  out.push(`<path d="${d}" fill="none" stroke="${colour}" stroke-width="${f(width * 1.8)}" stroke-opacity="0.45" stroke-linecap="round" stroke-linejoin="round"/>`);
  out.push(`<path d="${d}" fill="none" stroke="${colour}" stroke-width="${f(width)}" stroke-linecap="round" stroke-linejoin="round"/>`);
}

/**
 * One cylindrical disc layer of an earcup. `a` is its offset from the cup's centre along the outward axis,
 * which is what the exploded view animates.
 */
function drawLayer(cam, pal, L, defs) {
  const out = [];
  const side = L.side;
  const xc = side * (1 + L.a);
  const xo = xc + (side * L.th) / 2;
  const xi = xc - (side * L.th) / 2;
  const nOut = cam.rot([side, 0, 0]);
  const outerFront = nOut[2] > 0;
  const mat = L.mat;
  const sw = cam.S * 0.0035;
  const shade = (n) => (mat === "metal" ? metal(n, pal) : mat === "leather" ? leather(n, pal) : darkPlastic(n));

  // side wall
  const quads = [];
  for (let i = 0; i < N_RING; i++) {
    const t0 = (Math.PI * 2 * i) / N_RING, t1 = (Math.PI * 2 * (i + 1)) / N_RING, tm = (t0 + t1) / 2;
    const pm = ringPoint(L, tm, 1, 0);
    const nz = (sgn(pm[2]) * Math.pow(Math.abs(pm[2]) / L.rz, (L.n || SUPER_N) - 1)) / L.rz;
    const ny = (sgn(pm[1] - L.y0) * Math.pow(Math.abs(pm[1] - L.y0) / L.ry, (L.n || SUPER_N) - 1)) / L.ry;
    const nv = norm(cam.rot(norm([0, ny, nz])));
    if (nv[2] < -0.02) continue;
    const p = [ringPoint(L, t0, 1, xo), ringPoint(L, t1, 1, xo), ringPoint(L, t1, 1, xi), ringPoint(L, t0, 1, xi)];
    quads.push({ d: cam.rot(pm)[2], pts: p, col: shade(nv) });
  }
  quads.sort((a, b) => a.d - b.d);
  for (const q of quads) out.push(`<polygon points="${poly(cam, q.pts)}" fill="${q.col}" stroke="${q.col}" stroke-width="0.6" stroke-linejoin="round"/>`);

  // front face
  const fx = outerFront ? xo : xi;
  const nx = outerFront ? side : -side;
  const isOuter = outerFront;
  const facePts = ringPts(L, fx, 1);
  const gV = faceGradient(cam, L, fx, nx, "v", mat, pal, defs);
  const gU = faceGradient(cam, L, fx, nx, "u", mat, pal, defs);

  if (L.style === "cushion") {
    const hole = ringPts(L, fx, 0.56);
    const d = pathOf(cam, facePts) + pathOf(cam, hole.slice().reverse());
    out.push(`<path d="${d}" fill="url(#${gV})" fill-rule="evenodd"/>`);
    out.push(`<path d="${d}" fill="url(#${gU})" fill-rule="evenodd" opacity="0.5"/>`);
    // soft torus highlight + stitching
    out.push(`<polygon points="${poly(cam, ringPts(L, fx, 0.8))}" fill="none" stroke="${pal.cushion[2]}" stroke-opacity="0.22" stroke-width="${f(sw * 9)}"/>`);
    out.push(`<polygon points="${poly(cam, ringPts(L, fx, 0.9))}" fill="none" stroke="#e8d4ff" stroke-opacity="0.35" stroke-width="${f(sw * 0.9)}" stroke-dasharray="${f(sw * 4)} ${f(sw * 3)}"/>`);
    out.push(`<polygon points="${poly(cam, hole)}" fill="none" stroke="#000" stroke-opacity="0.5" stroke-width="${f(sw * 2)}"/>`);
    return out.join("");
  }

  out.push(`<polygon points="${poly(cam, facePts)}" fill="url(#${gV})"/>`);
  out.push(`<polygon points="${poly(cam, facePts)}" fill="url(#${gU})" opacity="0.5"/>`);

  if (L.style === "shell") {
    if (isOuter) {
      // bevel + brushed rings
      out.push(`<polygon points="${poly(cam, ringPts(L, fx, 0.93))}" fill="none" stroke="#fff" stroke-opacity="0.4" stroke-width="${f(sw)}"/>`);
      out.push(`<polygon points="${poly(cam, ringPts(L, fx, 0.9))}" fill="none" stroke="#000" stroke-opacity="0.35" stroke-width="${f(sw * 1.4)}"/>`);
      for (let s = 0.56; s < 0.88; s += 0.045) {
        out.push(`<polygon points="${poly(cam, ringPts(L, fx, s))}" fill="none" stroke="#fff" stroke-opacity="${f(0.035 + 0.05 * Math.abs(Math.sin(s * 40)))}" stroke-width="${f(sw * 0.8)}"/>`);
      }
      // recess for the dial
      const rec = ringPts({ ...L, ry: 0.34, rz: 0.34, n: 2 }, fx, 1);
      out.push(`<polygon points="${poly(cam, rec)}" fill="${pal.liner}" stroke="#000" stroke-opacity="0.6" stroke-width="${f(sw * 2)}"/>`);
      // signal arc: row of lime pips along the lower rim
      const arc = ringPts(L, fx, 0.78, rad(205), rad(335), 14);
      for (let i = 0; i < arc.length; i++) {
        const q = cam.project(arc[i]);
        out.push(`<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(sw * 5)}" fill="${LIME}" fill-opacity="0.2"/>`);
        out.push(`<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(sw * 1.9)}" fill="${LIME}"/>`);
      }
    } else {
      out.push(`<polygon points="${poly(cam, ringPts(L, fx, 0.7))}" fill="none" stroke="#000" stroke-opacity="0.5" stroke-width="${f(sw * 2)}"/>`);
    }
  } else if (L.style === "driver") {
    for (let s = 0.9; s > 0.15; s -= 0.11) {
      out.push(`<polygon points="${poly(cam, ringPts(L, fx, s))}" fill="none" stroke="#8d86c8" stroke-opacity="${f(0.1 + 0.25 * s)}" stroke-width="${f(sw * 1.1)}"/>`);
    }
    const capC = ringPts({ ...L, ry: 0.1, rz: 0.1, n: 2 }, fx, 1);
    out.push(`<polygon points="${poly(cam, capC)}" fill="${LIME}"/>`);
    glowLine(cam, capC, sw * 1.2, LIME, out, true);
  } else if (L.style === "frame") {
    out.push(`<polygon points="${poly(cam, ringPts(L, fx, 0.92))}" fill="none" stroke="#9aa2c9" stroke-opacity="0.35" stroke-width="${f(sw)}"/>`);
    const holes = [[0, 0.45, 0.12], [0.34, 0.12, 0.1], [-0.34, 0.12, 0.1], [0.22, -0.34, 0.1], [-0.22, -0.34, 0.1], [0, -0.05, 0.16]];
    for (const [u, v, r] of holes) {
      const hole = Array.from({ length: 20 }, (_, i) => {
        const t = (Math.PI * 2 * i) / 20;
        return [fx, L.y0 + L.ry * (v + r * Math.sin(t) * 1.1), L.rz * (u + r * Math.cos(t))];
      });
      out.push(`<polygon points="${poly(cam, hole)}" fill="#05040a" stroke="#9aa2c9" stroke-opacity="0.3" stroke-width="${f(sw * 0.8)}"/>`);
    }
  } else if (L.style === "dial") {
    // knurled collar
    for (let i = 0; i < 44; i++) {
      const t = (Math.PI * 2 * i) / 44;
      const a = ringPoint(L, t, 0.86, fx), b = ringPoint(L, t, 1, fx);
      const pa = cam.project(a), pb = cam.project(b);
      out.push(`<line x1="${f(pa[0])}" y1="${f(pa[1])}" x2="${f(pb[0])}" y2="${f(pb[1])}" stroke="#000" stroke-opacity="0.35" stroke-width="${f(sw * 1.1)}"/>`);
    }
    const led = ringPts(L, fx, 0.7);
    out.push(`<polygon points="${poly(cam, ringPts(L, fx, 0.74))}" fill="${pal.liner}"/>`);
    glowLine(cam, led, sw * 2.2, LIME, out, true);
    out.push(`<polygon points="${poly(cam, ringPts(L, fx, 0.5))}" fill="url(#${gV})" stroke="#000" stroke-opacity="0.4" stroke-width="${f(sw)}"/>`);
  } else if (L.style === "pill") {
    out.push(`<polygon points="${poly(cam, ringPts(L, fx, 0.75))}" fill="none" stroke="#000" stroke-opacity="0.35" stroke-width="${f(sw * 1.2)}"/>`);
  } else if (L.style === "hinge") {
    out.push(`<polygon points="${poly(cam, ringPts(L, fx, 0.6))}" fill="none" stroke="#000" stroke-opacity="0.4" stroke-width="${f(sw * 1.2)}"/>`);
  }
  out.push(`<polygon points="${poly(cam, facePts)}" fill="none" stroke="#fff" stroke-opacity="0.22" stroke-width="${f(sw * 0.9)}"/>`);
  return out.join("");
}

/** Layer stack for one earcup. Assembled offsets pack the cup; `spread` is where the exploded view sends each part. */
function cupLayers(side, e) {
  const S = (a, spread) => a + spread * e;
  return [
    { style: "cushion", mat: "leather", a: S(-0.3, -1.05), th: 0.26, ry: 0.84, rz: 0.66, y0: 0 },
    { style: "frame", mat: "dark", a: S(-0.13, -0.5), th: 0.05, ry: 0.74, rz: 0.56, y0: 0 },
    { style: "hinge", mat: "metal", a: S(-0.13, -0.5), th: 0.14, ry: 0.22, rz: 0.15, y0: 0.9, n: 3 },
    { style: "driver", mat: "dark", a: S(-0.02, 0.05), th: 0.16, ry: 0.6, rz: 0.46, y0: 0 },
    { style: "shell", mat: "metal", a: S(0.1, 0.78), th: 0.34, ry: 0.8, rz: 0.62, y0: 0 },
    { style: "dial", mat: "metal", a: S(0.31, 1.25), th: 0.1, ry: 0.27, rz: 0.27, y0: 0, n: 2 },
    { style: "pill", mat: "metal", a: S(0.26, 1.15), th: 0.07, ry: 0.13, rz: 0.045, y0: -0.56, n: 4 },
  ].map((L) => ({ ...L, side }));
}

/** Headband ribbons (metal outer strap + leather underside pad). */
function bandItems(cam, pal, e) {
  const M = 46;
  const arc = (phi, up) => {
    const c = Math.cos(phi), s = Math.sin(phi);
    const x = sgn(c) * Math.pow(Math.abs(c), 0.8) * 1.0;
    const y = 0.98 + 1.08 * Math.pow(Math.abs(s), 0.8) + up;
    const dir = norm([x, (y - up - 0.98) / 1.08, 0]);
    return { x, y, dir };
  };
  const items = [];
  const up = e * 0.75, padUp = e * 0.28;
  for (let i = 0; i < M; i++) {
    const p0 = (Math.PI * i) / M, p1 = (Math.PI * (i + 1)) / M;
    const pm = (p0 + p1) / 2;
    const wMetal = 0.21 * (0.7 + 0.3 * Math.sin(pm));
    const wPad = wMetal * 0.74;
    const build = (w, off, upv) => {
      const a = arc(p0, upv), b = arc(p1, upv);
      const A = (z) => [a.x + a.dir[0] * off, a.y + a.dir[1] * off, z];
      const B = (z) => [b.x + b.dir[0] * off, b.y + b.dir[1] * off, z];
      return [A(-w), B(-w), B(w), A(w)];
    };
    const dm = arc(pm, up).dir;
    const nOut = norm(cam.rot([dm[0], dm[1], 0]));
    const metalQuad = build(wMetal, 0, up);
    const padQuad = build(wPad, -0.12, padUp);
    const center = cam.project([arc(pm, up).x, arc(pm, up).y, 0]);
    const outerFacing = nOut[2] > 0;
    const mCol = metal(nOut, pal), pCol = leather(norm(cam.rot([-dm[0], -dm[1], 0])), pal);
    const mSvg = `<polygon points="${poly(cam, metalQuad)}" fill="${mCol}" stroke="${mCol}" stroke-width="0.7" stroke-linejoin="round"/>`;
    const edge = `<polygon points="${poly(cam, metalQuad)}" fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="${f(cam.S * 0.003)}"/>`;
    const pSvg = `<polygon points="${poly(cam, padQuad)}" fill="${pCol}" stroke="${pCol}" stroke-width="0.7" stroke-linejoin="round"/>`;
    items.push({ d: center[2], svg: outerFacing ? pSvg + mSvg + edge : mSvg + pSvg });
  }
  return items;
}

function renderScene({ yaw, pitch = 8, zoom = 1, k = 0, focus = [1, 0, 0], e = 0, size, palette = "silver", centre }) {
  uid = 0;
  const pal = PALETTES[palette];
  const cam = makeCamera({ yaw, pitch, zoom, k, focus, size, centre });
  const defs = [];
  const items = [...bandItems(cam, pal, e)];
  for (const side of [-1, 1]) {
    for (const L of cupLayers(side, e)) {
      const c = cam.rot([side * (1 + L.a), L.y0, 0]);
      items.push({ d: c[2] + (L.style === "hinge" ? 0.0005 : 0), svg: drawLayer(cam, pal, L, defs) });
    }
  }
  items.sort((a, b) => a.d - b.d);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs>${defs.join("")}</defs>${items.map((i) => i.svg).join("")}</svg>`;
}

/* ───────────────────────────── camera paths ───────────────────────────── */
/** Piecewise-linear keys → smooth function (box-blurred) so scrubbing never hits a dead stop. */
function curve(keys, blur = 0.045) {
  const R = 1200;
  let arr = Array.from({ length: R + 1 }, (_, i) => {
    const t = i / R;
    let j = 0;
    while (j < keys.length - 2 && t > keys[j + 1][0]) j++;
    const [t0, v0] = keys[j], [t1, v1] = keys[j + 1];
    return lerp(v0, v1, clamp((t - t0) / (t1 - t0 || 1)));
  });
  const w = Math.max(1, Math.round(blur * R));
  for (let pass = 0; pass < 3; pass++) {
    const next = arr.slice();
    for (let i = 0; i <= R; i++) {
      let s = 0, c = 0;
      for (let j = -w; j <= w; j++) {
        const idx = clamp(i + j, 0, R);
        s += arr[idx]; c++;
      }
      next[i] = s / c;
    }
    arr = next;
  }
  return (t) => {
    const x = clamp(t) * R, i = Math.floor(x);
    return lerp(arr[i], arr[Math.min(R, i + 1)], x - i);
  };
}

// Rotation story: 3/4 hero → full turn → zoom on the earcup → macro on the dial/LED → pull back to a mirrored hero pose.
const rotYaw = curve([[0, -35], [0.06, -31], [0.43, 235], [0.6, 255], [0.72, 282], [0.84, 300], [1, 395]]);
const rotZoom = curve([[0, 1], [0.4, 1], [0.52, 2.35], [0.64, 2.4], [0.74, 4.4], [0.8, 4.2], [0.9, 1.1], [1, 1]]);
const rotK = curve([[0, 0], [0.4, 0], [0.52, 1], [0.8, 1], [0.9, 0], [1, 0]]);
const rotPitch = curve([[0, 9], [0.45, 6], [0.74, 3], [1, 10]]);
const rotFocusY = curve([[0, 0], [0.62, 0], [0.74, -0.18], [0.84, -0.18], [1, 0]]);
const rotFocusX = curve([[0, 1], [0.62, 1.05], [0.74, 1.3], [0.84, 1.3], [1, 1]]);

const heroYaw = curve([[0, -62], [1, -35]], 0.02);
const finaleYaw = curve([[0, 170], [1, 395]], 0.05);
const explodeE = curve([[0, 0], [0.08, 0], [0.42, 1], [0.6, 1], [0.92, 0], [1, 0]], 0.03);
const explodeYaw = curve([[0, -34], [0.5, -42], [1, -34]], 0.1);

/* ───────────────────────────── output ───────────────────────────── */
const pad = (n, w = 4) => String(n).padStart(w, "0");

async function save(svg, file, { quality = 80 } = {}) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await sharp(Buffer.from(svg)).webp({ quality, alphaQuality: 92, effort: 3 }).toFile(file);
}

async function batch(jobs, label, conc = 4) {
  let done = 0;
  const t0 = Date.now();
  for (let i = 0; i < jobs.length; i += conc) {
    await Promise.all(jobs.slice(i, i + conc).map((j) => j()));
    done = Math.min(jobs.length, i + conc);
    process.stdout.write(`\r  ${label}: ${done}/${jobs.length}`);
  }
  process.stdout.write(`  (${((Date.now() - t0) / 1000).toFixed(1)}s)\n`);
}

async function sequence(name, count, size, frameFn, quality) {
  const dir = path.join(ROOT, name);
  await fs.rm(dir, { recursive: true, force: true });
  const jobs = Array.from({ length: count }, (_, i) => () => {
    const t = count === 1 ? 0 : i / (count - 1);
    return save(renderScene({ ...frameFn(t), size }), path.join(dir, `frame_${pad(i + 1)}.webp`), { quality });
  });
  await batch(jobs, `${name} ${size}px`);
}

const rotationFrame = (t) => ({
  yaw: rotYaw(t), pitch: rotPitch(t), zoom: rotZoom(t), k: rotK(t),
  focus: [rotFocusX(t), rotFocusY(t), 0.0],
});
const heroFrame = (t) => ({ yaw: heroYaw(t), pitch: 9, zoom: 1.0 });
const explodedFrame = (t) => ({ yaw: explodeYaw(t), pitch: 12, zoom: 0.64, e: explodeE(t), centre: [0, 0.9, 0] });
const finaleFrame = (t) => ({ yaw: finaleYaw(t), pitch: 9 + 3 * Math.sin(t * Math.PI), zoom: 1.0 });

const D = FAST ? 0.5 : 1; // resolution multiplier
const SET = {
  desktop: { size: Math.round(1200 * D), q: 78, hero: 36, rot: 96, exp: 60, fin: 40 },
  mobile: { size: Math.round(720 * D), q: 74, hero: 18, rot: 48, exp: 30, fin: 20 },
};

async function main() {
  console.log(FAST ? "Rendering (fast preview)…" : "Rendering full frame set…");
  for (const [tag, c] of Object.entries(SET)) {
    const suf = tag === "mobile" ? "-mobile" : "";
    if (want("hero")) await sequence(`hero${suf}`, c.hero, c.size, heroFrame, c.q);
    if (want("rotation")) await sequence(`rotation${suf}`, c.rot, c.size, rotationFrame, c.q);
    if (want("exploded")) await sequence(`exploded${suf}`, c.exp, c.size, explodedFrame, c.q);
    if (want("finale")) await sequence(`finale${suf}`, c.fin, c.size, finaleFrame, c.q);
  }

  const still = Math.round(1400 * D);
  if (want("colors")) {
    const colourJobs = ["silver", "black", "violet"].map((p) => () =>
      save(renderScene({ yaw: -36, pitch: 8, size: still, palette: p }), path.join(ROOT, "colors", `${p}.webp`), { quality: 84 }));
    await batch(colourJobs, "colors");
  }
  if (want("stills")) {
    const defs = {
      "sound": { yaw: -64, pitch: 5, zoom: 1.45, k: 0.55, focus: [1, 0.2, 0] },
      "anc": { yaw: -22, pitch: 8, zoom: 1.15, palette: "silver" },
      "comfort": { yaw: 58, pitch: 8, zoom: 2.3, k: 1, focus: [0.75, 0.15, 0] },
      "controls": { yaw: -72, pitch: 4, zoom: 3.1, k: 1, focus: [1.25, -0.12, 0] },
    };
    const jobs = Object.entries(defs).map(([n, d]) => () =>
      save(renderScene({ ...d, size: still }), path.join(ROOT, "features", `${n}.webp`), { quality: 84 }));
    await batch(jobs, "feature stills");
  }
  console.log("Done →", ROOT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
