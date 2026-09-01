import React, { useEffect, useRef, useState } from "react";

/**
 * SpideyDecorations
 * Props:
 *   chatState: "idle" | "generating" | "active"  (Chat tab)
 *   isMetricsTab: boolean
 *   messageCount: number
 *   lastResponseMs: number | null   (set after each response, for fast-response detection)
 *   onSwingLikeConsumed: fn         (reset parent trigger after swing plays)
 *   triggerSwingLike: boolean       (parent sets true on like / fast response)
 *   streamingStarted: boolean       (true while first tokens arrive – triggers spider-sense ping)
 *   inferenceError: boolean         (triggers spider-sense red ping)
 */
export default function SpideyDecorations({
  chatState = "idle",
  isMetricsTab = false,
  messageCount = 0,
  triggerSwingLike = false,
  onSwingLikeConsumed = () => {},
  streamingStarted = false,
  inferenceError = false,
}) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isWide =
    typeof window !== "undefined" && window.innerWidth >= 1024;

  // ---------- Chibi hang ----------
  const [chibiFase, setChibiFase] = useState("hidden"); // hidden | dropping | swaying | retracting
  const idleTimer = useRef(null);
  const chibiFaseRef = useRef(chibiFase);
  chibiFaseRef.current = chibiFase;

  useEffect(() => {
    if (!isWide) return;
    if (isMetricsTab) { setChibiFase("hidden"); return; }

    if (chatState === "idle" && messageCount === 0) {
      setChibiFase("dropping");
      const t = setTimeout(() => setChibiFase("swaying"), 700);
      return () => clearTimeout(t);
    }

    if (chatState === "generating" || messageCount > 0) {
      if (chibiFaseRef.current === "swaying" || chibiFaseRef.current === "dropping") {
        setChibiFase("retracting");
        const t = setTimeout(() => setChibiFase("hidden"), 400);
        return () => clearTimeout(t);
      }
    }

    // Re-show chibi after 60s idle mid-conversation
    if (chatState === "active") {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setChibiFase("dropping");
        setTimeout(() => setChibiFase("swaying"), 700);
      }, 60000);
    }
    return () => clearTimeout(idleTimer.current);
  }, [chatState, messageCount, isMetricsTab]);

  // ---------- Hang upside-down (generating) ----------
  const [hangPhase, setHangPhase] = useState("hidden"); // hidden | dropping | bobbing | rising

  useEffect(() => {
    if (!isWide) return;
    if (chatState === "generating") {
      setHangPhase("dropping");
      const t = setTimeout(() => setHangPhase("bobbing"), 900);
      return () => clearTimeout(t);
    } else {
      if (hangPhase === "bobbing" || hangPhase === "dropping") {
        setHangPhase("rising");
        const t = setTimeout(() => setHangPhase("hidden"), 600);
        return () => clearTimeout(t);
      }
    }
  }, [chatState]);

  // ---------- Swing like ----------
  const [showSwing, setShowSwing] = useState(false);
  const swingCooldown = useRef(false);

  useEffect(() => {
    if (!isWide) return;
    if (triggerSwingLike && !swingCooldown.current) {
      swingCooldown.current = true;
      setShowSwing(true);
      onSwingLikeConsumed();
      setTimeout(() => setShowSwing(false), 3200); // swing in 600ms + hold 2.5s
      setTimeout(() => { swingCooldown.current = false; }, 30000);
    }
  }, [triggerSwingLike]);

  // ---------- Spider-sense ping ----------
  const [sensePhase, setSensePhase] = useState("idle"); // idle | ping | error-ping
  const senseTimer = useRef(null);

  useEffect(() => {
    if (!isWide) return;
    if (inferenceError) {
      setSensePhase("error-ping");
      clearTimeout(senseTimer.current);
      senseTimer.current = setTimeout(() => setSensePhase("idle"), 1500);
    } else if (streamingStarted) {
      setSensePhase("ping");
      clearTimeout(senseTimer.current);
      senseTimer.current = setTimeout(() => setSensePhase("idle"), 700);
    }
    return () => clearTimeout(senseTimer.current);
  }, [streamingStarted, inferenceError]);

  if (!isWide) return null;

  // ---- CSS for keyframes injected once ----
  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes spideySway {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
          @keyframes spideyBob {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(8px); }
          }
          @keyframes spideySensePing {
            0% { opacity: 0.18; }
            50% { opacity: 0.45; }
            100% { opacity: 0.18; }
          }
          @keyframes spideySenseErrorPing {
            0% { opacity: 0.18; filter: none; }
            50% { opacity: 0.55; filter: sepia(1) saturate(5) hue-rotate(-20deg); }
            100% { opacity: 0.18; filter: none; }
          }
        }
      `}</style>

      {/* 1 ── CHIBI HANG (left gutter, idle state) */}
      {chibiFase !== "hidden" && (
        <img
          src="/spidey/spidey-chibi-hang.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: "6%",
            height: "190px",
            width: "auto",
            zIndex: 5,
            pointerEvents: "none",
            transformOrigin: "top center",
            willChange: "transform",
            transition:
              chibiFase === "dropping"
                ? "transform 700ms cubic-bezier(0.34,1.56,0.64,1)"
                : chibiFase === "retracting"
                ? "transform 400ms ease-in"
                : "none",
            transform:
              chibiFase === "dropping" || chibiFase === "swaying"
                ? "translateY(0) rotate(0deg)"
                : "translateY(-100%)",
            animation:
              !reducedMotion && chibiFase === "swaying"
                ? "spideySway 4s ease-in-out infinite"
                : "none",
          }}
        />
      )}

      {/* 2 ── HANG UPSIDE-DOWN (right gutter, generating) */}
      {hangPhase !== "hidden" && (
        <img
          src="/spidey/spidey-hang-upsidedown.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            right: "7%",
            height: "60vh",
            width: "auto",
            zIndex: 5,
            pointerEvents: "none",
            willChange: "transform",
            transition:
              hangPhase === "dropping"
                ? "transform 900ms ease-out"
                : hangPhase === "rising"
                ? "transform 600ms ease-in"
                : "none",
            transform:
              hangPhase === "dropping" || hangPhase === "bobbing"
                ? "translateY(0)"
                : "translateY(-40%)",
            animation:
              !reducedMotion && hangPhase === "bobbing"
                ? "spideyBob 6s ease-in-out infinite"
                : "none",
          }}
        />
      )}

      {/* 3 ── SWING LIKE (bottom-right, reward moment) */}
      {showSwing && (
        <img
          src="/spidey/spidey-swing-like.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "fixed",
            bottom: "110px",
            right: "3%",
            width: "240px",
            height: "auto",
            opacity: 0.9,
            zIndex: 5,
            pointerEvents: "none",
            willChange: "transform",
            animation: !reducedMotion
              ? "none"
              : undefined,
            transition: !reducedMotion
              ? "transform 600ms ease-out"
              : "none",
            transform: "translateX(0) rotate(0deg)",
            animationName: !reducedMotion ? "swingIn" : "none",
          }}
        />
      )}

      {/* 4 ── WEB DESCENT (left gutter, metrics tab only) */}
      {isMetricsTab && (
        <img
          src="/spidey/spidey-web-descent.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: "3%",
            height: "100vh",
            width: "auto",
            opacity: 0.35,
            zIndex: 5,
            pointerEvents: "none",
            transition: !reducedMotion ? "opacity 900ms, transform 900ms" : "none",
            transform: "translateY(0px)",
          }}
        />
      )}

      {/* 5 ── LEAP SILHOUETTE (bottom-left watermark, always) */}
      {!isMetricsTab && (
        <img
          src="/spidey/spidey-leap-silhouette.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "320px",
            height: "auto",
            opacity: messageCount >= 2 ? 0.05 : 0.10,
            zIndex: 5,
            pointerEvents: "none",
            transition: "opacity 1s ease",
          }}
        />
      )}

      {/* 6 ── SPIDER-SENSE (behind header logo) */}
      <img
        src="/spidey/spider-sense-transparent.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-30px",
          left: "250px",
          height: "150px",
          width: "auto",
          opacity: 0.18,
          zIndex: 1,
          pointerEvents: "none",
          willChange: "opacity",
          animation:
            !reducedMotion && sensePhase === "ping"
              ? "spideySensePing 700ms ease-in-out 1"
              : !reducedMotion && sensePhase === "error-ping"
              ? "spideySenseErrorPing 700ms ease-in-out 2"
              : "none",
        }}
      />
    </>
  );
}
