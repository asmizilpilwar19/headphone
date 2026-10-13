"use client";

import { useRef } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { ArrowDownRight } from "lucide-react";
import { BRAND, SEQUENCES } from "@/config/product";
import { ScrollCanvas } from "./ScrollCanvas";
import { HeadphoneIllustration } from "./HeadphoneIllustration";
import { useIsMobile, usePrefersReducedMotion } from "@/lib/hooks";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const mobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(0);
  const progress = reduced ? still : scrollYProgress;

  // as the user scrolls the product drifts to the centre of the frame, pushes in, and the type lifts away
  const x = useTransform(scrollYProgress, [0, 1], [mobile ? "0%" : "13%", "0%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, mobile ? 1.08 : 1.06]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const ghostX = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section ref={ref} id="top" className="relative h-[150vh] md:h-[170vh]">
      <div className="sticky top-0 grain h-svh overflow-hidden bg-[#0d0724]">
        {/* lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_100%,#4a1578_0%,transparent_55%),radial-gradient(90%_80%_at_95%_20%,#1c34ff_0%,transparent_60%)]" />
        <div className="anim-drift-a absolute -left-[10%] top-[8%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,rgba(138,77,255,0.45),transparent_62%)] blur-2xl" />
        <div className="anim-drift-b absolute -right-[12%] bottom-[-10%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(35,64,255,0.6),transparent_60%)] blur-2xl" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#141056] to-transparent" />

        {/* ghost type behind the product */}
        <motion.div style={{ y: textY, opacity: textOpacity, x: ghostX }} className="pointer-events-none absolute inset-x-0 top-[11svh] z-0 select-none px-4 md:top-[9svh] md:px-8">
          <h1 className="display text-[min(24vw,17svh)] leading-[0.82] md:text-[min(16vw,22svh)]" aria-label="Feel everything.">
            <span className="block text-outline text-white/80">Feel</span>
            <span className="block bg-gradient-to-b from-white via-chrome to-[#7b83b8] bg-clip-text text-transparent">Every</span>
            <span className="block text-outline text-white/80">thing.</span>
          </h1>
        </motion.div>

        {/* product */}
        <motion.div style={{ x, scale }} className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="anim-float h-[min(92svh,150vw)] w-[min(92svh,150vw)] md:h-[min(100svh,70vw)] md:w-[min(100svh,70vw)]">
            <ScrollCanvas
              sequence={SEQUENCES.hero}
              progress={progress}
              label={`${BRAND.model} headphones, floating`}
              fallback={<HeadphoneIllustration className="w-full" />}
              className="h-full w-full drop-shadow-[0_50px_60px_rgba(5,3,30,0.65)]"
            />
          </div>
        </motion.div>

        {/* foreground copy */}
        <motion.div style={{ y: textY, opacity: textOpacity }} className="absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-[1600px] flex-col justify-between gap-8 px-5 pb-10 md:flex-row md:items-end md:px-10 md:pb-14">
          <div className="max-w-md">
            <p className="text-xl font-light leading-snug text-white/90 md:text-2xl">{BRAND.tagline}</p>
            <a href="#story" className="group mt-6 inline-flex items-center gap-3 bg-lime px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink transition-transform hover:-translate-y-0.5">
              Discover the headphones
              <ArrowDownRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
          </div>
          <dl className="grid grid-cols-3 gap-x-6 gap-y-1 font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-white/60 md:text-right">
            <div><dt className="text-white/35">Model</dt><dd className="text-white">{BRAND.model}</dd></div>
            <div><dt className="text-white/35">Type</dt><dd>Over-ear wireless</dd></div>
            <div><dt className="text-white/35">Launch</dt><dd>{BRAND.launch}</dd></div>
          </dl>
        </motion.div>

        <motion.div style={{ opacity: cueOpacity }} className="absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex" aria-hidden>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/50">Scroll</span>
          <span className="relative block h-10 w-px overflow-hidden bg-white/20">
            <span className="anim-cue absolute inset-0 bg-lime" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
