"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionTemplate, useScroll, useTransform, type MotionValue } from "motion/react";
import { Battery, Zap } from "lucide-react";
import { BRAND, FEATURES, IMAGES } from "@/config/product";
import { Eyebrow, FadeUp, Illustrative, MaskReveal, RevealText } from "./reveal";
import { MotionText } from "./MotionText";

const Num = ({ n, className = "" }: { n: string; className?: string }) => (
  <span className={`display text-outline block text-[7rem] leading-none md:text-[11rem] ${className}`} aria-hidden>
    {n}
  </span>
);

/* 01 ─ Immersive sound ─────────────────────────────────────────── */
function Sound() {
  const bars = Array.from({ length: 28 });
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#1a2fd0] via-plum to-midnight px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1500px] items-center gap-10 md:grid-cols-12">
        <div className="relative z-10 md:col-span-5">
          <Num n="01" className="text-white/20" />
          <Eyebrow className="-mt-8 text-lime md:-mt-14">Immersive sound</Eyebrow>
          <RevealText text="A stage inside your head." className="display mt-4 text-[clamp(2.6rem,6vw,5.4rem)]" />
          <FadeUp delay={0.2} className="mt-6 max-w-md text-lg text-white/75">
            Dual-layer dynamic drivers and a tuned acoustic chamber give bass you can feel in your sternum and highs that stay clean at any volume. <span className="text-white/45">(Tuning claims illustrative.)</span>
          </FadeUp>
        </div>
        <div className="relative md:col-span-7">
          <div className="relative mx-auto aspect-square w-full max-w-[44rem]">
            {[0, 1.2, 2.4].map((d) => (
              <span key={d} className="anim-wave absolute left-[56%] top-[48%] h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime/60" style={{ animationDelay: `${d}s` }} />
            ))}
            <MaskReveal from="right" className="absolute inset-0">
              <Image src={IMAGES.features.sound} alt={`${BRAND.model} earcup in profile`} fill sizes="(min-width:768px) 44rem, 100vw" unoptimized className="object-contain drop-shadow-[0_40px_50px_rgba(0,0,10,0.5)]" />
            </MaskReveal>
          </div>
          <div className="absolute inset-x-0 -bottom-6 flex h-16 items-end justify-center gap-1 md:-bottom-10 md:h-24 md:gap-1.5" aria-hidden>
            {bars.map((_, i) => (
              <span key={i} className="anim-eq w-1.5 bg-gradient-to-t from-violet to-lime md:w-2" style={{ height: `${30 + ((i * 37) % 70)}%`, animationDelay: `${(i * 0.09) % 1.1}s`, animationDuration: `${0.9 + ((i * 13) % 7) / 10}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* 02 ─ Adaptive noise cancellation (scroll-linked chaos → calm) ─────────── */
const NOISE = ["TRAFFIC", "CROWDS", "ENGINES", "CHATTER", "SIRENS", "TRAINS", "ALARMS", "STATIC"];
const NOISE_ROWS = [
  ["bg-cobalt text-white", "text-lime"],
  ["bg-violet text-ink", "text-white"],
  ["bg-plum text-white", "text-violet"],
  ["bg-white text-cobalt", "text-ink"],
  ["bg-[#ff4fa3] text-ink", "text-white"],
  ["bg-cobalt text-white", "text-violet"],
  ["bg-plum text-white", "text-lime"],
];
const fmtDb = (v: number) => `${Math.round(v)} dB`;

function Anc() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const r = useTransform(p, [0.08, 0.72], [0, 100]);
  const mask = useMotionTemplate`radial-gradient(circle farthest-corner at 50% 50%, transparent ${r}%, #000 calc(${r}% + 14%))`;
  const db = useTransform(p, [0.08, 0.72], [92, 24]);
  const loud = useTransform(p, [0, 0.4, 0.5], [1, 1, 0]);
  const calm = useTransform(p, [0.45, 0.58], [0, 1]);
  const calmY = useTransform(p, [0.45, 0.58], [30, 0]);
  const scale = useTransform(p, [0, 0.75], [0.86, 1.04]);
  return (
    <div ref={ref} className="relative h-[280vh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-ink">
        {/* the calm: dark, still, product-first */}
        <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(138,77,255,0.35),transparent_65%)]" />

        <motion.div style={{ scale }} className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative h-[min(58svh,100vw)] w-[min(58svh,100vw)] md:h-[min(70svh,100vw)] md:w-[min(70svh,100vw)]">
            <Image src={IMAGES.features.anc} alt={`${BRAND.model} in the centre of a quiet space`} fill sizes="70vh" unoptimized className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]" />
          </div>
        </motion.div>

        {/* the noise: a loud colour field that the mask pushes outward */}
        <motion.div style={{ maskImage: mask, WebkitMaskImage: mask }} className="absolute inset-0 z-[5] flex flex-col" aria-hidden>
          {NOISE_ROWS.map(([bg, alt], i) => (
            <div key={i} className={`relative flex-1 overflow-hidden ${bg}`}>
              <div className={`anim-marquee absolute inset-y-0 flex w-max items-center whitespace-nowrap ${i % 2 ? "[animation-direction:reverse]" : ""}`} style={{ animationDuration: `${18 + i * 4}s` }}>
                {[...NOISE, ...NOISE, ...NOISE, ...NOISE].map((w, j) => (
                  <span key={j} className={`display px-6 text-[clamp(2.4rem,8.5vh,6rem)] ${j % 3 === 1 ? alt : ""} ${j % 4 === 2 ? "text-outline" : ""}`}>
                    {w}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink/80 to-transparent px-5 pb-10 pt-24 md:px-10">
          <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="relative h-[8.5rem] md:h-[11rem] md:w-[40rem]">
              <motion.div style={{ opacity: loud }} className="absolute inset-0">
                <Eyebrow className="text-lime">02 — Adaptive noise cancellation</Eyebrow>
                <h3 className="display mt-3 text-[clamp(2.6rem,7vw,6rem)]">Loud world.</h3>
              </motion.div>
              <motion.div style={{ opacity: calm, y: calmY }} className="absolute inset-0">
                <Eyebrow className="text-lime">02 — Adaptive noise cancellation</Eyebrow>
                <h3 className="display mt-3 text-[clamp(2.6rem,7vw,6rem)]">Calm head.</h3>
                <p className="mt-3 max-w-md text-white/70">Hybrid microphones sample your surroundings thousands of times a second and cancel them before they reach you.</p>
              </motion.div>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/60 md:text-right">
              Ambient level <br />
              <MotionText value={db} format={fmtDb} className="font-display text-5xl font-bold tracking-tight text-white md:text-6xl" />
              <br />
              <Illustrative className="mt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 03 ─ All-day comfort ─────────────────────────────────────────── */
function Comfort() {
  const stats = [
    ["268 g", "Weight (illustrative)"],
    ["3-layer", "Memory-foam cushion"],
    ["0 pressure", "Floating headband"],
  ];
  return (
    <div className="grain relative overflow-hidden bg-cobalt px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 md:grid-cols-12">
        <MaskReveal from="left" className="relative md:col-span-6">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[999px] bg-gradient-to-b from-[#0a1160] to-plum">
            <Image src={IMAGES.features.comfort} alt="Close-up of the stitched leather cushion" fill sizes="(min-width:768px) 40vw, 100vw" unoptimized className="scale-[1.25] object-cover object-[40%_55%]" />
            <span className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/70">Fig. 03 — cushion, stitched protein leather</span>
          </div>
        </MaskReveal>
        <div className="md:col-span-6 md:pl-10">
          <Num n="03" className="text-white/25" />
          <Eyebrow className="-mt-8 text-lime md:-mt-14">All-day comfort</Eyebrow>
          <RevealText text="Forget you're wearing them." className="display mt-4 text-[clamp(2.6rem,6vw,5.4rem)]" />
          <FadeUp delay={0.2} className="mt-6 max-w-md text-lg text-white/85">
            A floating spring-steel band spreads pressure across the crown. The cushions are shaped to the ear, not the other way round.
          </FadeUp>
          <dl className="mt-10 grid grid-cols-3 border-t border-white/30">
            {stats.map(([v, l], i) => (
              <FadeUp key={l} delay={0.1 * i} className="border-r border-white/30 py-4 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4">
                <dt className="font-display text-xl font-extrabold uppercase tracking-tight md:text-3xl">{v}</dt>
                <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">{l}</dd>
              </FadeUp>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

/* 04 ─ Seamless controls (interactive hotspots) ───────────────────────── */
const HOTSPOTS = [
  { id: "dial", x: 51, y: 40, title: "Signal dial", body: "Rotate for volume. Press to play or pause. Press and hold to cycle noise-cancelling modes." },
  { id: "button", x: 49, y: 82, title: "Power & pairing", body: "One press to power on, a long press to pair. It sits flush so you never find it by accident." },
  { id: "arc", x: 24, y: 78, title: "Signal arc", body: "Fourteen lime pips show battery and mode at a glance, then fade to black when you don't need them." },
];
function Controls() {
  const [active, setActive] = useState(HOTSPOTS[0].id);
  const current = HOTSPOTS.find((h) => h.id === active)!;
  return (
    <div className="relative overflow-hidden bg-[#10101a] px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1500px] items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Num n="04" className="text-white/15" />
          <Eyebrow className="-mt-8 text-lime md:-mt-14">Seamless controls</Eyebrow>
          <RevealText text="Everything under one thumb." className="display mt-4 text-[clamp(2.6rem,6vw,5.4rem)]" />
          <div className="mt-8" role="tablist" aria-label="Control details">
            {HOTSPOTS.map((h, i) => (
              <button
                key={h.id}
                role="tab"
                aria-selected={active === h.id}
                onClick={() => setActive(h.id)}
                onMouseEnter={() => setActive(h.id)}
                className={`flex w-full items-center gap-4 border-t border-white/15 py-4 text-left transition-colors ${active === h.id ? "text-white" : "text-white/45 hover:text-white/80"}`}
              >
                <span className="font-mono text-[11px] text-lime">0{i + 1}</span>
                <span className="font-display text-lg font-bold uppercase tracking-tight">{h.title}</span>
              </button>
            ))}
          </div>
          <div className="relative mt-4 min-h-24 border-t border-lime/60 pt-4">
            <AnimatePresence mode="wait">
              <motion.p key={current.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="max-w-sm text-white/75">
                {current.body}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <MaskReveal from="bottom" className="md:col-span-7">
          <div className="relative mx-auto aspect-square w-full max-w-[40rem] overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#2a2f9c,#0b0620_70%)]">
            <Image src={IMAGES.features.controls} alt="Close-up of the signal dial and button" fill sizes="(min-width:768px) 40rem, 100vw" unoptimized className="object-cover" />
            {HOTSPOTS.map((h) => (
              <button
                key={h.id}
                aria-label={h.title}
                onClick={() => setActive(h.id)}
                className="group absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center"
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
              >
                <span className={`absolute inset-0 rounded-full border border-lime ${active === h.id ? "anim-wave" : "opacity-0"}`} />
                <span className={`h-3 w-3 rounded-full border-2 border-ink transition-all ${active === h.id ? "scale-125 bg-lime" : "bg-white group-hover:bg-lime"}`} />
              </button>
            ))}
          </div>
        </MaskReveal>
      </div>
    </div>
  );
}

/* 05 ─ Long-lasting battery ────────────────────────────────────── */
function Seg({ i, fill, n }: { i: number; fill: MotionValue<number>; n: number }) {
  const o = useTransform(fill, (v) => (v >= ((i + 1) / n) * 100 ? 1 : 0.14));
  return <motion.span style={{ opacity: o }} className="h-5 bg-lime md:h-8" />;
}

function BatteryFeature() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start 85%", "center 45%"] });
  const fill = useTransform(p, [0, 1], [0, 100]);
  const gradient = useMotionTemplate`linear-gradient(to top, #c6ff2e ${fill}%, rgba(255,255,255,0.09) ${fill}%)`;
  const segs = Array.from({ length: 20 });
  return (
    <div ref={ref} className="relative overflow-hidden bg-ink px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex items-center justify-between">
          <Eyebrow className="text-lime">05 — Long-lasting battery</Eyebrow>
          <Illustrative />
        </div>
        <div className="relative mt-6 flex flex-col items-start gap-6 md:flex-row md:items-end md:gap-12">
          <motion.span style={{ backgroundImage: gradient, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }} className="display text-[clamp(10rem,34vw,34rem)] leading-[0.78]">
            {FEATURES.battery.hours}
          </motion.span>
          <div className="pb-4 md:max-w-sm">
            <p className="font-display text-3xl font-extrabold uppercase leading-none tracking-tight md:text-5xl">{FEATURES.battery.label}</p>
            <p className="mt-5 text-lg text-white/70">Play through a week of commutes on a single charge. When you do run low, a short top-up gets you moving again.</p>
            <p className="mt-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-lime">
              <Zap size={16} /> Fast charge: {FEATURES.battery.fastCharge}
            </p>
          </div>
        </div>
        <div className="mt-10 flex items-center gap-3" aria-hidden>
          <Battery size={22} className="shrink-0 text-lime" />
          <div className="grid flex-1 gap-1 md:gap-1.5" style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))" }}>
            {segs.map((_, i) => (
              <Seg key={i} i={i} fill={fill} n={segs.length} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" aria-label="Feature spotlights">
      <Sound />
      <Anc />
      <Comfort />
      <Controls />
      <BatteryFeature />
    </section>
  );
}
