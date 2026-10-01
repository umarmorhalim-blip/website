/**
 * One still illustration per chapter, used by the reduced-motion and no-WebGL
 * story (brief §6–7). Inline SVG: no requests, crisp at any size, tiny.
 */
const P = "#A855F7";
const PL = "#C084FC";
const PD = "#7C3AED";
const G = "#D4A853";
const OK = "#4ADE80";

function Frame({ children, label, id }: { children: React.ReactNode; label: string; id: number }) {
  const glow = `glow-${id}`;
  return (
    <svg viewBox="0 0 320 240" role="img" aria-label={label} className="h-auto w-full">
      <defs>
        <radialGradient id={glow} cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor={PD} stopOpacity=".35" />
          <stop offset="1" stopColor={PD} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="240" rx="24" fill="#0F0A1F" />
      <rect width="320" height="240" rx="24" fill={`url(#${glow})`} />
      {children}
    </svg>
  );
}

const Phone = ({ x = 128, y = 40 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width="64" height="128" rx="12" fill="#1A1530" stroke={PL} strokeOpacity=".5" />
    <rect x="5" y="8" width="54" height="112" rx="8" fill="#140F27" />
    <text x="32" y="30" textAnchor="middle" fontSize="7" fill={PL}>RM 1,000</text>
    <text x="32" y="48" textAnchor="middle" fontSize="7" fill={G}>242.72 USDT</text>
    <rect x="12" y="92" width="40" height="14" rx="7" fill={PD} />
    <text x="32" y="102" textAnchor="middle" fontSize="6.5" fill="#fff">Confirm</text>
  </g>
);
const Packet = ({ x, y, c = P }: { x: number; y: number; c?: string }) => (
  <g>
    <circle cx={x} cy={y} r="12" fill={c} opacity=".25" />
    <circle cx={x} cy={y} r="6" fill={c} />
  </g>
);
const Cube = ({ x, y, s = 36, c = PD, o = 1 }: { x: number; y: number; s?: number; c?: string; o?: number }) => (
  <g opacity={o}>
    <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx="5" fill="#1A1530" stroke={c} strokeWidth="1.6" />
  </g>
);

export function StaticIllustration({ chapter }: { chapter: number }) {
  switch (chapter) {
    case 0:
      return (
        <Frame id={chapter} label="The route of a transfer: phone, verification gate, block, chain and wallet">
          <path d="M40 150 C 100 110, 140 170, 200 130 S 270 120, 290 120" stroke={PL} strokeOpacity=".5" strokeDasharray="4 6" fill="none" />
          <rect x="26" y="126" width="26" height="48" rx="6" fill="#1A1530" stroke={PL} />
          <circle cx="110" cy="138" r="18" fill="none" stroke={P} strokeWidth="3" />
          <Cube x={180} y={140} s={30} />
          <rect x="262" y="104" width="44" height="30" rx="5" fill="#1A1530" stroke={G} />
        </Frame>
      );
    case 1:
      return (
        <Frame id={chapter} label="The SafeFi+ app with the Confirm button sending out a transfer">
          <Phone />
          <Packet x={220} y={136} />
          <path d="M190 140 L208 137" stroke={P} strokeWidth="2" strokeDasharray="3 4" />
        </Frame>
      );
    case 2:
      return (
        <Frame id={chapter} label="The transfer passing through a verification ring that has turned green">
          <circle cx="160" cy="120" r="56" fill="none" stroke={OK} strokeWidth="6" />
          <Packet x={160} y={120} />
          <rect x="40" y="30" width="80" height="24" rx="12" fill="#0F2A1A" stroke={OK} />
          <text x="80" y="46" textAnchor="middle" fontSize="11" fill={OK}>eKYC ✓</text>
          <rect x="196" y="186" width="96" height="24" rx="12" fill="#0F2A1A" stroke={OK} />
          <text x="244" y="202" textAnchor="middle" fontSize="11" fill={OK}>Shariah ✓</text>
        </Frame>
      );
    case 3: {
      const slabs = ["Header", "Prev hash", "Timestamp", "Tx", "Your transfer", "Tx"];
      return (
        <Frame id={chapter} label="A block opened into its parts: header, previous hash, timestamp and transactions, with your transfer highlighted in gold">
          {slabs.map((s, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const gold = s === "Your transfer";
            return (
              <g key={i} transform={`translate(${46 + col * 120} ${40 + row * 58})`}>
                <rect width="108" height="40" rx="7" fill={gold ? "#2A2110" : "#1A1530"} stroke={gold ? G : PL} strokeWidth={gold ? 2 : 1} />
                <text x="54" y="25" textAnchor="middle" fontSize="11" fill={gold ? G : PL}>{s}</text>
              </g>
            );
          })}
        </Frame>
      );
    }
    case 4:
      return (
        <Frame id={chapter} label="Validator nodes around the block, each voting to accept it">
          <Cube x={160} y={120} s={44} />
          {Array.from({ length: 8 }, (_, k) => {
            const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
            const x = 160 + Math.cos(a) * 82;
            const y = 120 + Math.sin(a) * 82;
            return (
              <g key={k}>
                <line x1="160" y1="120" x2={x} y2={y} stroke={OK} strokeOpacity=".4" />
                <circle cx={x} cy={y} r="9" fill={OK} />
              </g>
            );
          })}
        </Frame>
      );
    case 5:
      return (
        <Frame id={chapter} label="The block locked onto the end of a chain of earlier blocks">
          {[0, 1, 2, 3, 4].map((k) => (
            <g key={k}>
              {k > 0 && <line x1={56 + (k - 1) * 52 + 18} y1="120" x2={56 + k * 52 - 18} y2="120" stroke={G} strokeWidth="3" />}
              <Cube x={56 + k * 52} y={120} s={34} c={k === 4 ? G : PD} o={0.55 + k * 0.11} />
            </g>
          ))}
          <circle cx="160" cy="120" r="5" fill={G} />
        </Frame>
      );
    default:
      return (
        <Frame id={chapter} label="The SafeFi+ wallet showing the transfer as settled">
          <rect x="70" y="58" width="180" height="120" rx="14" fill="#1A1530" stroke={G} strokeWidth="1.5" />
          <text x="88" y="86" fontSize="11" fill={PL}>SafeFi+ Wallet</text>
          <text x="88" y="128" fontSize="22" fontWeight="700" fill="#F5F3FF">242.72 USDT</text>
          <rect x="88" y="144" width="62" height="20" rx="10" fill="#0F2A1A" stroke={OK} />
          <text x="119" y="158" textAnchor="middle" fontSize="10" fill={OK}>Settled</text>
        </Frame>
      );
  }
}
