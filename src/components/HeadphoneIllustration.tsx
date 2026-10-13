/** Designed static stand-in used when a frame sequence can't be loaded. Pure SVG, no assets. */
export function HeadphoneIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 420" className={className} role="img" aria-label="Stylised KX-1 SIGNAL headphones (placeholder illustration)">
      <defs>
        <linearGradient id="hi-chrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f6ff" />
          <stop offset="0.35" stopColor="#8d96b8" />
          <stop offset="0.6" stopColor="#2a2f5a" />
          <stop offset="1" stopColor="#c9d0ee" />
        </linearGradient>
        <linearGradient id="hi-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6c74a6" />
          <stop offset="0.5" stopColor="#eef2ff" />
          <stop offset="1" stopColor="#6c74a6" />
        </linearGradient>
        <radialGradient id="hi-cushion" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#6a2aa8" />
          <stop offset="1" stopColor="#1a0a30" />
        </radialGradient>
      </defs>
      <path d="M72 238 C72 40 328 40 328 238" fill="none" stroke="url(#hi-band)" strokeWidth="26" strokeLinecap="round" />
      <path d="M92 232 C92 70 308 70 308 232" fill="none" stroke="#2b0f4d" strokeWidth="14" strokeLinecap="round" />
      {[72, 328].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="290" rx="52" ry="76" fill="url(#hi-cushion)" />
          <ellipse cx={x + (x < 200 ? -10 : 10)} cy="290" rx="44" ry="68" fill="url(#hi-chrome)" />
          <circle cx={x + (x < 200 ? -14 : 14)} cy="286" r="22" fill="#0b0914" stroke="#c6ff2e" strokeWidth="3" />
          <circle cx={x + (x < 200 ? -14 : 14)} cy="286" r="9" fill="url(#hi-chrome)" />
        </g>
      ))}
    </svg>
  );
}
