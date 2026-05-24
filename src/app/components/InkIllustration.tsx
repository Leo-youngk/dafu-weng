export function InkIllustration({ width = 160, height = 110 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sky wash */}
      <rect width="160" height="110" fill="#F5F4EF" opacity="0" />

      {/* Far mountains — very pale */}
      <path d="M90 95 Q108 55 126 95Z"  fill="#C8D8C4" opacity="0.4" />
      <path d="M110 95 Q132 48 154 95Z" fill="#BED0BA" opacity="0.35" />
      <path d="M10  95 Q28  60 46  95Z" fill="#C8D8C4" opacity="0.3" />

      {/* Mid mountains */}
      <path d="M30 98 Q55 44 80 98Z"    fill="#A2BCA6" opacity="0.55" />
      <path d="M65 98 Q95 36 125 98Z"   fill="#94AF9A" opacity="0.5" />

      {/* Main foreground mountain */}
      <path d="M0 98 Q42 18 84 98Z"     fill="#7B9E87" opacity="0.75" />

      {/* Pine trees on peak */}
      <path d="M39 68 L42 54 L45 68Z" fill="#5C7A64" opacity="0.85" />
      <path d="M46 73 L49 61 L52 73Z" fill="#5C7A64" opacity="0.8" />
      <path d="M32 74 L34.5 64 L37 74Z" fill="#5C7A64" opacity="0.7" />

      {/* Mist layer */}
      <rect x="0" y="82" width="160" height="14" fill="white" opacity="0.3" />

      {/* Water / ground */}
      <rect x="0" y="96" width="160" height="14" fill="#EDF2EE" opacity="0.7" />

      {/* Water ripples */}
      <ellipse cx="30"  cy="103" rx="16" ry="2"   fill="#A2BCA6" opacity="0.28" />
      <ellipse cx="90"  cy="105" rx="22" ry="1.8" fill="#A2BCA6" opacity="0.22" />
      <ellipse cx="140" cy="102" rx="14" ry="1.5" fill="#A2BCA6" opacity="0.2"  />

      {/* Moon */}
      <circle cx="132" cy="22" r="11" fill="#EDE8D8" opacity="0.65" />
      <circle cx="132" cy="22" r="8.5" fill="#E8E2CE" opacity="0.5" />

      {/* Birds */}
      <path d="M96 38 Q99 35 102 38" stroke="#7B9E87" strokeWidth="1.2" fill="none" opacity="0.55" />
      <path d="M106 30 Q109 27 112 30" stroke="#7B9E87" strokeWidth="1" fill="none" opacity="0.45" />
      <path d="M118 42 Q120.5 40 123 42" stroke="#7B9E87" strokeWidth="1" fill="none" opacity="0.4" />

      {/* Small branch top-left */}
      <path d="M2 8 Q12 18 8 30" stroke="#A2BCA6" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M8 18 Q14 14 18 18" stroke="#A2BCA6" strokeWidth="1.2" fill="none" opacity="0.45" strokeLinecap="round" />
      <path d="M5 24 Q10 20 14 22" stroke="#A2BCA6" strokeWidth="1" fill="none" opacity="0.4" strokeLinecap="round" />
      {/* Leaf dots */}
      <circle cx="18" cy="18" r="2.5" fill="#94AF9A" opacity="0.5" />
      <circle cx="14" cy="22" r="2"   fill="#94AF9A" opacity="0.45" />
      <circle cx="8"  cy="30" r="2.2" fill="#94AF9A" opacity="0.4" />
    </svg>
  );
}
