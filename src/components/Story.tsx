"use client";

import { useRef } from "react";
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react";
import { BEATS, BRAND, SEQUENCES } from "@/config/product";
import { ScrollCanvas } from "./ScrollCanvas";
import { MotionText } from "./MotionText";
import { HeadphoneIllustration } from "./HeadphoneIllustration";
import { useIsMobile, usePrefersReducedMotion } from "@/lib/hooks";

const fmtAngle = (v: number) => `${String(Math.round(((v * 360) % 360 + 360) % 360)).padStart(3, "0")}°`;
const fmtPct = (v: number) => `${String(Math.round(v * 100)).padStart(3, "0")}`;

function Beat({ p, i, n, beat }: { p: MotionValue<number>; i: number; n: number; beat: (typeof BEATS)[number] }) {
  const a = i / n, b = (i + 1) / n, e = 0.035;
  const first = i === 0, last = i === n - 1;
  const opacity = useTransform(p, [a, a + e, b - e, b], [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(p, [a, a + e * 1.6, b - e, b], [first ? 0 : 36, 0, 0, last ? 0 : -36]);
  const num = useTransform(p, [a, b], [18, -18]);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 bottom-0 px-5 pb-10 md:bottom-auto md:top-1/2 md:max-w-[34rem] md:-translate-y-1/2 md:px-10 md:pb-0 lg:px-16">
      <motion.span style={{ y: num }} className="display pointer-events-none absolute -top-24 right-4 text-[7rem] text-outline text-white/15 md:-top-40 md:right-[-12rem] md:text-[14rem]" aria-hidden>
        0{i + 1}
      </motion.span>
      <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-lime">{beat.tag}</p>
      <h2 className="display mt-3 text-[clamp(2.4rem,7.6vw,5.6rem)] md:mt-4">{beat.title}</h2>
      <p className="mt-4 max-w-sm text-base text-white/75 md:mt-6 md:text-lg">{beat.body}</p>
    </motion.div>
  );
}

export function Story() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(0.03);
  const progress = reduced ? still : p;

  // the stage colour travels with the story: cobalt → plum → near-black → violet → cobalt
  const bg = useTransform(p, [0, 0.2, 0.4, 0.6, 0.8, 1], ["#141056", "#1f35e6", "#3a0f5c", "#0b0620", "#2d1a8f", "#1a2fd0"]);
  const glow = useTransform(p, [0, 0.4, 0.7, 1], ["rgba(138,77,255,0.5)", "rgba(35,64,255,0.5)", "rgba(198,255,46,0.16)", "rgba(138,77,255,0.5)"]);
  const canvasX = useTransform(p, [0, 0.1], ["0vw", mobile ? "0vw" : "17vw"]);
  const bar = useTransform(p, [0, 1], ["0%", "100%"]);

  if (reduced) {
    return (
      <section id="story" className="relative bg-midnight px-5 py-24 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto h-[70svh] max-w-xl">
            <ScrollCanvas sequence={SEQUENCES.rotation} progress={progress} label={`${BRAND.model} three-quarter view`} fallback={<HeadphoneIllustration className="w-full" />} className="h-full w-full" />
          </div>
          <ol className="mt-16 grid gap-10 md:grid-cols-2">
            {BEATS.map((b) => (
              <li key={b.title}>
                <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-lime">{b.tag}</p>
                <h2 className="display mt-3 text-4xl">{b.title}</h2>
                <p className="mt-3 text-white/70">{b.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="story" className="relative h-[480vh] md:h-[750vh]">
      <motion.div style={{ backgroundColor: bg }} className="sticky top-0 grain h-svh overflow-hidden">
        <motion.div style={{ backgroundColor: glow }} className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#141056] to-transparent" />

        <motion.div style={{ x: canvasX }} className="absolute inset-0 flex items-center justify-center">
          <ScrollCanvas
            sequence={SEQUENCES.rotation}
            progress={progress}
            label={`${BRAND.model} rotating through a full 360° turn`}
            fallback={<HeadphoneIllustration className="w-full" />}
            className="h-[min(88svh,135vw)] w-[min(88svh,135vw)] md:h-[min(118svh,66vw)] md:w-[min(118svh,66vw)]"
          />
        </motion.div>

        {BEATS.map((b, i) => (
          <Beat key={b.title} p={p} i={i} n={BEATS.length} beat={b} />
        ))}

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-0 top-20 flex justify-between px-5 font-mono text-[10px] uppercase tracking-[0.24em] text-white/55 md:top-24 md:px-10">
          <span>{BRAND.model} / 360° view</span>
          <span className="hidden sm:block">
            Angle <MotionText value={p} format={fmtAngle} /> · Scrub <MotionText value={p} format={fmtPct} />/100
          </span>
        </div>
        <div className="absolute right-5 top-1/2 hidden h-48 w-px -translate-y-1/2 bg-white/20 md:right-10 md:block" aria-hidden>
          <motion.div style={{ height: bar }} className="w-px bg-lime" />
          {BEATS.map((_, i) => (
            <span key={i} className="absolute -left-[3px] h-[7px] w-[7px] rounded-full border border-white/50 bg-ink" style={{ top: `${(i / (BEATS.length - 1)) * 100}%`, transform: "translateY(-50%)" }} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
