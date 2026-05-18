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

  useEffect(() => {
    // Only run canvas drawing if we don't have posts (fallback mode)
    if (posts && posts.length > 0) return;

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
  }, [text, size, posts]);

  if (posts && posts.length > 0) {
    const angleStep = 360 / posts.length;
    const innerRadius = size * 0.15; 
    
    return (
      <div className="relative flex items-center justify-center overflow-hidden" style={{ width: size, height: size }}>
        {/* Background glow and rim */}
        <div className="absolute inset-0 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-md" />
        
        {/* Spinning Wrapper with pause on hover */}
        <div className="absolute inset-0 transition-transform duration-1000 ease-in-out animate-[spin_40s_linear_infinite] hover:[animation-play-state:paused] z-20">
          {posts.map((post, i) => {
            const rotation = i * angleStep;
            return (
              <div 
                key={post.id}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 origin-left flex items-center"
                style={{ 
                  transform: `rotate(${rotation}deg) translateX(${innerRadius}px)`,
                  width: (size / 2) - innerRadius - 16 
                }}
              >
                <Link
                  href={`/post/${post.id}`}
                  className="block w-full truncate text-sm sm:text-base font-semibold text-accent hover:text-primary transition-colors px-2 py-1"
                >
                  {post.title}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Central Chakra Icon */}
        <div className="absolute flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-accent shadow-lg shadow-accent/20 z-30 pointer-events-none">
          <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M2 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 20v2M20 12h2" />
          </svg>
        </div>
      </div>
    );
  }

  // Original Canvas fallback for small decorative wheels
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
