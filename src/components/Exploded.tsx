"use client";

import { useRef } from "react";
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react";
import { BRAND, COMPONENTS, SEQUENCES } from "@/config/product";
import { ScrollCanvas } from "./ScrollCanvas";
import { MotionText } from "./MotionText";
import { HeadphoneIllustration } from "./HeadphoneIllustration";
import { usePrefersReducedMotion } from "@/lib/hooks";

// The exploded frames open 8 → 42 %, hold to 60 %, and reassemble by 92 % (see scripts/generate-frames.mjs).
const explodeAmount = (v: number) => {
  const s = (a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
  const ease = (t: number) => t * t * (3 - 2 * t);
  return ease(s(0.08, 0.42)) - ease(s(0.6, 0.92));
};
const fmtOpen = (v: number) => `${String(Math.round(explodeAmount(v) * 100)).padStart(3, "0")}%`;

function Part({ p, i, n }: { p: MotionValue<number>; i: number; n: number }) {
  const a = 0.22 + (i / n) * 0.3;
  const opacity = useTransform(p, [a, a + 0.05, 0.64, 0.74], [0.25, 1, 1, 0.25]);
  const x = useTransform(p, [a, a + 0.05], [16, 0]);
  const bar = useTransform(p, [a, a + 0.05], ["0%", "100%"]);
  return (
    <motion.li style={{ opacity, x }} className="relative border-t border-white/15 py-3 pr-2 md:py-4">
      <motion.span style={{ width: bar }} className="absolute -top-px left-0 h-px bg-lime" />
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-[11px] text-lime">0{i + 1}</span>
        <div>
          <p className="font-display text-base font-bold uppercase tracking-tight md:text-xl">{COMPONENTS[i].name}</p>
          <p className="mt-0.5 hidden text-sm text-white/55 md:block">{COMPONENTS[i].note}</p>
        </div>
      </div>
    </motion.li>
  );
}

export function Exploded() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(0.5);
  const progress = reduced ? still : p;
  const titleOpacity = useTransform(p, [0, 0.06, 0.2, 0.3], [0, 1, 1, 0.18]);
  const titleY = useTransform(p, [0, 0.3], ["0%", "-8%"]);

  const stage = (
    <div className="absolute inset-0 flex items-center justify-center md:right-[18%] md:left-0">
      <ScrollCanvas
        sequence={SEQUENCES.exploded}
        progress={progress}
        label={`${BRAND.model} exploded view — components separate and reassemble`}
        fallback={<HeadphoneIllustration className="w-full" />}
        className="h-[min(82svh,125vw)] w-[min(82svh,125vw)] md:h-[min(104svh,64vw)] md:w-[min(104svh,64vw)]"
      />
    </div>
  );

  return (
    <section ref={ref} id="engineering" className={`relative ${reduced ? "" : "h-[420vh] md:h-[560vh]"}`}>
      <div className={`${reduced ? "relative h-svh" : "sticky top-0 h-svh"} overflow-hidden bg-ink`}>
        {/* blueprint grid */}
        <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(#8a93ff_1px,transparent_1px),linear-gradient(90deg,#8a93ff_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(70%_70%_at_50%_50%,#000,transparent)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#1a2fd0]/40 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cobalt/25 blur-[120px]" />

        {stage}

        <motion.div style={reduced ? undefined : { opacity: titleOpacity, y: titleY }} className="pointer-events-none absolute left-5 top-24 z-10 md:left-10 md:top-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-lime">Engineering / Exploded view</p>
          <h2 className="display mt-3 text-[clamp(2.8rem,9vw,8rem)]">
            Take sound
            <br />
            apart.
          </h2>
          <p className="mt-4 max-w-xs text-lg text-white/70">Every component has a reason to exist.</p>
        </motion.div>

        <div className="absolute inset-x-5 bottom-6 z-10 md:inset-x-auto md:bottom-auto md:right-10 md:top-1/2 md:w-[min(26rem,30vw)] md:-translate-y-1/2">
          <ul className="grid grid-cols-2 gap-x-5 md:block">
            {COMPONENTS.map((c, i) => (
              <Part key={c.name} p={progress} i={i} n={COMPONENTS.length} />
            ))}
          </ul>
        </div>

        <div className="pointer-events-none absolute bottom-6 left-5 hidden font-mono text-[10px] uppercase tracking-[0.24em] text-white/50 md:left-10 md:block">
          <span className="block">Separation</span>
          <MotionText value={progress} format={fmtOpen} className="font-display text-3xl font-bold tracking-tight text-white" />
        </div>
      </div>
    </section>
  );
}
