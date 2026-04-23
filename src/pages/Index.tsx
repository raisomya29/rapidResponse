import { useEffect, useMemo, useState } from "react";
import { Activity, Heart, Hotel, Shield, Sparkles, Users, Wifi } from "lucide-react";
import { Building3D } from "@/components/rcrs/Building3D";
import { SOSButton } from "@/components/rcrs/SOSButton";
import { AIAssistant, type TriageResult } from "@/components/rcrs/AIAssistant";
import { AnalyticsPanel } from "@/components/rcrs/AnalyticsPanel";
import { LiveFeed, type FeedItem } from "@/components/rcrs/LiveFeed";
import { NavigationPanel } from "@/components/rcrs/NavigationPanel";
import { EmergencyServices } from "@/components/rcrs/EmergencyServices";
import { AlarmOverlay } from "@/components/rcrs/AlarmOverlay";
import { toast } from "sonner";

type Mode = "safe" | "warning" | "emergency";

const Index = () => {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [now, setNow] = useState(new Date());
  const [externalEvents, setExternalEvents] = useState<FeedItem[]>([]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const mode: Mode = useMemo(() => {
    if (!triage) return "safe";
    if (triage.severity === "CRITICAL") return "emergency";
    if (triage.severity === "MODERATE") return "warning";
    return "safe";
  }, [triage]);

  const pushFeed = (event: Omit<FeedItem, "id" | "ts">) => {
    setExternalEvents((prev) =>
      [{ ...event, id: Math.random().toString(36).slice(2), ts: new Date() }, ...prev].slice(0, 20)
    );
  };

  const onTriage = (r: TriageResult) => {
    setTriage(r);
    const tone = r.severity === "CRITICAL" ? "emergency" : r.severity === "MODERATE" ? "warning" : "success";
    pushFeed({
      category: "ai",
      tone,
      text: `AI decision · ${r.severity} · ${r.condition}`,
      meta: r.ambulance_needed ? `Ambulance ETA ${r.est_response_minutes}m` : "No dispatch required",
    });
    if (r.severity === "CRITICAL") {
      toast.error(`CRITICAL · ${r.condition}`, { description: "Ambulance dispatched. Follow on-screen steps." });
      pushFeed({ category: "location", tone: "emergency", text: "User location pinned for responders", meta: "L03 · Corridor East" });
      pushFeed({ category: "movement", tone: "warning", text: "Crowd clearing route to L03", meta: "Auto-routed by AI" });
    } else if (r.severity === "MODERATE") {
      toast.warning(`MODERATE · ${r.condition}`, { description: "Monitoring activated." });
      pushFeed({ category: "movement", tone: "warning", text: "Increased monitoring on user", meta: "Cam-07 tracking" });
    } else {
      toast.success(`NORMAL · ${r.condition}`, { description: "No emergency. Suggestions provided." });
    }
  };

  return (
    <main className="relative min-h-screen text-foreground">
      <AlarmOverlay active={mode === "emergency"} />

      <div className="grid-pattern absolute inset-0 opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-8 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass-panel grid place-items-center" style={{ boxShadow: "var(--glow-active)" }}>
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-wide">
              RCRS <span className="text-primary">/</span> Rapid Crisis Response
            </h1>
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
              AI EMERGENCY SYSTEM · HOSPITALITY GRADE
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Pill icon={<Wifi className="w-3 h-3" />} label="LINK" value="STABLE" tone="safe" />
          <Pill icon={<Users className="w-3 h-3" />} label="OCC" value="412" tone="active" />
          <Pill
            icon={<Activity className="w-3 h-3" />}
            label="STATUS"
            value={mode === "emergency" ? "EMERGENCY" : mode === "warning" ? "WARNING" : "ALL CLEAR"}
            tone={mode === "emergency" ? "emergency" : mode === "warning" ? "warning" : "safe"}
          />
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {now.toLocaleTimeString()}
          </span>
        </div>
      </header>

      {/* Main grid */}
      <section className="relative z-10 px-4 sm:px-8 pb-24 grid grid-cols-12 gap-4 lg:gap-6">
        {/* Left column — SOS + AI */}
        <div className="col-span-12 lg:col-span-3 space-y-4 lg:space-y-6">
          <div className="glass-panel rounded-3xl p-6 text-center relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emergency/20 blur-3xl pointer-events-none" />
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">SMART SOS</p>
            <h2 className="font-display text-xl font-semibold mb-4">Emergency activation</h2>
            <SOSButton onTrigger={() => setAssistantOpen(true)} active={assistantOpen || mode === "emergency"} />
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              Auto-triggers on panic voice or sudden fall. Tap to launch AI triage.
            </p>
          </div>

          <button
            onClick={() => setAssistantOpen(true)}
            className="w-full glass-panel rounded-2xl p-4 flex items-center gap-3 text-left hover:border-primary/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 grid place-items-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-sm">Describe symptoms</p>
              <p className="text-xs text-muted-foreground">AI assesses any condition · voice or text</p>
            </div>
          </button>

          <div className="glass-panel rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-emergency" />
              <h3 className="font-display font-semibold text-sm">Vitals stream</h3>
            </div>
            <Vital label="Heart rate" value="72 bpm" pct={60} tone="safe" />
            <Vital label="O₂ saturation" value="98%" pct={92} tone="safe" />
            <Vital label="Stress index" value={mode === "emergency" ? "84" : "21"} pct={mode === "emergency" ? 84 : 21} tone={mode === "emergency" ? "emergency" : "safe"} />
          </div>
        </div>

        {/* Center column — 3D building */}
        <div className="col-span-12 lg:col-span-6 space-y-4 lg:space-y-6">
          <div className={`glass-panel rounded-3xl p-2 sm:p-3 relative overflow-hidden ${mode === "emergency" ? "animate-flash-border" : ""}`}>
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <Hotel className="w-4 h-4 text-primary" />
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground">3D LIVE MONITOR</span>
            </div>
            <div className="h-[480px] sm:h-[540px] rounded-2xl overflow-hidden relative">
              <Building3D mode={mode} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <NavigationPanel emergency={mode === "emergency"} />
            <EmergencyServices active={mode === "emergency"} etaMinutes={triage?.est_response_minutes || 6} />
          </div>
        </div>

        {/* Right column — feed + analytics */}
        <div className="col-span-12 lg:col-span-3 space-y-4 lg:space-y-6">
          <LiveFeed emergency={mode === "emergency"} />
          <AnalyticsPanel />
        </div>
      </section>

      <footer className="relative z-10 px-4 sm:px-8 pb-6 flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
          © RCRS · v1.0 · Encrypted telemetry
        </p>
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
          Powered by Lovable AI
        </p>
      </footer>

      <AIAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} onResult={onTriage} />
    </main>
  );
};

function Pill({
  icon,
  label,
  value,
  tone,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  tone: "safe" | "active" | "warning" | "emergency";
}) {
  const t =
    tone === "emergency"
      ? "border-emergency/60 text-emergency"
      : tone === "warning"
      ? "border-warning/60 text-warning"
      : tone === "safe"
      ? "border-success/40 text-success"
      : "border-primary/40 text-primary";
  return (
    <div className={`glass-panel inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${t}`}>
      {icon}
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{label}</span>
      <span className="font-mono text-[10px] tracking-widest font-semibold">{value}</span>
    </div>
  );
}

function Vital({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: string;
  pct: number;
  tone: "safe" | "warning" | "emergency";
}) {
  const c = tone === "emergency" ? "bg-emergency" : tone === "warning" ? "bg-warning" : "bg-success";
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full ${c} transition-all`}
          style={{ width: `${pct}%`, boxShadow: `0 0 10px hsl(var(--${tone === "emergency" ? "emergency" : tone === "warning" ? "warning" : "success"}) / 0.7)` }}
        />
      </div>
    </div>
  );
}

export default Index;
