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

        /* 2. Top right spotlight blinking once every 7s with full ground light reflection */
        @keyframes spotlightBlink7s {
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
          50% {
            opacity: 0.95;
            filter: brightness(1.0);
          }
          53% {
            opacity: 0.25;
            filter: brightness(0.5);
          }
          55%, 100% {
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
          bottom: "20px",
          left: "12px",
          width: "190px",
          maxWidth: "14vw",
          height: "auto",
          zIndex: 5,
          pointerEvents: "none",
          transformOrigin: "top left",
          willChange: "transform",
          animation: !reducedMotion ? "spideySwingSway 4.5s ease-in-out infinite" : "none",
          filter: "drop-shadow(0 8px 24px rgba(0, 0, 0, 0.6))",
        }}
      />

      {/* 2. Right-Top: Spotlight showing full ground light reflection, blinking every 7s */}
      <img
        src="/spidey/spidey-spotlight.jpeg"
        alt="Spotlight Scene"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "56px",
          right: "20px",
          height: "82vh",
          maxHeight: "85vh",
          width: "auto",
          maxWidth: "18vw",
          objectFit: "contain",
          zIndex: 5,
          pointerEvents: "none",
          mixBlendMode: "screen",
          willChange: "opacity, filter",
          animation: !reducedMotion ? "spotlightBlink7s 7s ease-in-out infinite" : "none",
        }}
      />
    </>
  );
}
