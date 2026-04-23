import { Activity, Clock, ShieldAlert, TrendingUp } from "lucide-react";

const incidents = [
  { day: "Mon", count: 3 },
  { day: "Tue", count: 5 },
  { day: "Wed", count: 2 },
  { day: "Thu", count: 7 },
  { day: "Fri", count: 4 },
  { day: "Sat", count: 9 },
  { day: "Sun", count: 6 },
];
const max = Math.max(...incidents.map((i) => i.count));

export function AnalyticsPanel() {
  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold tracking-wide">Analytics · 7 days</h3>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground">LIVE</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat icon={<ShieldAlert className="w-4 h-4 text-emergency" />} label="Incidents" value="36" tone="emergency" />
        <Stat icon={<Clock className="w-4 h-4 text-primary" />} label="Avg resp" value="2.4m" tone="active" />
        <Stat icon={<Activity className="w-4 h-4 text-success" />} label="Resolved" value="98%" tone="safe" />
      </div>

      <div>
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-2">INCIDENTS PER DAY</p>
        <div className="flex items-end gap-2 h-28">
          {incidents.map((i) => (
            <div key={i.day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-primary/30 to-primary"
                style={{
                  height: `${(i.count / max) * 100}%`,
                  boxShadow: "0 0 12px hsl(var(--primary) / 0.5)",
                }}
              />
              <span className="font-mono text-[9px] text-muted-foreground">{i.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  tone: "emergency" | "active" | "safe";
}) {
  const toneClass =
    tone === "emergency" ? "neon-text-emergency" : tone === "safe" ? "neon-text-safe" : "neon-text-active";
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{label}</span>
      </div>
      <p className={`font-display text-xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default AnalyticsPanel;
