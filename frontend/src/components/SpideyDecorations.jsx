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
        /* 1. Left side spider-man swinging sway */
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

        /* 2. Cowboy air / dust swirl drift near crouched leg */
        @keyframes cowboyDustDrift {
          0% {
            transform: translateX(18px) translateY(0) scale(0.6) rotate(0deg);
            opacity: 0;
          }
          25% {
            opacity: 0.55;
          }
          65% {
            transform: translateX(-35px) translateY(-8px) scale(1.1) rotate(-18deg);
            opacity: 0.4;
          }
          100% {
            transform: translateX(-70px) translateY(-14px) scale(1.4) rotate(-35deg);
            opacity: 0;
          }
        }

        @keyframes cowboyDustDrift2 {
          0% {
            transform: translateX(10px) translateY(0) scale(0.5);
            opacity: 0;
          }
          30% {
            opacity: 0.45;
          }
          70% {
            transform: translateX(-28px) translateY(-6px) scale(0.95);
            opacity: 0.3;
          }
          100% {
            transform: translateX(-55px) translateY(-11px) scale(1.25);
            opacity: 0;
          }
        }
      `}</style>

      {/* 1. Left Gutter: Spider-Man swinging between center and bottom */}
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

      {/* 2. Right-Top: Spider-Man Swinging Enhanced (static, no motion) */}
      <img
        src="/spidey/spiderman-swing-enhanced.png"
        alt="Spider-Man Swinging Enhanced"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "60px",
          right: "15px",
          width: "210px",
          maxWidth: "16vw",
          height: "auto",
          zIndex: 5,
          pointerEvents: "none",
          filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.55))",
        }}
      />

      {/* 3. Right-Bottom: Spider-Man Crouched Enhanced (reduced by half) + Cowboy dust/air breeze */}
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          right: "15px",
          width: "128px",
          maxWidth: "8.5vw",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        <img
          src="/spidey/spiderman-crouch-enhanced.png"
          alt="Spider-Man Crouched"
          aria-hidden="true"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            filter: "drop-shadow(0 6px 16px rgba(0, 0, 0, 0.6))",
          }}
        />
      </div>
    </>
  );
}
