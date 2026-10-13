"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { BRAND, NAV } from "@/config/product";

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter] duration-500 ${solid ? "bg-ink/55 backdrop-blur-md" : "bg-transparent"}`}>
        <nav className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:h-20 md:px-10" aria-label="Primary">
          <a href="#top" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-[-0.03em]" onClick={() => setOpen(false)}>
            <span className="h-2.5 w-2.5 rounded-full bg-lime shadow-[0_0_14px_2px_rgba(198,255,46,0.7)]" />
            {BRAND.name}
          </a>
          <ul className="hidden items-center gap-9 md:flex">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="group relative font-mono text-[11px] uppercase tracking-[0.22em] text-white/75 transition-colors hover:text-white">
                  {n.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-lime transition-transform duration-500 group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <a href="#join" className="hidden border border-white/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors hover:border-lime hover:bg-lime hover:text-ink sm:block">
              Get launch alerts
            </a>
            <button className="grid h-10 w-10 place-items-center md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-center gap-2 bg-midnight px-6 md:hidden"
            initial={{ clipPath: "circle(0% at 92% 4%)" }}
            animate={{ clipPath: "circle(150% at 92% 4%)" }}
            exit={{ clipPath: "circle(0% at 92% 4%)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {[...NAV, { label: "Launch alerts", href: "#join" }].map((n, i) => (
              <motion.a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="display text-5xl"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                {n.label}
              </motion.a>
            ))}
            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
              {BRAND.model} · {BRAND.launch}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
