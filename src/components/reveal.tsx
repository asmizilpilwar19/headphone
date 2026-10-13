"use client";

import { motion, type HTMLMotionProps } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

const TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p };

/** Staggered word-by-word headline reveal (each word rises out of its own mask).
 *  The viewport trigger sits on the heading itself: observing the translated inner spans would be clipped by their own masks. */
export function RevealText({ text, className = "", delay = 0, as = "h2" }: { text: string; className?: string; delay?: number; as?: keyof typeof TAGS }) {
  const Tag = TAGS[as];
  const words = text.split(" ");
  return (
    <Tag
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden>
          <motion.span className="inline-block" variants={{ hidden: { y: "110%" }, show: { y: 0, transition: { duration: 0.9, ease } } }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

export function FadeUp({ children, delay = 0, className = "", ...rest }: { children: React.ReactNode; delay?: number; className?: string } & Omit<HTMLMotionProps<"div">, "children">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, ease, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Image that wipes in through a clip-path mask as it enters the viewport. */
export function MaskReveal({ children, className = "", from = "bottom" }: { children: React.ReactNode; className?: string; from?: "bottom" | "left" | "right" }) {
  const hidden = from === "bottom" ? "inset(100% 0% 0% 0%)" : from === "left" ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";
  return (
    <motion.div
      className={className}
      initial={{ clipPath: hidden }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.2, ease }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`font-mono text-[11px] uppercase tracking-[0.26em] ${className}`}>{children}</p>;
}

export function Illustrative({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 border border-current/30 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] opacity-70 ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> Illustrative figures
    </span>
  );
}
