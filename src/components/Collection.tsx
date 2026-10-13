"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { COLORWAYS, BRAND } from "@/config/product";
import { Eyebrow, FadeUp } from "./reveal";

const SWATCH: Record<string, string> = {
  silver: "conic-gradient(from 210deg, #f4f6ff, #8d96b8, #2a3fd0, #dfe5ff, #f4f6ff)",
  black: "conic-gradient(from 210deg, #3b3f55, #07060b, #1a1530, #6a6f8a, #3b3f55)",
  violet: "conic-gradient(from 210deg, #e1d2ff, #8a4dff, #2a0b66, #b48cff, #e1d2ff)",
};

export function Collection() {
  const [id, setId] = useState<(typeof COLORWAYS)[number]["id"]>("silver");
  const cw = COLORWAYS.find((c) => c.id === id)!;
  const idx = COLORWAYS.findIndex((c) => c.id === id);

  return (
    <section id="collection" className="relative min-h-svh overflow-hidden px-5 py-24 md:px-10 md:py-28" aria-label="Colour collection">
      {/* colour fields cross-fade as the selection changes */}
      <motion.div className="absolute inset-0" animate={{ backgroundColor: cw.bg }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
      <motion.div className="absolute inset-0 [mask-image:linear-gradient(to_top,#000,transparent_70%)]" animate={{ backgroundColor: cw.bg2 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
      <div className="grain absolute inset-0" />

      <motion.div className="relative mx-auto flex min-h-[calc(100svh-12rem)] max-w-[1500px] flex-col" animate={{ color: cw.fg }} transition={{ duration: 0.6 }}>
        <div className="flex items-start justify-between">
          <div>
            <Eyebrow>06 — The colour collection</Eyebrow>
            <h2 className="display mt-3 text-[clamp(2.2rem,5vw,4.4rem)]">Pick your signal.</h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] opacity-70">
            0{idx + 1} / 0{COLORWAYS.length}
          </p>
        </div>

        {/* oversized colourway name behind the product */}
        <div className="pointer-events-none absolute inset-x-0 top-[26%] flex justify-center overflow-hidden md:top-[20%]" aria-hidden>
          <AnimatePresence mode="wait">
            <motion.span
              key={cw.id}
              initial={{ y: "60%", opacity: 0 }}
              animate={{ y: 0, opacity: 0.9 }}
              exit={{ y: "-40%", opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="display text-outline whitespace-nowrap text-[clamp(4rem,19vw,19rem)]"
            >
              {cw.name.split(" ")[1]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* product: all three stay mounted so switching never waits on a download */}
        <div className="relative mx-auto my-6 aspect-square w-full max-w-[min(72svh,46rem)] flex-1 md:my-0">
          {COLORWAYS.map((c, i) => (
            <motion.div
              key={c.id}
              className="absolute inset-0"
              initial={false}
              animate={c.id === id ? { opacity: 1, x: 0, rotate: 0, scale: 1 } : { opacity: 0, x: i < idx ? -80 : 80, rotate: i < idx ? -8 : 8, scale: 0.88 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden={c.id !== id}
            >
              <Image src={c.image} alt={`${BRAND.model} in ${c.name}`} fill sizes="(min-width:768px) 40rem, 90vw" unoptimized className="object-contain drop-shadow-[0_50px_50px_rgba(0,0,20,0.45)]" />
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div role="radiogroup" aria-label="Colourway" className="flex items-center gap-4">
            {COLORWAYS.map((c) => (
              <button
                key={c.id}
                role="radio"
                aria-checked={c.id === id}
                aria-label={c.name}
                onClick={() => setId(c.id)}
                className={`relative h-14 w-14 rounded-full border-2 transition-transform duration-300 hover:scale-110 ${c.id === id ? "border-current" : "border-transparent"}`}
              >
                <span className="absolute inset-1 rounded-full shadow-[inset_0_-6px_10px_rgba(0,0,0,0.35)]" style={{ background: SWATCH[c.id] }} />
              </button>
            ))}
          </div>
          <div className="md:text-right" aria-live="polite">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] opacity-70">Selected</p>
            <AnimatePresence mode="wait">
              <motion.p key={cw.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }} className="display text-4xl md:text-6xl">
                {cw.name}
              </motion.p>
            </AnimatePresence>
            <FadeUp className="mt-1 text-sm opacity-80">{cw.note}</FadeUp>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
