import { useEffect, useState } from "react";

export function AlarmOverlay({ active }: { active: boolean }) {
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (!active) return;
    setShake(true);
    const t = setTimeout(() => setShake(false), 1200);
    return () => clearTimeout(t);
  }, [active]);

  if (!active) return null;

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-0 z-40 ${shake ? "animate-shake" : ""}`}
        aria-hidden
      >
        <div className="absolute inset-0 border-[3px] border-emergency/50 animate-flash-border rounded-none" />
        <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 120px hsl(var(--emergency) / 0.35)" }} />
      </div>
    </>
  );
}

export default AlarmOverlay;
