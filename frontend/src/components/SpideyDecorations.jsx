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

        /* 2. Top right spotlight blinking once every 10s */
        @keyframes spotlightBlink10s {
          0%, 10% {
            opacity: 0;
            filter: brightness(0);
          }
          12% {
            opacity: 0.7;
            filter: brightness(1.3);
          }
          14% {
            opacity: 0.2;
            filter: brightness(0.5);
          }
          16% {
            opacity: 1;
            filter: brightness(1.1);
          }
          38% {
            opacity: 0.95;
            filter: brightness(1.0);
          }
          41% {
            opacity: 0.25;
            filter: brightness(0.5);
          }
          43%, 100% {
            opacity: 0;
            filter: brightness(0);
          }
        }
      `}</style>

      {/* 1. Left Gutter: Spider-Man swinging positioned between center and bottom */}
      <img
        src="/spidey/spidey-swing-like.png"
        alt="Spider-Man Swinging"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "calc(50% + 5px)",
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

      {/* 2. Right-Top: Small Spotlight scene blinking once every 10s */}
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
          animation: !reducedMotion ? "spotlightBlink10s 10s ease-in-out infinite" : "none",
        }}
      />
    </>
  );
}
