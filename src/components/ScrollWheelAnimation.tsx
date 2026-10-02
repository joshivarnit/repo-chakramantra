"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CHAKRA_TOPICS } from "@/lib/constants";
import "../app/scroll-wheel.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ScrollWheelAnimation({ postIds = [] }: { postIds?: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const numSlices = CHAKRA_TOPICS.length;
  const radius = 225;
  const center = 250; 
  const sliceAngle = 360 / numSlices;
  const textRadius = 205; 

  useGSAP(() => {
    if (!containerRef.current) return;
    
    const isMobile = window.innerWidth < 850;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "center center",
        end: isMobile ? "+=1400" : "+=3500",
        pin: true,
        scrub: 1,
      }
    });

    // 1. Rotate the whole wheel counter-clockwise
    tl.to(".scroll-wheel-svg, .chakra-ring-overlay", {
      rotation: -360,
      duration: 1,
      ease: "none"
    }, 0);

    // 2. Scroll the topic container UP
    const textContainer = document.querySelector(".scroll-text-container") as HTMLElement;
    if (textContainer) {
      const scrollDistance = isMobile ? textContainer.scrollHeight - 180 : textContainer.scrollHeight - 350; 
      tl.to(".scroll-text-container", {
        y: -Math.max(0, scrollDistance),
        duration: 1,
        ease: "none"
      }, 0);
    }

    // 3. Animate each slice
    const step = 1 / numSlices;
    const moveOffset = isMobile ? 30 : 60;

    for (let i = 1; i <= numSlices; i++) {
      const triggerProgress = (i - 1) * step;
      const sliceDuration = step * 0.8;
      
      tl.to(`.scroll-slice-${i}`, {
        x: moveOffset,
        y: -moveOffset,
        opacity: 0,
        duration: sliceDuration,
        ease: "power2.inOut"
      }, triggerProgress);

      tl.to(`.scroll-text-item-${i}`, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: sliceDuration,
        ease: "power2.out"
      }, triggerProgress);

      tl.to(`.scroll-text-item-${i}`, {
        opacity: 0.3,
        duration: sliceDuration,
        ease: "power2.in"
      }, triggerProgress + sliceDuration + (step * 2));
    }
  }, { scope: containerRef });

  return (
    <section className="scroll-pin-section" ref={containerRef}>
      <div className="scroll-animation-container">
        
        {/* Topic selector */}
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
        
        {/* 3D Realistic Chakra Wheel Area */}
        <div className="scroll-wheel-wrapper">
          {/* Glowing 3D background image */}
          <div className="absolute inset-0 rounded-full opacity-40 mix-blend-screen pointer-events-none overflow-hidden scale-110">
            <Image
              src="/chakra-3d-ring.jpg"
              alt="3D Chakra Energy Ring"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-cover rounded-full chakra-ring-overlay"
              priority
            />
          </div>

          <svg className="scroll-wheel-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
              </radialGradient>
            </defs>

            <circle cx={center} cy={center} r={radius} className="scroll-wheel-bg" />
            
            <g>
              {CHAKRA_TOPICS.map((topic, i) => {
                const endAngleRad = sliceAngle * (Math.PI / 180);
                const x1 = center; 
                const y1 = center - radius; 
                const x2 = center + radius * Math.sin(endAngleRad);
                const y2 = center - radius * Math.cos(endAngleRad);
                
                const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
                
                const midAngleRad = (sliceAngle / 2) * (Math.PI / 180);
                const tx = center + textRadius * Math.sin(midAngleRad);
                const ty = center - textRadius * Math.cos(midAngleRad);
                
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
                          fill="#f8fafc"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="6.5"
                          fontWeight="700"
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

          {/* Center Random Article Hub */}
          <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <radialGradient id="hubGradOverlay" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
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
              <circle cx={center} cy={center} r="65" fill="#08080c" stroke="#a855f7" strokeWidth="2.5" />
              <circle cx={center} cy={center} r="55" fill="url(#hubGradOverlay)" opacity="0.85" />
              <text x={center} y={center - 8} fill="#fff" textAnchor="middle" fontSize="14" fontWeight="800">Explore</text>
              <text x={center} y={center + 12} fill="#fff" textAnchor="middle" fontSize="14" fontWeight="800">Random</text>
            </g>
          </svg>
        </div>

      </div>

      {/* Desktop ChakraChess Preview Card */}
      <Link
        href="/chess"
        className="absolute right-[5%] top-1/2 -translate-y-1/2 z-30 w-[210px] hidden md:flex flex-col items-center gap-3 p-5 rounded-2xl bg-slate-950/70 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group cursor-pointer no-underline"
      >
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          ♟
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">ChakraChess</div>
          <div className="text-xs text-gray-400 mt-1">Chakra Engine • 15 Lines</div>
        </div>
        <div className="text-xs text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Launch App →
        </div>
      </Link>

      {/* Mobile ChakraChess Banner */}
      <div className="w-full px-4 flex md:hidden justify-center mt-3 relative z-30">
        <Link
          href="/chess"
          className="w-full max-w-sm flex items-center justify-between p-3 rounded-xl bg-slate-950/85 backdrop-blur-xl border border-purple-500/30 hover:border-purple-500/60 shadow-lg shadow-purple-500/10 no-underline"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-base text-purple-300">
              ♟
            </div>
            <div>
              <div className="text-xs font-bold text-white">ChakraChess CPU</div>
              <div className="text-[10px] text-gray-400">Play &amp; analyze chess offline</div>
            </div>
          </div>
          <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
            Launch →
          </span>
        </Link>
      </div>

    </section>
  );
}
