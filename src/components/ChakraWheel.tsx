"use client";

import { useEffect, useRef } from "react";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";
import Link from "next/link";
import { Post } from "@/lib/db";

export default function ChakraWheel({
  text = "० १ २ ३ ४ ५ ६ ७ ८ ९ • ",
  size = 120,
  posts,
}: {
  text?: string;
  size?: number;
  posts?: Post[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isHero = Boolean(posts && posts.length > 0);

  useEffect(() => {
    if (isHero) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    const radius = size / 2 - 16;
    const centerX = size / 2;
    const centerY = size / 2;

    const font = "600 11px Inter, sans-serif";
    ctx.font = font;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#8b5cf6";

    const fullText = text.repeat(2);

    ctx.save();
    ctx.translate(centerX, centerY);

    let currentAngle = 0;

    for (let i = 0; i < fullText.length; i++) {
      const char = fullText[i];

      const charPrep = prepareWithSegments(char, font);
      const charMeasure = layoutWithLines(charPrep, 1000, 16);
      const charWidth = charMeasure.lines.length > 0 ? charMeasure.lines[0].width : 0;

      const angleStep = (charWidth / (radius * Math.PI * 2)) * (Math.PI * 2);

      ctx.save();
      ctx.rotate(currentAngle + angleStep / 2 - Math.PI / 2);
      ctx.fillText(char, 0, -radius);
      ctx.restore();

      currentAngle += angleStep * 1.6;
    }

    ctx.restore();
  }, [text, size, isHero]);

  if (isHero && posts) {
    const angleStep = 360 / posts.length;
    const innerRadius = size * 0.22;
    const labelWidth = size / 2 - innerRadius - 24;
    const centerSize = Math.max(56, size * 0.14);

    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-accent/30 bg-accent/10 backdrop-blur-md shadow-[0_0_80px_rgba(139,92,246,0.15)]" />

        <div className="absolute inset-0 z-20 animate-[spin_50s_linear_infinite] hover:[animation-play-state:paused] group/wheel">
          {posts.map((post, i) => {
            const rotation = i * angleStep;
            return (
              <div
                key={post.id}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 origin-left flex items-center pointer-events-none"
                style={{
                  transform: `rotate(${rotation}deg) translateX(${innerRadius}px)`,
                  width: labelWidth,
                }}
              >
                <div
                  className="pointer-events-auto w-full"
                  style={{ transform: `rotate(-${rotation}deg)` }}
                >
                  <Link
                    href={`/post/${post.id}`}
                    className="group/link flex w-full min-h-[44px] items-center rounded-lg px-3 py-2 text-base sm:text-lg font-bold leading-snug text-foreground/95 bg-background/40 backdrop-blur-sm border border-white/10 shadow-sm transition-all hover:scale-[1.03] hover:border-primary/50 hover:bg-primary/15 hover:text-primary hover:shadow-md hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    title={post.title}
                  >
                    <span className="line-clamp-2 underline-offset-4 group-hover/link:underline">
                      {post.title}
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="absolute flex items-center justify-center rounded-full bg-gradient-to-tr from-primary to-accent shadow-xl shadow-accent/30 z-30 pointer-events-none"
          style={{ width: centerSize, height: centerSize }}
        >
          <svg
            className="text-white"
            style={{ width: centerSize * 0.5, height: centerSize * 0.5 }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M2 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 20v2M20 12h2" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center overflow-hidden" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-md" />
      <div className="absolute inset-0 transition-transform duration-1000 ease-in-out group-hover:animate-[spin_4s_linear_infinite] animate-[spin_20s_linear_infinite]">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          style={{ width: size, height: size }}
        />
      </div>
      <div className="absolute flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent shadow-lg shadow-accent/20 z-10">
        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M2 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 20v2M20 12h2" />
        </svg>
      </div>
    </div>
  );
}
