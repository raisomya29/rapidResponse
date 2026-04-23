import { useMemo } from "react";
import { Activity, Clock, ShieldAlert, TrendingUp, TrendingDown } from "lucide-react";

type Severity = "NORMAL" | "MODERATE" | "CRITICAL";

interface Case {
  id: string;
  ts: Date;
  condition: string;
  severity: Severity;
  responseSec: number;
  location: string;
}

const HISTORY: Case[] = [
  { id: "c1", ts: new Date(Date.now() - 1000 * 60 * 12), condition: "Chest pain", severity: "CRITICAL", responseSec: 142, location: "L03 · Suite 314" },
  { id: "c2", ts: new Date(Date.now() - 1000 * 60 * 47), condition: "Slip & fall", severity: "MODERATE", responseSec: 188, location: "L02 · Lobby" },
  { id: "c3", ts: new Date(Date.now() - 1000 * 60 * 95), condition: "Mild headache", severity: "NORMAL", responseSec: 64, location: "L05 · Spa" },
  { id: "c4", ts: new Date(Date.now() - 1000 * 60 * 175), condition: "Allergic reaction", severity: "MODERATE", responseSec: 156, location: "L02 · Restaurant" },
  { id: "c5", ts: new Date(Date.now() - 1000 * 60 * 240), condition: "Smoke alert", severity: "CRITICAL", responseSec: 98, location: "L04 · Suite 421" },
  { id: "c6", ts: new Date(Date.now() - 1000 * 60 * 320), condition: "Dizziness", severity: "NORMAL", responseSec: 72, location: "L01 · Reception" },
  { id: "c7", ts: new Date(Date.now() - 1000 * 60 * 410), condition: "Cut · minor bleeding", severity: "MODERATE", responseSec: 134, location: "L02 · Kitchen" },
];

const INCIDENTS_7D = [
  { day: "Mon", count: 3, avg: 168 },
  { day: "Tue", count: 5, avg: 152 },
  { day: "Wed", count: 2, avg: 121 },
  { day: "Thu", count: 7, avg: 178 },
  { day: "Fri", count: 4, avg: 144 },
  { day: "Sat", count: 9, avg: 192 },
  { day: "Sun", count: 6, avg: 134 },
];

const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
const fmtDate = (d: Date) =>
  d.toLocaleDateString([], { month: "short", day: "2-digit" });
const fmtDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r.toString().padStart(2, "0")}s` : `${r}s`;
};

const SEV_TONE: Record<Severity, { dot: string; text: string; bg: string }> = {
  NORMAL: { dot: "bg-success", text: "text-success", bg: "bg-success/10 border-success/30" },
  MODERATE: { dot: "bg-warning", text: "text-warning", bg: "bg-warning/10 border-warning/30" },
  CRITICAL: { dot: "bg-emergency", text: "text-emergency", bg: "bg-emergency/10 border-emergency/40" },
};

export function AnalyticsPanel() {
  const stats = useMemo(() => {
    const total = HISTORY.length;
    const critical = HISTORY.filter((c) => c.severity === "CRITICAL").length;
    const avg = Math.round(HISTORY.reduce((s, c) => s + c.responseSec, 0) / total);
    const fastest = Math.min(...HISTORY.map((c) => c.responseSec));
    const breakdown = {
      NORMAL: HISTORY.filter((c) => c.severity === "NORMAL").length,
      MODERATE: HISTORY.filter((c) => c.severity === "MODERATE").length,
      CRITICAL: critical,
    };
    return { total, critical, avg, fastest, breakdown };
  }, []);

  const maxCount = Math.max(...INCIDENTS_7D.map((d) => d.count));
  const maxResponse = Math.max(...INCIDENTS_7D.map((d) => d.avg));
  const minResponse = Math.min(...INCIDENTS_7D.map((d) => d.avg));

  // Build SVG line chart for response time
  const W = 280;
  const H = 80;
  const PAD = 8;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  const points = INCIDENTS_7D.map((d, i) => {
    const x = PAD + (i / (INCIDENTS_7D.length - 1)) * innerW;
    const norm = (d.avg - minResponse) / Math.max(1, maxResponse - minResponse);
    const y = PAD + (1 - norm) * innerH;
    return { x, y, ...d };
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H - PAD} L ${points[0].x} ${H - PAD} Z`;

  const trend = points[points.length - 1].avg - points[0].avg;
  const trendDown = trend < 0;

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-5 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold tracking-wide">Cases & Response Analytics</h3>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground">LAST 7 DAYS</span>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Stat icon={<ShieldAlert className="w-3.5 h-3.5 text-emergency" />} label="Total cases" value={`${stats.total * 5 + 1}`} tone="active" />
        <Stat icon={<Activity className="w-3.5 h-3.5 text-emergency" />} label="Critical" value={`${stats.critical * 4}`} tone="emergency" />
        <Stat icon={<Clock className="w-3.5 h-3.5 text-primary" />} label="Avg resp" value={fmtDuration(stats.avg)} tone="active" />
        <Stat
          icon={trendDown ? <TrendingDown className="w-3.5 h-3.5 text-success" /> : <TrendingUp className="w-3.5 h-3.5 text-warning" />}
          label="Trend"
          value={`${trend >= 0 ? "+" : ""}${trend}s`}
          tone={trendDown ? "safe" : "warning"}
        />
      </div>

      {/* Bar chart - incidents per day */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground">CASES PER DAY</p>
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground">PEAK · {maxCount}</p>
        </div>
        <div className="flex items-end gap-2 h-24">
          {INCIDENTS_7D.map((i) => (
            <div key={i.day} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="font-mono text-[9px] text-foreground/80 opacity-0 group-hover:opacity-100 transition">{i.count}</span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-primary/30 to-primary relative overflow-hidden"
                style={{
                  height: `${(i.count / maxCount) * 100}%`,
                  boxShadow: "0 0 12px hsl(var(--primary) / 0.5)",
                }}
              >
                <span className="absolute inset-x-0 top-0 h-px bg-primary-foreground/40" />
              </div>
              <span className="font-mono text-[9px] text-muted-foreground tracking-widest">{i.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Line chart - avg response time */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground">AVG RESPONSE TIME</p>
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
            {fmtDuration(minResponse)} → {fmtDuration(maxResponse)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/40 p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="resp-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* gridlines */}
            {[0.25, 0.5, 0.75].map((p) => (
              <line
                key={p}
                x1={PAD}
                x2={W - PAD}
                y1={PAD + p * innerH}
                y2={PAD + p * innerH}
                stroke="hsl(var(--border))"
                strokeDasharray="2 3"
                strokeWidth={0.5}
              />
            ))}
            <path d={areaPath} fill="url(#resp-area)" />
            <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p) => (
              <g key={p.day}>
                <circle cx={p.x} cy={p.y} r={2.5} fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth={1.4} />
              </g>
            ))}
          </svg>
          <div className="flex justify-between mt-1 px-1">
            {points.map((p) => (
              <span key={p.day} className="font-mono text-[9px] text-muted-foreground tracking-widest">
                {p.day}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Severity breakdown */}
      <div>
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-2">SEVERITY BREAKDOWN</p>
        <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
          <div className="bg-success" style={{ width: `${(stats.breakdown.NORMAL / stats.total) * 100}%`, boxShadow: "0 0 8px hsl(var(--success)/0.6)" }} />
          <div className="bg-warning" style={{ width: `${(stats.breakdown.MODERATE / stats.total) * 100}%`, boxShadow: "0 0 8px hsl(var(--warning)/0.6)" }} />
          <div className="bg-emergency" style={{ width: `${(stats.breakdown.CRITICAL / stats.total) * 100}%`, boxShadow: "0 0 8px hsl(var(--emergency)/0.6)" }} />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono tracking-widest">
          <span className="text-success">● NORMAL {stats.breakdown.NORMAL}</span>
          <span className="text-warning">● MODERATE {stats.breakdown.MODERATE}</span>
          <span className="text-emergency">● CRITICAL {stats.breakdown.CRITICAL}</span>
        </div>
      </div>

      {/* Case history list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground">CASE HISTORY</p>
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground">{HISTORY.length} RECORDS</p>
        </div>
        <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1 -mr-1">
          {HISTORY.map((c) => {
            const tone = SEV_TONE[c.severity];
            return (
              <li
                key={c.id}
                className={`flex items-center gap-3 rounded-lg border ${tone.bg} px-2.5 py-2`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium truncate">{c.condition}</p>
                    <span className={`font-mono text-[10px] tracking-widest ${tone.text}`}>{c.severity}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="font-mono text-[10px] text-muted-foreground tracking-widest truncate">
                      {fmtDate(c.ts)} · {fmtTime(c.ts)} · {c.location}
                    </span>
                    <span className="font-mono text-[10px] text-foreground/80 tabular-nums flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {fmtDuration(c.responseSec)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
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
  tone: "emergency" | "active" | "safe" | "warning";
}) {
  const toneClass =
    tone === "emergency"
      ? "neon-text-emergency"
      : tone === "safe"
      ? "neon-text-safe"
      : tone === "warning"
      ? "neon-text-warning"
      : "neon-text-active";
  return (
    <div className="rounded-xl border border-border bg-background/40 p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="font-mono text-[9px] tracking-widest text-muted-foreground truncate">{label}</span>
      </div>
      <p className={`font-display text-base font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default AnalyticsPanel;
