"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MotionValue } from "motion/react";
import type { SequenceConfig } from "@/config/product";
import { FrameSequence, type SequenceStatus } from "@/lib/frame-sequence";
import { useIsMobile } from "@/lib/hooks";

type Props = {
  sequence: SequenceConfig;
  /** 0 → 1. Scroll-linked in the story sections; a constant for the reduced-motion still. */
  progress: MotionValue<number>;
  className?: string;
  /** Shown when no frame can be loaded at all. */
  fallback: ReactNode;
  /** Scale of the drawn frame inside the canvas (1 = contain). */
  scale?: number;
  label: string;
};

/**
 * Scroll-driven image sequence on <canvas>.
 * - progress → frame index → nearest loaded frame (missing / not-yet-loaded frames never blank the view)
 * - the playhead is eased toward the scroll target, so a flick of the wheel still lands on every
 *   intermediate frame instead of jumping, and scrolling backwards reverses naturally
 * - DPR-aware sizing via ResizeObserver; everything is torn down on unmount
 */
export function ScrollCanvas({ sequence, progress, className = "", fallback, scale = 1, label }: Props) {
  const mobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<SequenceStatus>("loading");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const seq = new FrameSequence(sequence, mobile);
    let current = progress.get();
    let target = current;
    let raf = 0;
    let lastIndex = -1;
    let lastW = 0;
    let lastH = 0;

    const draw = (force = false) => {
      const index = Math.round(Math.min(1, Math.max(0, current)) * (seq.count - 1));
      seq.request(index);
      const img = seq.nearest(index);
      if (!img) return;
      const key = img.src;
      if (!force && index === lastIndex && key === (canvas.dataset.src ?? "") && lastW === canvas.width && lastH === canvas.height) return;
      lastIndex = index;
      lastW = canvas.width;
      lastH = canvas.height;
      canvas.dataset.src = key;
      const cw = canvas.width, ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      const s = Math.min(cw / img.naturalWidth, ch / img.naturalHeight) * scale;
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const tick = () => {
      const d = target - current;
      current = Math.abs(d) < 0.0006 ? target : current + d * 0.22;
      draw();
      raf = current !== target ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      const r = { width: canvas.clientWidth, height: canvas.clientHeight };
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        draw(true);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const offProgress = progress.on("change", (v) => {
      target = v;
      kick();
    });
    const offSeq = seq.subscribe(() => {
      setStatus(seq.status);
      setPct(Math.round(seq.progress * 100));
      draw(true);
    });
    seq.start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      offProgress();
      offSeq();
      seq.dispose();
    };
  }, [sequence, mobile, progress, scale]);

  return (
    <div className={`relative ${className}`} data-sequence={sequence.id} data-status={status}>
      <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${status === "ready" ? "opacity-100" : "opacity-0"}`} aria-label={label} role="img" />
      {status === "missing" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-[min(70%,420px)] opacity-90">{fallback}</div>
          <p className="max-w-xs px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
            Placeholder render — add frames at {mobile ? sequence.mobileDir : sequence.dir}
          </p>
        </div>
      )}
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-px w-32 overflow-hidden bg-white/15">
            <div className="h-full origin-left animate-pulse bg-lime" style={{ width: "40%" }} />
          </div>
        </div>
      )}
      {status === "ready" && pct < 100 && (
        <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Loading frames {pct}%</span>
      )}
    </div>
  );
}
