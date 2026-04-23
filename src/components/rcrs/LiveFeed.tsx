import { useEffect, useState } from "react";
import { Activity, Cpu, Radio } from "lucide-react";

interface FeedItem {
  id: string;
  ts: string;
  text: string;
  tone: "info" | "warning" | "emergency" | "success";
}

const SAMPLE: Omit<FeedItem, "id" | "ts">[] = [
  { text: "Sensor sweep complete · L02 lobby clear", tone: "success" },
  { text: "Movement spike detected · L03 corridor", tone: "info" },
  { text: "AI model latency 412ms · nominal", tone: "info" },
  { text: "Smoke detector calibrated · L05 spa", tone: "success" },
  { text: "Heart-rate anomaly cleared · Guest 214", tone: "warning" },
  { text: "Fire panel handshake OK", tone: "success" },
  { text: "Crowd density 64% · Atrium", tone: "info" },
  { text: "Responder online · MEDIC-02", tone: "success" },
];

export function LiveFeed({ emergency }: { emergency: boolean }) {
  const [items, setItems] = useState<FeedItem[]>(() =>
    SAMPLE.slice(0, 5).map((s, i) => ({
      ...s,
      id: `seed-${i}`,
      ts: new Date(Date.now() - i * 30000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    }))
  );

  useEffect(() => {
    const id = setInterval(() => {
      const base = SAMPLE[Math.floor(Math.random() * SAMPLE.length)];
      const next: FeedItem = {
        ...base,
        id: Math.random().toString(36).slice(2),
        ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
      setItems((prev) => [next, ...prev].slice(0, 8));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (emergency) {
      const ev: FeedItem = {
        id: `em-${Date.now()}`,
        ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        text: "🚨 EMERGENCY DISPATCH · MEDIC-01 EN ROUTE",
        tone: "emergency",
      };
      setItems((prev) => [ev, ...prev].slice(0, 8));
    }
  }, [emergency]);

  return (
    <div className="glass-panel rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold tracking-wide">Live Telemetry</h3>
        </div>
        <span className="flex items-center gap-1 font-mono text-[10px] tracking-widest text-success">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          STREAMING
        </span>
      </div>

      <ul className="space-y-2 overflow-hidden flex-1">
        {items.map((item, i) => (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/40 p-2.5 animate-fade-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div
              className={`mt-1 w-1.5 h-1.5 rounded-full ${
                item.tone === "emergency"
                  ? "bg-emergency"
                  : item.tone === "warning"
                  ? "bg-warning"
                  : item.tone === "success"
                  ? "bg-success"
                  : "bg-primary"
              }`}
            />
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
              <p className="font-mono text-[10px] text-muted-foreground tracking-widest mt-0.5">{item.ts}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-muted-foreground">
          <Cpu className="w-3 h-3" /> AI ACTIVE
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-muted-foreground">
          <Activity className="w-3 h-3" /> 24 SENSORS
        </span>
      </div>
    </div>
  );
}

export default LiveFeed;
