"use client";
import { useDemo } from "./DemoContext";

export function Watermark() {
  const { isDemo, watermark } = useDemo();

  if (!isDemo) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0.08,
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 100px,
          rgba(220, 38, 38, 0.3) 100px,
          rgba(220, 38, 38, 0.3) 101px
        )`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-30deg)",
          fontSize: "48px",
          fontWeight: "bold",
          color: "#dc2626",
          whiteSpace: "nowrap",
          letterSpacing: "4px",
        }}
      >
        {watermark}
      </div>
    </div>
  );
}

export function DemoBanner() {
  const { isDemo } = useDemo();
  if (!isDemo) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(90deg, #dc2626, #991b1b)",
        color: "white",
        padding: "8px 16px",
        textAlign: "center",
        fontSize: "13px",
        fontWeight: "600",
        zIndex: 10000,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.2)",
      }}
    >
      🎭 حالت نمایشی (Demo) - همه داده‌ها ساختگی هستند و هر ۲۴ ساعت پاک می‌شوند -
      blueFrame Insight ©
    </div>
  );
}
