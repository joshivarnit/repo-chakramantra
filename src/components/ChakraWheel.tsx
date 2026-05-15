"use client";

import { useEffect, useRef } from "react";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

export default function ChakraWheel({
  text = "CHAKRAMANTRA • DISCOVER • ",
  size = 120,
}: {
  text?: string;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI support for sharp canvas text rendering
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
    ctx.fillStyle = "#8b5cf6"; // var(--accent)

    // Ensure the text wraps around fully by repeating it
    const fullText = text.repeat(2);
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    let currentAngle = 0;
    
    // Using @chenglou/pretext to accurately measure and layout each character!
    // This allows us to properly calculate the exact arc step needed for precise typographic layout.
    for (let i = 0; i < fullText.length; i++) {
        const char = fullText[i];
        
        // Prepare and measure character using pretext
        const charPrep = prepareWithSegments(char, font);
        const charMeasure = layoutWithLines(charPrep, 1000, 16);
        const charWidth = charMeasure.lines.length > 0 ? charMeasure.lines[0].width : 0;
        
        // Convert the accurate linear width into an angular width based on the radius
        const angleStep = (charWidth / (radius * Math.PI * 2)) * (Math.PI * 2);
        
        ctx.save();
        // Rotate to the correct angle and offset by -90deg so it starts at the top
        ctx.rotate(currentAngle + angleStep / 2 - Math.PI / 2);
        ctx.fillText(char, 0, -radius);
        ctx.restore();
        
        // Advance the angle with a bit of tracking (letter-spacing)
        currentAngle += angleStep * 1.6;
    }
    
    ctx.restore();

  }, [text, size]);

  return (
    <div className="relative flex items-center justify-center overflow-hidden" style={{ width: size, height: size }}>
      {/* Background glow and rim */}
      <div className="absolute inset-0 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-md" />
      
      {/* 
        This wrapper holds the canvas and handles the spinning animation via Tailwind classes. 
        It spins fast on parent hover, slowly otherwise.
      */}
      <div className="absolute inset-0 transition-transform duration-1000 ease-in-out group-hover:animate-[spin_4s_linear_infinite] animate-[spin_20s_linear_infinite]">
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0"
          style={{ width: size, height: size }}
        />
      </div>

      {/* Central Chakra Icon */}
      <div className="absolute flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent shadow-lg shadow-accent/20 z-10">
        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M2 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 20v2M20 12h2" />
        </svg>
      </div>
    </div>
  );
}
