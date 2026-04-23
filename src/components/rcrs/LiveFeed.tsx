import { useEffect, useRef, useState } from "react";
import { Activity, Brain, Cpu, Footprints, MapPin, Radio, ShieldAlert } from "lucide-react";

export type FeedCategory = "ai" | "location" | "movement" | "system";
export type FeedTone = "info" | "warning" | "emergency" | "success";

export interface FeedItem {
  id: string;
  ts: Date;
  category: FeedCategory;
  text: string;
  meta?: string;
  tone: FeedTone;
}

interface Props {
  emergency: boolean;
  externalEvents?: FeedItem[];
}

const AI_EVENTS: Omit<FeedItem, "id" | "ts">[] = [
  { category: "ai", text: "Pattern scan complete · no anomalies", meta: "Confidence 98%", tone: "success" },
  { category: "ai", text: "Voice stress model · normal range", meta: "Window 30s", tone: "info" },
  { category: "ai", text: "Crowd flow re-routed · L02 → L01", meta: "Decision · ROUTE-04", tone: "info" },
  { category: "ai", text: "Heart-rate anomaly cleared · Guest 214", meta: "Confidence 91%", tone: "warning" },
  { category: "ai", text: "Predictive risk score 0.12", meta: "Trend · falling", tone: "success" },
];

const LOCATION_EVENTS: Omit<FeedItem, "id" | "ts">[] = [
  { category: "location", text: "User location updated", meta: "L03 · Corridor East", tone: "info" },
  { category: "location", text: "Guest entered safe zone", meta: "Atrium · West Plaza", tone: "success" },
  { category: "location", text: "Geofence crossed · staff zone", meta: "L04 · Service door", tone: "info" },
  { category: "location", text: "Beacon handshake refreshed", meta: "12 anchors online", tone: "success" },
];

const MOVEMENT_EVENTS: Omit<FeedItem, "id" | "ts">[] = [
  { category: "movement", text: "Movement spike · L03 corridor", meta: "Density 64%", tone: "warning" },
  { category: "movement", text: "Sudden stop detected", meta: "Cam-12 · Lobby", tone: "info" },
  { category: "movement", text: "Crowd dispersing normally", meta: "Atrium · -18%", tone: "success" },
  { category: "movement", text: "Fall risk gesture flagged", meta: "Cam-07 · L05 spa", tone: "warning" },
  { category: "movement", text: "Responder MEDIC-02 moving", meta: "L01 → L03 · 14s", tone: "info" },
];

const POOLS = [...AI_EVENTS, ...LOCATION_EVENTS, ...MOVEMENT_EVENTS];

const fmt = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

function CategoryIcon({ c }: { c: FeedCategory }) {
  const cls = "w-3.5 h-3.5";
  if (c === "ai") return <Brain className={cls} />;
  if (c === "location") return <MapPin className={cls} />;
  if (c === "movement") return <Footprints className={cls} />;
  return <ShieldAlert className={cls} />;
}

const CATS: { id: "all" | FeedCategory; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "ai", label: "AI" },
  { id: "location", label: "LOCATION" },
  { id: "movement", label: "MOVEMENT" },
];

export function LiveFeed({ emergency, externalEvents }: Props) {
  const [items, setItems] = useState<FeedItem[]>(() =>
    Array.from({ length: 5 }).map((_, i) => {
      const base = POOLS[i % POOLS.length];
      return {
        ...base,
        id: `seed-${i}`,
        ts: new Date(Date.now() - i * 22000),
      };
    })
  );
  const [filter, setFilter] = useState<"all" | FeedCategory>("all");
  const lastExternalRef = useRef<string | null>(null);

  // Auto-stream events
  useEffect(() => {
    const tick = () => {
      const base = POOLS[Math.floor(Math.random() * POOLS.length)];
      const next: FeedItem = {
        ...base,
        id: Math.random().toString(36).slice(2),
        ts: new Date(),
      };
      setItems((prev) => [next, ...prev].slice(0, 40));
    };
    const id = setInterval(tick, 2800);
    return () => clearInterval(id);
  }, []);

  // Push emergency state change
  useEffect(() => {
    if (emergency) {
      setItems((prev) =>
        [
          {
            id: `em-${Date.now()}`,
            ts: new Date(),
            category: "ai" as FeedCategory,
            text: "🚨 CRITICAL DECISION · dispatching MEDIC-01",
            meta: "Severity escalated by AI",
            tone: "emergency" as FeedTone,
          },
          ...prev,
        ].slice(0, 40)
      );
    }
  }, [emergency]);

  // Inject external events (e.g. AI triage result)
  useEffect(() => {
    if (!externalEvents || externalEvents.length === 0) return;
    const newest = externalEvents[0];
    if (newest.id === lastExternalRef.current) return;
    lastExternalRef.current = newest.id;
    setItems((prev) => [...externalEvents, ...prev].slice(0, 40));
  }, [externalEvents]);

  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="glass-panel rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold tracking-wide">Live Incident Feed</h3>
        </div>
        <span className="flex items-center gap-1 font-mono text-[10px] tracking-widest text-success">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          STREAMING
        </span>
      </div>

      <div className="flex items-center gap-1 mb-3">
        {CATS.map((c) => {
          const active = filter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-2 py-1 rounded-md font-mono text-[10px] tracking-widest border transition ${
                active
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <ul className="space-y-2 overflow-y-auto flex-1 pr-1 -mr-1 max-h-[360px]">
        {visible.length === 0 && (
          <li className="text-xs text-muted-foreground text-center py-8 font-mono tracking-widest">
            NO {filter.toUpperCase()} EVENTS YET
          </li>
        )}
        {visible.map((item, i) => (
          <li
            key={item.id}
            className={`flex items-start gap-3 rounded-lg border p-2.5 animate-fade-up ${
              item.tone === "emergency"
                ? "border-emergency/50 bg-emergency/5"
                : item.tone === "warning"
                ? "border-warning/40 bg-warning/5"
                : item.tone === "success"
                ? "border-success/30 bg-success/5"
                : "border-border/60 bg-background/40"
            }`}
            style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}
          >
            <div
              className={`mt-0.5 grid place-items-center w-6 h-6 rounded-md flex-none ${
                item.tone === "emergency"
                  ? "bg-emergency/20 text-emergency"
                  : item.tone === "warning"
                  ? "bg-warning/20 text-warning"
                  : item.tone === "success"
                  ? "bg-success/20 text-success"
                  : "bg-primary/15 text-primary"
              }`}
            >
              <CategoryIcon c={item.category} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs leading-snug ${
                  item.tone === "emergency"
                    ? "text-emergency font-semibold"
                    : item.tone === "warning"
                    ? "text-warning"
                    : "text-foreground/90"
                }`}
              >
                {item.text}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground tabular-nums">
                  {fmt(item.ts)}
                </span>
                {item.meta && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="font-mono text-[10px] tracking-widest text-muted-foreground truncate">
                      {item.meta}
                    </span>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-muted-foreground">
          <Cpu className="w-3 h-3" /> AI ACTIVE
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-muted-foreground">
          <Activity className="w-3 h-3" /> {items.length} EVENTS
        </span>
      </div>
    </div>
  );
}

export default LiveFeed;
