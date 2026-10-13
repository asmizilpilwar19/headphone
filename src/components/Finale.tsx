"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { BRAND, SEQUENCES } from "@/config/product";
import { ScrollCanvas } from "./ScrollCanvas";
import { HeadphoneIllustration } from "./HeadphoneIllustration";
import { usePrefersReducedMotion } from "@/lib/hooks";

export function Finale() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(1);
  const progress = reduced ? still : p;
  const [scrolledIn, setInteractive] = useState(false);
  const interactive = reduced || scrolledIn;

  const bg = useTransform(p, [0, 0.5, 1], ["#1a2fd0", "#2d1a8f", "#3a0f5c"]);
  const headOpacity = useTransform(p, [0.25, 0.5], [reduced ? 1 : 0, 1]);
  const headY = useTransform(p, [0.25, 0.5], [reduced ? 0 : 60, 0]);
  const lineA = useTransform(p, [0.3, 0.55], [reduced ? 0 : 40, 0]);
  const lineB = useTransform(p, [0.38, 0.63], [reduced ? 0 : 40, 0]);
  const copyOpacity = useTransform(p, [0.6, 0.8], [reduced ? 1 : 0, 1]);
  const copyY = useTransform(p, [0.6, 0.8], [reduced ? 0 : 24, 0]);
  const scale = useTransform(p, [0, 1], [0.86, 1]);
  // keep the CTA unfocusable until it has faded in
  useMotionValueEvent(p, "change", (v) => setInteractive(v > 0.65));

  return (
    <section ref={ref} id="reveal" className={`relative ${reduced ? "" : "h-[380vh] md:h-[520vh]"}`}>
      <motion.div style={{ backgroundColor: bg }} className={`${reduced ? "relative h-svh" : "sticky top-0 h-svh"} grain overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_55%,rgba(138,77,255,0.45),transparent_70%),radial-gradient(60%_50%_at_10%_100%,rgba(58,15,92,0.9),transparent)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0c0c14] to-transparent" />

        <motion.div style={{ opacity: headOpacity, y: headY }} className="pointer-events-none absolute inset-x-0 top-[13svh] z-0 px-5 text-center md:top-[11svh]">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-lime">09 — {BRAND.model} / {BRAND.launch}</p>
          <h2 className="display mt-4 text-[clamp(2.7rem,9.4vw,10.5rem)]" aria-label="Your world. Your frequency.">
            <motion.span style={{ y: lineA }} className="block">Your world.</motion.span>
            <motion.span style={{ y: lineB }} className="block text-outline text-white">Your frequency.</motion.span>
          </h2>
        </motion.div>

        <motion.div style={{ scale }} className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="h-[min(80svh,130vw)] w-[min(80svh,130vw)] md:h-[min(92svh,70vw)] md:w-[min(92svh,70vw)]">
            <ScrollCanvas
              sequence={SEQUENCES.finale}
              progress={progress}
              label={`${BRAND.model} rotating into its final hero position`}
              fallback={<HeadphoneIllustration className="w-full" />}
              className="h-full w-full drop-shadow-[0_60px_70px_rgba(4,2,30,0.6)]"
            />
          </div>
        </motion.div>

        <motion.div style={{ opacity: copyOpacity, y: copyY }} className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-5 bg-gradient-to-t from-midnight/80 to-transparent px-5 pb-10 pt-16 text-center md:flex-row md:justify-between md:px-10 md:pb-12 md:text-left">
          <p className="max-w-md text-base text-white/85 md:text-lg">
            {BRAND.model}: chrome, leather and a single line of light. Three colourways, one frequency — yours.
          </p>
          <a
            href="#collection"
            tabIndex={interactive ? 0 : -1}
            aria-hidden={!interactive}
            className={`group inline-flex items-center gap-3 bg-lime px-7 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink transition-transform hover:-translate-y-0.5 ${interactive ? "" : "pointer-events-none"}`}
          >
            Explore the collection
            <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
