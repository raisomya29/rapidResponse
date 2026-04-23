import { ArrowRight, MapPin, Navigation, Wind } from "lucide-react";

export function NavigationPanel({ emergency }: { emergency: boolean }) {
  const route = [
    { label: "Current · L03 Corridor", tone: "active" as const },
    { label: "Stairwell B · 12 m", tone: "muted" as const },
    { label: "Lobby Atrium · 48 m", tone: "muted" as const },
    { label: "Safe Assembly · West Plaza", tone: "safe" as const },
  ];
  return (
    <div className="glass-panel rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold tracking-wide">Live Navigation</h3>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-success">GPS LOCK</span>
      </div>

      <div className="relative rounded-xl border border-border bg-background/50 p-4 overflow-hidden">
        <div className="grid-pattern absolute inset-0 opacity-40" />
        <div className="relative space-y-3">
          {route.map((r, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  r.tone === "active"
                    ? "bg-primary animate-pulse"
                    : r.tone === "safe"
                    ? "bg-success"
                    : "bg-muted-foreground/60"
                }`}
              />
              <div
                className={`h-px flex-1 ${
                  emergency
                    ? "bg-gradient-to-r from-emergency/60 via-emergency to-emergency/60"
                    : "bg-gradient-to-r from-primary/60 via-primary to-success/60"
                }`}
              />
              <span
                className={`text-xs ${
                  r.tone === "active"
                    ? "text-primary"
                    : r.tone === "safe"
                    ? "text-success"
                    : "text-muted-foreground"
                }`}
              >
                {r.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Tile icon={<MapPin className="w-4 h-4 text-primary" />} label="Distance" value="62 m" />
        <Tile icon={<Wind className="w-4 h-4 text-success" />} label="ETA" value="48 s" />
      </div>

      <button className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium border border-border bg-secondary/60 hover:bg-secondary transition">
        Start guided route <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function Tile({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{label}</span>
      </div>
      <p className="font-display text-lg font-semibold">{value}</p>
    </div>
  );
}

export default NavigationPanel;
