"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CHAKRA_TOPICS } from "@/lib/constants";
import "../app/scroll-wheel.css";

// Register ScrollTrigger once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ScrollWheelAnimation({ postIds = [] }: { postIds?: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const numSlices = CHAKRA_TOPICS.length;
  const radius = 225; // increased overall size from 400 to 500
  const center = 250; 
  const sliceAngle = 360 / numSlices;
  const textRadius = 205; 

  useGSAP(() => {
    // Prevent errors on empty refs
    if (!containerRef.current) return;
    
    // Create the timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "center center",
        end: "+=4000",
        pin: true,
        scrub: 1,
      }
    });

    // 1. Rotate the whole wheel counter-clockwise by 360 degrees
    tl.to(".scroll-wheel-svg", {
      rotation: -360,
      duration: 1,
      ease: "none"
    }, 0);

    // 2. Scroll the text container UP vertically
    // 12px margin-bottom per item + 15px top/bottom padding = total height approx
    // Using scrollHeight for exactness
    const textContainer = document.querySelector(".scroll-text-container") as HTMLElement;
    if (textContainer) {
      const scrollDistance = textContainer.scrollHeight - 350; 
      tl.to(".scroll-text-container", {
        y: -scrollDistance,
        duration: 1,
        ease: "none"
      }, 0);
    }

    // 3. Animate each slice popping out and its text fading in
    const step = 1 / numSlices;
    const isMobile = window.innerWidth <= 850;

    for (let i = 1; i <= numSlices; i++) {
      const triggerProgress = (i - 1) * step;
      const sliceDuration = step * 0.8;
      
      // A. Slice moves outwards
      tl.to(`.scroll-slice-${i}`, {
        x: 60,
        y: -60,
        opacity: 0,
        duration: sliceDuration,
        ease: "power2.inOut"
      }, triggerProgress);

      // B. Text fades in and slides into view
      tl.to(`.scroll-text-item-${i}`, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: sliceDuration,
        ease: "power2.out"
      }, triggerProgress);

      // C. Text fades out as it scrolls past
      tl.to(`.scroll-text-item-${i}`, {
        opacity: 0.2,
        duration: sliceDuration,
        ease: "power2.in"
      }, triggerProgress + sliceDuration + (step * 2));
    }
  }, { scope: containerRef });

  return (
    <section className="scroll-pin-section" ref={containerRef}>
      <div className="scroll-animation-container">
        
        {/* Text area for the topics */}
        <div className="scroll-text-container-wrapper">
          <div className="scroll-text-container">
            {CHAKRA_TOPICS.map((topic, i) => (
              <Link 
                href={`/articles?genre=${encodeURIComponent(topic)}`} 
                key={`text-${i}`} 
                className={`scroll-text-item scroll-text-item-${i + 1}`}
              >
                <span className="scroll-topic-num">{topic}</span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Wheel area */}
        <div className="scroll-wheel-wrapper">
          <svg className="scroll-wheel-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#39ff14" />
                <stop offset="100%" stopColor="#ff00ff" />
              </radialGradient>
            </defs>

            {/* Outer solid boundary */}
            <circle cx={center} cy={center} r={radius} className="scroll-wheel-bg" />
            
            {/* Dynamic Slices */}
            <g>
              {CHAKRA_TOPICS.map((topic, i) => {
                const endAngleRad = sliceAngle * (Math.PI / 180);
                const x1 = center; // 12 o'clock x
                const y1 = center - radius; // 12 o'clock y
                const x2 = center + radius * Math.sin(endAngleRad);
                const y2 = center - radius * Math.cos(endAngleRad);
                
                const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
                
                const midAngleRad = (sliceAngle / 2) * (Math.PI / 180);
                const tx = center + textRadius * Math.sin(midAngleRad);
                const ty = center - textRadius * Math.cos(midAngleRad);
                
                // SVG rotation transformation for each slice
                const rotation = i * sliceAngle;

                return (
                  <g key={`slice-${i}`} transform={`rotate(${rotation} ${center} ${center})`}>
                    <g 
                      onClick={() => router.push(`/articles?genre=${encodeURIComponent(topic)}`)} 
                      className="scroll-slice-group"
                      style={{ cursor: 'pointer' }}
                    >
                      <g className={`scroll-slice-${i + 1}`}>
                        <path d={pathData} className="scroll-slice-bg" />
                        <text
                          x={tx}
                          y={ty}
                          transform={`rotate(${sliceAngle / 2} ${tx} ${ty})`}
                          fill="#39ff14"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="6.5"
                          fontWeight="500"
                          letterSpacing="0.5"
                          style={{ fontFamily: 'var(--font-outfit), Outfit, sans-serif' }}
                        >
                          {topic}
                        </text>
                      </g>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Static Inner Hub Button (separated to prevent rotation) */}
          <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <radialGradient id="hubGradOverlay" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#39ff14" />
                <stop offset="100%" stopColor="#ff00ff" />
              </radialGradient>
            </defs>
            <g 
              onClick={() => {
                if (postIds.length > 0) {
                  const randomId = postIds[Math.floor(Math.random() * postIds.length)];
                  router.push(`/post/${randomId}`);
                } else {
                  router.push('/articles');
                }
              }} 
              style={{ cursor: 'pointer', pointerEvents: 'auto' }} 
              className="wheel-center-button"
            >
              <circle cx={center} cy={center} r="65" fill="hsl(var(--background))" stroke="#39ff14" strokeWidth="2" />
              <circle cx={center} cy={center} r="55" fill="url(#hubGradOverlay)" opacity="0.8" />
              <text x={center} y={center - 8} fill="#fff" textAnchor="middle" fontSize="14" fontWeight="bold">Random</text>
              <text x={center} y={center + 12} fill="#fff" textAnchor="middle" fontSize="14" fontWeight="bold">Articles</text>
            </g>
          </svg>
        </div>

      </div>

      {/* APK Download Card */}
      <div className="absolute bottom-12 right-12 glass p-6 rounded-2xl border border-white/10 z-30 flex flex-col items-center bg-background/80 backdrop-blur-md shadow-2xl">
        <div className="text-2xl font-bold text-primary mb-2 font-heading">CMchess App</div>
        <p className="text-sm text-foreground/80 mb-6 text-center max-w-[220px]">
          Download our new mobile app for the full Chakramantra experience on the go.
        </p>
        <a 
          href="/CMchess.apk" 
          download 
          className="bg-primary hover:bg-primary/80 text-primary-foreground font-semibold py-2.5 px-6 rounded-full transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Download APK
        </a>
      </div>

    </section>
  );
}
