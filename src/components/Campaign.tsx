"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { IMAGES } from "@/config/product";
import { FadeUp, MaskReveal, RevealText } from "./reveal";

const BOKEH = [
  ["8%", "12%", "22vmax", "rgba(35,64,255,0.55)"],
  ["72%", "6%", "18vmax", "rgba(138,77,255,0.45)"],
  ["90%", "44%", "26vmax", "rgba(35,64,255,0.4)"],
  ["30%", "58%", "20vmax", "rgba(255,79,163,0.28)"],
  ["62%", "82%", "24vmax", "rgba(138,77,255,0.45)"],
  ["4%", "88%", "16vmax", "rgba(198,255,46,0.16)"],
];

const WORDS = ["Live loud", "Move fast", "Stay signal", "After hours", "Night shift", "Feel everything"];

export function Campaign() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yA = useTransform(p, [0, 1], [90, -120]);
  const yB = useTransform(p, [0, 1], [-40, 90]);
  const yC = useTransform(p, [0, 1], [140, -60]);
  const xHead = useTransform(p, [0, 1], ["4%", "-8%"]);
  const rot = useTransform(p, [0, 1], [-4, 3]);

  return (
    <section ref={ref} id="campaign" className="relative overflow-hidden bg-[#12062a] py-24 md:py-36" aria-label="Lifestyle campaign">
      {/* night-street bokeh */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {BOKEH.map(([x, y, s, c], i) => (
          <span key={i} className={`absolute rounded-full blur-3xl ${i % 2 ? "anim-drift-a" : "anim-drift-b"}`} style={{ left: x, top: y, width: s, height: s, background: `radial-gradient(circle, ${c}, transparent 65%)` }} />
        ))}
      </div>

      <div className="relative mx-auto max-w-[1700px] px-5 md:px-10">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.26em] text-white/55">
          <span>07 — Campaign / After hours</span>
          <span>Issue 01 · Autumn drop</span>
        </div>

        <motion.h2 style={{ x: xHead }} className="display mt-6 text-[min(14vw,26svh)] leading-[0.84]" aria-label="Not just what you hear.">
          <span className="block text-outline text-white/90">Not just</span>
          <span className="ml-[4vw] block text-lime md:ml-[9vw]">what you</span>
          <span className="block bg-gradient-to-r from-chrome via-white to-violet bg-clip-text text-transparent">hear.</span>
        </motion.h2>

        {/* art-directed collage: three crops, three colour blocks, three speeds */}
        <div className="relative -mt-2 grid grid-cols-12 gap-x-3 gap-y-0 md:-mt-[4vw] md:gap-x-6">
          <motion.div style={{ y: yA }} className="relative z-10 col-span-8 md:col-span-5 md:col-start-1 md:row-span-2 md:row-start-1">
            <MaskReveal from="bottom">
              <figure className="relative aspect-[4/5] overflow-hidden bg-cobalt">
                <div className="halftone absolute inset-0 text-white/15 [mask-image:linear-gradient(to_bottom,transparent,#000)]" />
                <Image src={IMAGES.colors.silver} alt="Silver earcup cropped close" fill sizes="(min-width:768px) 30vw, 60vw" unoptimized className="scale-[2.3] object-cover object-[78%_50%]" />
                <figcaption className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white">Fig. 01 — Signal, up close</figcaption>
              </figure>
            </MaskReveal>
          </motion.div>

          <motion.div style={{ y: yB, rotate: rot }} className="col-span-6 col-start-7 -mt-10 md:col-span-3 md:col-start-7 md:row-start-1 md:mt-[14vw]">
            <MaskReveal from="right">
              <figure className="relative aspect-square overflow-hidden bg-chrome text-ink">
                <span className="display absolute left-3 top-2 text-[clamp(3rem,9vw,8rem)] leading-none">02:14</span>
                <Image src={IMAGES.colors.violet} alt="Violet headphones under night light" fill sizes="(min-width:768px) 22vw, 40vw" unoptimized className="translate-y-[22%] scale-[1.5] object-contain" />
                <figcaption className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-[0.22em]">Fig. 02 — Night shift</figcaption>
              </figure>
            </MaskReveal>
          </motion.div>

          <motion.div style={{ y: yC }} className="col-span-11 col-start-2 mt-10 md:col-span-4 md:col-start-9 md:row-start-2 md:-mt-[2vw]">
            <MaskReveal from="left">
              <figure className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-violet to-plum">
                <div className="halftone absolute inset-0 text-ink/40" />
                <Image src={IMAGES.colors.black} alt="Black headphones, headband crop" fill sizes="(min-width:768px) 30vw, 90vw" unoptimized className="-translate-y-[10%] scale-[1.9] object-cover object-[50%_10%]" />
                <figcaption className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white">Fig. 03 — Midnight, band</figcaption>
              </figure>
            </MaskReveal>
          </motion.div>
        </div>

        <div className="relative mt-24 grid items-end gap-8 md:mt-32 md:grid-cols-12">
          <RevealText text="It's how you experience everything." as="p" className="display text-[clamp(2rem,5.4vw,5rem)] md:col-span-8" />
          <FadeUp delay={0.2} className="max-w-xs text-sm text-white/65 md:col-span-3 md:col-start-10">
            Shot after dark, scored by the city. A campaign about the space between songs: platforms, night buses, the walk home. (Imagery is illustrative art direction, not photography.)
          </FadeUp>
        </div>
      </div>

      {/* running strip */}
      <div className="relative mt-20 -rotate-1 overflow-hidden border-y border-white/20 bg-ink py-4 md:mt-28" aria-hidden>
        <div className="anim-marquee flex w-max items-center whitespace-nowrap">
          {[...WORDS, ...WORDS, ...WORDS, ...WORDS].map((w, i) => (
            <span key={i} className="display flex items-center px-6 text-3xl md:text-5xl">
              <span className={i % 2 ? "text-outline" : ""}>{w}</span>
              <span className="ml-12 text-lime">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
