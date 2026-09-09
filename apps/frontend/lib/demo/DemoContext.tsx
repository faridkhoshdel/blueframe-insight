"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DemoContextType {
  isDemo: boolean;
  watermark: string;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  checkDemo: () => Promise<void>;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);
  const [watermark, setWatermark] = useState("");

  const checkDemo = async () => {
    try {
      const res = await fetch(`${window.location.origin.includes("localhost") ? "http://localhost:50001" : "https://blueframe-backend.onrender.com"}/demo/info`);
      const data = await res.json();
      setIsDemo(data.demoMode === true);
      if (data.demoMode) {
        setWatermark("DEMO - blueFrame Insight ©");
      }
    } catch (e) {
      console.log("Demo check failed, assuming production");
    }
  };

  useEffect(() => {
    checkDemo();
  }, []);

  return (
    <DemoContext.Provider
      value={{
        isDemo,
        watermark,
        canEdit: !isDemo,
        canDelete: !isDemo,
        canExport: !isDemo,
        checkDemo,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
