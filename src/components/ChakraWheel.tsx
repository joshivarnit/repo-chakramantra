"use client";

const SPOKES = 24;

import { CHAKRA_TOPICS as NICHES } from "@/lib/constants";

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function ChakraSvg({
  size,
  hero,
}: {
  size: number;
  hero?: boolean;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 6;
  const innerR = outerR * 0.25;
  const textInnerR = outerR * 0.65;
  const textOuterR = outerR * 0.95;
  const labelMidR = (textInnerR + textOuterR) / 2;

  const spokeStep = 360 / SPOKES;
  const fontSize = hero ? Math.max(9, size * 0.015) : Math.max(7, size * 0.011);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
    >
      <defs>
        <radialGradient id="chakraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <circle cx={cx} cy={cy} r={outerR} fill="url(#chakraGlow)" />

      {/* Outer rims */}
      <circle
        cx={cx}
        cy={cy}
        r={outerR}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="text-primary/40"
      />
      <circle
        cx={cx}
        cy={cy}
        r={outerR - 4}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        className="text-primary/20"
      />

      {/* Inner hub outline */}
      <circle
        cx={cx}
        cy={cy}
        r={innerR}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="text-accent/40"
      />

      {/* Spokes */}
      {Array.from({ length: SPOKES }, (_, i) => {
        const startAngle = i * spokeStep;
        const outerPt = polarToCartesian(cx, cy, outerR - 4, startAngle);
        const innerPt = polarToCartesian(cx, cy, innerR, startAngle);

        return (
          <g key={`spoke-${i}`}>
            <line
              x1={innerPt.x}
              y1={innerPt.y}
              x2={outerPt.x}
              y2={outerPt.y}
              stroke="currentColor"
              strokeWidth={1.5}
              className="text-primary/30"
            />
          </g>
        );
      })}

      {/* Labels */}
      {NICHES.map((niche, i) => {
        const startAngle = i * spokeStep + 1;
        const endAngle = (i + 1) * spokeStep - 1;
        const pathId = `text-arc-${i}`;
        const arcPath = describeArc(cx, cy, labelMidR, startAngle, endAngle);

        const textEl = (
          <text
            fill="currentColor"
            className={hero ? "text-foreground/70 hover:text-primary transition-colors" : "text-foreground/70"}
            fontSize={fontSize}
            fontWeight={500}
            letterSpacing={1.2}
            fontFamily="var(--font-outfit), Outfit, sans-serif"
          >
            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
              {niche.toUpperCase()}
            </textPath>
          </text>
        );

        return (
          <g key={`niche-${i}`}>
            <path id={pathId} d={arcPath} fill="none" />
            {hero ? (
              <a href={`/articles?genre=${encodeURIComponent(niche)}`} className="cursor-pointer outline-none">
                {textEl}
              </a>
            ) : (
              textEl
            )}
          </g>
        );
      })}

      {/* Inner Hub details */}
      <circle cx={cx} cy={cy} r={innerR * 0.6} fill="url(#hubGrad)" className="opacity-80" />
      <circle cx={cx} cy={cy} r={innerR * 0.3} fill="currentColor" className="text-background" />
      <circle cx={cx} cy={cy} r={innerR * 0.1} fill="currentColor" className="text-primary" />
    </svg>
  );
}

export default function ChakraWheel({
  size = 120,
  isHero = false,
}: {
  size?: number;
  isHero?: boolean;
}) {
  if (isHero) {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-md shadow-[0_0_80px_rgba(139,92,246,0.12)]" />

        <div className="absolute inset-0 z-10 animate-[spin_120s_linear_infinite] hover:[animation-play-state:paused] [&_a]:pointer-events-auto">
          <ChakraSvg size={size} hero />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden group"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-md" />
      <div className="absolute inset-0 group-hover:animate-[spin_8s_linear_infinite] animate-[spin_40s_linear_infinite]">
        <ChakraSvg size={size} />
      </div>
    </div>
  );
}
