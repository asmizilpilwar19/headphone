"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";

/** Writes a motion value straight into the DOM so HUD read-outs never trigger React renders while scrolling. */
export function MotionText({ value, format, className }: { value: MotionValue<number>; format: (v: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const write = (v: number) => {
      if (ref.current) ref.current.textContent = format(v);
    };
    write(value.get());
    return value.on("change", write);
  }, [value, format]);
  return <span ref={ref} className={className} suppressHydrationWarning />;
}
