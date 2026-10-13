"use client";

import { useState } from "react";
import { ArrowRight, Camera, Check, Music2, Play } from "lucide-react";
import { BRAND, NAV } from "@/config/product";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!v) return setError("Enter your email address to get launch alerts.");
    if (!EMAIL_RE.test(v)) return setError("That doesn't look like an email address — try name@domain.com.");
    setError("");
    setDone(true);
  };

  if (done) {
    return (
      <div role="status" className="border border-lime/60 p-5">
        <p className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-tight">
          <Check size={20} className="text-lime" /> You&rsquo;re on the demo list
        </p>
        <p className="mt-2 text-sm text-white/65">
          This is a fictional launch site with no backend, so <strong className="font-semibold text-white">{email.trim()}</strong> was validated in your browser but not stored or sent anywhere.
        </p>
        <button className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-lime underline-offset-4 hover:underline" onClick={() => { setDone(false); setEmail(""); }}>
          Try another address
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Newsletter signup (demo)">
      <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/60">
        Launch alerts
      </label>
      <div className={`mt-2 flex border-b-2 transition-colors ${error ? "border-[#ff5a7a]" : "border-white/40 focus-within:border-lime"}`}>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@frequency.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
          aria-invalid={!!error}
          aria-describedby={error ? "email-error" : "email-hint"}
          className="min-w-0 flex-1 bg-transparent py-3 text-lg outline-none placeholder:text-white/30"
        />
        <button type="submit" className="flex items-center gap-2 px-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-lime hover:text-white" aria-label="Join the list">
          Join <ArrowRight size={16} />
        </button>
      </div>
      {error ? (
        <p id="email-error" role="alert" className="mt-2 text-sm text-[#ff7d97]">{error}</p>
      ) : (
        <p id="email-hint" className="mt-2 text-xs text-white/40">Demo form — validated in your browser, nothing is stored.</p>
      )}
    </form>
  );
}

export function Footer() {
  // Replace these with the real brand handles before launch.
  const social = [
    { label: "Instagram", href: "https://www.instagram.com/", Icon: Camera },
    { label: "YouTube", href: "https://www.youtube.com/", Icon: Play },
    { label: "TikTok", href: "https://www.tiktok.com/", Icon: Music2 },
  ];
  return (
    <footer id="join" className="relative overflow-hidden bg-ink px-5 pb-8 pt-20 md:px-10 md:pt-28">
      <div className="mx-auto grid max-w-[1500px] gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="display text-[clamp(2.4rem,5vw,4.4rem)]">Stay on<br />frequency.</p>
          <div className="mt-8 max-w-md"><Newsletter /></div>
        </div>
        <nav aria-label="Footer" className="md:col-span-3 md:col-start-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/40">Explore</p>
          <ul className="mt-4 space-y-2">
            {NAV.map((n) => (
              <li key={n.href}><a href={n.href} className="text-lg transition-colors hover:text-lime">{n.label}</a></li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/40">Contact</p>
          <address className="mt-4 space-y-1 text-lg not-italic">
            <a href={`mailto:${BRAND.contact}`} className="block transition-colors hover:text-lime">{BRAND.contact}</a>
            <span className="block text-white/60">{BRAND.location}</span>
          </address>
          <ul className="mt-6 flex gap-3">
            {social.map(({ label, href, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center border border-white/25 transition-colors hover:border-lime hover:bg-lime hover:text-ink">
                  <Icon size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="display pointer-events-none mt-16 select-none text-center text-[clamp(3rem,19.5vw,22rem)] leading-[0.8] text-outline text-white/15 md:mt-24" aria-hidden>
        {BRAND.name}
      </p>
      <div className="mx-auto mt-8 flex max-w-[1500px] flex-col justify-between gap-2 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 md:flex-row">
        <span>© {BRAND.name} — a fictional brand. {BRAND.model} does not exist.</span>
        <span>Specifications illustrative · Imagery procedurally rendered</span>
      </div>
    </footer>
  );
}
