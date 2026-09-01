import React from "react";

export default function SpideyDecorations() {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isWide =
    typeof window !== "undefined" && window.innerWidth >= 1024;

  if (!isWide) return null;

  return (
    <>
      <style>{`
        /* 1. Left bottom spider-man swinging sway */
        @keyframes spideySwingSway {
          0% {
            transform: rotate(-3deg) translateY(0);
          }
          50% {
            transform: rotate(4deg) translateY(-8px);
          }
          100% {
            transform: rotate(-3deg) translateY(0);
          }
        }

        /* 2. Top right spotlight blinking once every 5s with realistic lamp flicker */
        @keyframes spotlightBlink5s {
          0%, 15% {
            opacity: 0;
            filter: brightness(0);
          }
          17% {
            opacity: 0.7;
            filter: brightness(1.3);
          }
          19% {
            opacity: 0.2;
            filter: brightness(0.5);
          }
          22% {
            opacity: 1;
            filter: brightness(1.1);
          }
          55% {
            opacity: 0.95;
            filter: brightness(1.0);
          }
          58% {
            opacity: 0.3;
            filter: brightness(0.6);
          }
          60%, 100% {
            opacity: 0;
            filter: brightness(0);
          }
        }
      `}</style>

      {/* 1. Left-Bottom: Spider-Man swinging from the left corner */}
      <img
        src="/spidey/spidey-swing-like.png"
        alt="Spider-Man Swinging"
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: "15px",
          left: "15px",
          width: "270px",
          maxWidth: "20vw",
          height: "auto",
          zIndex: 5,
          pointerEvents: "none",
          transformOrigin: "top left",
          willChange: "transform",
          animation: !reducedMotion ? "spideySwingSway 4.5s ease-in-out infinite" : "none",
          filter: "drop-shadow(0 8px 24px rgba(0, 0, 0, 0.6))",
        }}
      />

      {/* 2. Right-Top: Spotlight blinking once every 5 seconds */}
      <img
        src="/spidey/spidey-spotlight.jpeg"
        alt="Spotlight Scene"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "60px",
          right: "20px",
          width: "175px",
          maxWidth: "16vw",
          height: "auto",
          zIndex: 5,
          pointerEvents: "none",
          mixBlendMode: "screen",
          willChange: "opacity, filter",
          animation: !reducedMotion ? "spotlightBlink5s 5s ease-in-out infinite" : "none",
        }}
      />
    </>
  );
}
