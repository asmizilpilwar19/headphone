import { BRAND, SPECS } from "@/config/product";
import { HeadphoneIllustration } from "./HeadphoneIllustration";
import { Eyebrow, FadeUp, Illustrative } from "./reveal";

export function Specs() {
  return (
    <section id="specs" className="relative bg-[#0c0c14] px-5 py-24 md:px-10 md:py-32" aria-label="Product specifications">
      <div className="mx-auto grid max-w-[1500px] gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <Eyebrow className="text-lime">08 — Specifications</Eyebrow>
            <h2 className="display mt-3 text-[clamp(3rem,7vw,6.5rem)]">
              Tech
              <br />
              <span className="text-outline text-white/80">sheet</span>
            </h2>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Illustrative />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Edit in src/config/product.ts</span>
            </div>

            {/* technical drawing */}
            <div className="relative mt-10 aspect-[400/440] max-w-sm border border-white/15 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px] p-6">
              <HeadphoneIllustration className="h-full w-full opacity-90 [filter:grayscale(0.6)]" />
              <svg viewBox="0 0 400 440" className="pointer-events-none absolute inset-0 h-full w-full text-lime" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
                <path d="M16 40v330M10 40h12M10 370h12" />
                <path d="M40 410h320M40 404v12M360 404v12" />
                <path d="M385 150l-24 40M385 150h-14" strokeDasharray="3 3" />
                <g fill="currentColor" stroke="none" fontSize="10" fontFamily="var(--font-mono)">
                  <text x="26" y="210">H</text>
                  <text x="196" y="430">W</text>
                  <text x="346" y="140">D</text>
                </g>
              </svg>
              <p className="absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">{BRAND.model} / front elevation / not to scale</p>
            </div>
          </div>
        </div>

        <dl className="md:col-span-7">
          {SPECS.map((s, i) => (
            <FadeUp key={s.key} delay={i * 0.04} className="group grid grid-cols-[2.5rem_1fr] items-baseline gap-x-3 gap-y-1 border-t border-white/15 py-5 transition-colors hover:bg-white/[0.03] md:grid-cols-[3rem_14rem_1fr] md:py-6">
              <span className="font-mono text-[11px] text-white/35 transition-colors group-hover:text-lime">{String(i + 1).padStart(2, "0")}</span>
              <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">{s.label}</dt>
              <dd className="col-start-2 text-lg leading-snug md:col-start-3 md:text-xl">{s.value}</dd>
            </FadeUp>
          ))}
          <div className="border-t border-white/15 pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            {BRAND.name} {BRAND.model} is a fictional product. All figures are placeholders and will change before launch.
          </div>
        </dl>
      </div>
    </section>
  );
}
