export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-7 w-7">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#C084FC" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="28" height="28" rx="9" fill="url(#lg)" />
        <path d="M16 9v14M9 16h14" stroke="#D4A853" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
      <span>
        SafeFi<span className="text-gold">+</span>
      </span>
    </span>
  );
}
