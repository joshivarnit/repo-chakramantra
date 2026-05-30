"use client";

import { Post } from "@/lib/db";

const SPOKES = 12;

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

function BlockArrow({ rotation }: { rotation: number }) {
  return (
    <g transform={`rotate(${rotation})`}>
      <path
        d="M -18 -8 L 8 -8 L 8 -14 L 22 0 L 8 14 L 8 8 L -18 8 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={0.5}
        className="text-primary/85"
      />
    </g>
  );
}

function ChakraSvg({
  size,
  posts,
  hero,
}: {
  size: number;
  posts?: Post[];
  hero?: boolean;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 6;
  const innerR = outerR * 0.38;
  const textInnerR = outerR * 0.58;
  const textOuterR = outerR * 0.93;
  const labelMidR = (textInnerR + textOuterR) / 2;

  const displayPosts = posts?.slice(0, SPOKES) ?? [];
  const spokeStep = 360 / SPOKES;
  const fontSize = hero ? Math.max(9, size * 0.017) : Math.max(7, size * 0.012);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
    >
      <defs>
        <radialGradient id="chakraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.18" />
          <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <circle cx={cx} cy={cy} r={outerR} fill="url(#chakraGlow)" />

      <circle
        cx={cx}
        cy={cy}
        r={outerR}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="text-accent/35"
      />

      <polygon
        points={Array.from({ length: SPOKES }, (_, i) => {
          const pt = polarToCartesian(cx, cy, innerR, i * spokeStep);
          return `${pt.x},${pt.y}`;
        }).join(" ")}
        fill="rgba(139, 92, 246, 0.07)"
        stroke="currentColor"
        strokeWidth={1}
        className="text-accent/30"
      />

      {Array.from({ length: SPOKES }, (_, i) => {
        const startAngle = i * spokeStep;
        const midAngle = startAngle + spokeStep / 2;
        const outerPt = polarToCartesian(cx, cy, outerR, startAngle);
        const innerPt = polarToCartesian(cx, cy, innerR, startAngle);

        const arrowR = innerR * 0.55;
        const arrowPos = polarToCartesian(cx, cy, arrowR, midAngle);

        return (
          <g key={`spoke-${i}`}>
            <line
              x1={cx}
              y1={cy}
              x2={outerPt.x}
              y2={outerPt.y}
              stroke="currentColor"
              strokeWidth={1}
              className="text-white/12"
            />
            <line
              x1={innerPt.x}
              y1={innerPt.y}
              x2={outerPt.x}
              y2={outerPt.y}
              stroke="currentColor"
              strokeWidth={0.75}
              className="text-white/8"
            />
            <g transform={`translate(${arrowPos.x}, ${arrowPos.y})`}>
              <BlockArrow rotation={midAngle} />
            </g>
          </g>
        );
      })}

      {displayPosts.map((post, i) => {
        const startAngle = i * spokeStep + 3;
        const endAngle = (i + 1) * spokeStep - 3;
        const pathId = `text-arc-${post.id}-${i}`;
        const arcPath = describeArc(cx, cy, labelMidR, startAngle, endAngle);
        const label = post.title.length > 32 ? `${post.title.slice(0, 30)}…` : post.title;

        const textEl = (
          <text
            fill="currentColor"
            className="text-foreground/90 hover:text-primary transition-colors"
            fontSize={fontSize}
            fontWeight={600}
            fontFamily="var(--font-outfit), Outfit, sans-serif"
          >
            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
              {label}
            </textPath>
          </text>
        );

        return (
          <g key={post.id}>
            <path id={pathId} d={arcPath} fill="none" />
            {hero ? (
              <a href={`/post/${post.id}`} title={post.title} className="cursor-pointer">
                {textEl}
              </a>
            ) : (
              textEl
            )}
          </g>
        );
      })}

      {!hero && (
        <>
          <circle cx={cx} cy={cy} r={outerR * 0.14} fill="url(#hubGrad)" />
          <circle cx={cx} cy={cy} r={outerR * 0.05} fill="white" fillOpacity={0.9} />
        </>
      )}
    </svg>
  );
}

export default function ChakraWheel({
  size = 120,
  posts,
}: {
  size?: number;
  posts?: Post[];
}) {
  const isHero = Boolean(posts && posts.length > 0);
  const outerR = size / 2 - 6;
  const hubSize = outerR * 0.28;

  if (isHero) {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-md shadow-[0_0_80px_rgba(139,92,246,0.12)]" />

        <div className="absolute inset-0 z-10 animate-[spin_120s_linear_infinite] hover:[animation-play-state:paused] [&_a]:pointer-events-auto">
          <ChakraSvg size={size} posts={posts!.slice(0, SPOKES)} hero />
        </div>

        <div
          className="absolute z-20 pointer-events-none rounded-full shadow-xl shadow-accent/30"
          style={{
            width: hubSize,
            height: hubSize,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="rounded-full bg-white/90"
              style={{ width: "35%", height: "35%" }}
            />
          </div>
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
