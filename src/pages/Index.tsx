import { useEffect, useMemo, useState } from "react";
import { Activity, Brain, Hotel, MapPin, Radio, Shield, Siren, Sparkles, Users, Wifi } from "lucide-react";
import { Building3D } from "@/components/rcrs/Building3D";
import { SOSButton } from "@/components/rcrs/SOSButton";
import { AIAssistant, type TriageResult } from "@/components/rcrs/AIAssistant";
import { AnalyticsPanel } from "@/components/rcrs/AnalyticsPanel";
import { LiveFeed, type FeedItem } from "@/components/rcrs/LiveFeed";
import { NavigationPanel } from "@/components/rcrs/NavigationPanel";
import { EmergencyServices } from "@/components/rcrs/EmergencyServices";
import { AlarmOverlay } from "@/components/rcrs/AlarmOverlay";
import { HospitalsPanel } from "@/components/rcrs/HospitalsPanel";
import { AppSidebar, type ViewKey } from "@/components/rcrs/AppSidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { toast } from "sonner";

type Mode = "safe" | "warning" | "emergency";

const VIEW_TITLES: Record<ViewKey, { title: string; subtitle: string }> = {
  overview: { title: "Mission Overview", subtitle: "All systems on a single canvas" },
  monitor: { title: "3D Live Monitor", subtitle: "Real-time building telemetry" },
  triage: { title: "AI Triage", subtitle: "Open-ended symptom analysis" },
  feed: { title: "Incident Feed", subtitle: "AI · location · movement events" },
  hospitals: { title: "Nearby Hospitals", subtitle: "Direct contacts and routing" },
  navigation: { title: "Navigation", subtitle: "Live route to safe zones" },
  emergency: { title: "Emergency Dispatch", subtitle: "Active critical response" },
  analytics: { title: "Cases & Response Analytics", subtitle: "History and performance" },
};

const Index = () => {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [now, setNow] = useState(new Date());
  const [externalEvents, setExternalEvents] = useState<FeedItem[]>([]);
  const [view, setView] = useState<ViewKey>("overview");

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

  const handleSelect = (k: ViewKey) => {
    if (k === "triage") {
      setAssistantOpen(true);
      return;
    }
    setView(k);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full text-foreground">
        <AlarmOverlay active={mode === "emergency"} />

        <AppSidebar
          active={view}
          onSelect={handleSelect}
          emergency={mode === "emergency"}
          onSOS={() => setAssistantOpen(true)}
        />

        <SidebarInset className="relative">
          <div className="grid-pattern absolute inset-0 opacity-30 pointer-events-none" />

          {/* Top bar */}
          <header className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 pt-4 pb-3 border-b border-border/40">
            <div className="flex items-center gap-2 min-w-0">
              <SidebarTrigger className="text-foreground hover:text-primary" />
              <div className="min-w-0">
                <h1 className="font-display text-base sm:text-lg font-bold tracking-wide truncate">
                  {VIEW_TITLES[view].title}
                </h1>
                <p className="font-mono text-[10px] tracking-widest text-muted-foreground truncate">
                  {VIEW_TITLES[view].subtitle.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
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

          <main className="relative z-10 px-4 sm:px-6 py-6 pb-24">
            {view === "overview" && (
              <OverviewView
                mode={mode}
                triage={triage}
                onOpenAssistant={() => setAssistantOpen(true)}
                assistantOpen={assistantOpen}
                externalEvents={externalEvents}
              />
            )}

            {view === "monitor" && <MonitorView mode={mode} />}

            {view === "feed" && (
              <SinglePanel>
                <LiveFeed emergency={mode === "emergency"} externalEvents={externalEvents} />
              </SinglePanel>
            )}

            {view === "hospitals" && (
              <SinglePanel>
                <HospitalsPanel />
              </SinglePanel>
            )}

            {view === "navigation" && (
              <SinglePanel>
                <NavigationPanel emergency={mode === "emergency"} />
              </SinglePanel>
            )}

            {view === "emergency" && (
              <SinglePanel>
                <EmergencyServices active={mode === "emergency"} etaMinutes={triage?.est_response_minutes || 6} />
              </SinglePanel>
            )}

            {view === "analytics" && (
              <SinglePanel wide>
                <AnalyticsPanel />
              </SinglePanel>
            )}
          </main>

          <footer className="relative z-10 px-4 sm:px-6 pb-6 flex items-center justify-between border-t border-border/40 pt-4">
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
              © RCRS · v1.0 · Encrypted telemetry
            </p>
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
              Powered by Lovable AI
            </p>
          </footer>
        </SidebarInset>

        <AIAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} onResult={onTriage} />
      </div>
    </SidebarProvider>
  );
};

function SinglePanel({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto ${wide ? "max-w-5xl" : "max-w-3xl"} animate-fade-up`}>
      {children}
    </div>
  );
}

function MonitorView({ mode }: { mode: Mode }) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div
        className={`glass-panel rounded-3xl p-2 sm:p-3 relative overflow-hidden ${
          mode === "emergency" ? "animate-flash-border" : ""
        }`}
      >
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <Hotel className="w-4 h-4 text-primary" />
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground">3D LIVE MONITOR</span>
        </div>
        <div className="h-[60vh] min-h-[480px] rounded-2xl overflow-hidden relative">
          <Building3D mode={mode} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center font-mono tracking-widest">
        DRAG TO ROTATE · SCROLL TO ZOOM · LIGHTING REFLECTS BUILDING STATE
      </p>
    </div>
  );
}

interface OverviewProps {
  mode: Mode;
  triage: TriageResult | null;
  onOpenAssistant: () => void;
  assistantOpen: boolean;
  externalEvents: FeedItem[];
}

function OverviewView({ mode, onOpenAssistant, assistantOpen }: OverviewProps) {
  const features = [
    { icon: Hotel, title: "3D Live Monitor", desc: "Real-time building telemetry with lighting that reflects current state." },
    { icon: Brain, title: "AI Triage", desc: "Voice or text symptom analysis classifies severity in seconds." },
    { icon: Radio, title: "Incident Feed", desc: "Streaming AI decisions, location pings, and movement alerts." },
    { icon: MapPin, title: "Smart Navigation", desc: "Auto-routes occupants to the nearest safe zone or exit." },
    { icon: Siren, title: "Emergency Dispatch", desc: "Direct coordination with responders and live ETA tracking." },
    { icon: Shield, title: "Hospitals & Analytics", desc: "Nearby trauma centers and performance history at a glance." },
  ];

  return (
    <section className="max-w-5xl mx-auto space-y-8 animate-fade-up">
      {/* Hero introduction */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-emergency/15 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 mb-4">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="font-mono text-[10px] tracking-widest text-primary">RAPID CRISIS RESPONSE SYSTEM</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            AI-powered safety for hotels, malls & hospitality
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            RCRS unifies smart SOS, AI triage, live 3D monitoring, and emergency dispatch into one neon command center —
            built to detect, decide, and respond in seconds.
          </p>
        </div>
      </div>

      {/* SOS + Describe symptoms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="glass-panel rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emergency/20 blur-3xl pointer-events-none" />
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">SMART SOS</p>
          <h2 className="font-display text-xl font-semibold mb-6">Emergency activation</h2>
          <SOSButton onTrigger={onOpenAssistant} active={assistantOpen || mode === "emergency"} />
          <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
            Auto-triggers on panic voice or sudden fall. Tap to launch AI triage.
          </p>
        </div>

        <button
          onClick={onOpenAssistant}
          className="glass-panel rounded-3xl p-8 text-left hover:border-primary/60 transition-colors relative overflow-hidden group"
        >
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-1">AI ASSISTANT</p>
          <h2 className="font-display text-xl font-semibold mb-6">Describe symptoms</h2>
          <div className="w-20 h-20 rounded-2xl bg-primary/15 grid place-items-center mx-auto group-hover:bg-primary/25 transition-colors">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-6 leading-relaxed text-center">
            AI assesses any condition · voice or text. Get instant triage and next steps.
          </p>
        </button>
      </div>

      {/* Feature overview */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-4 h-4 text-primary" />
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground">SYSTEM CAPABILITIES</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/40 bg-card/40 p-4 hover:border-primary/40 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-primary/15 grid place-items-center mb-3">
                <f.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-6 text-center font-mono tracking-wider">
          USE THE SIDEBAR TO OPEN ANY MODULE
        </p>
      </div>
    </section>
  );
}

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
          style={{
            width: `${pct}%`,
            boxShadow: `0 0 10px hsl(var(--${tone === "emergency" ? "emergency" : tone === "warning" ? "warning" : "success"}) / 0.7)`,
          }}
        />
      </div>
    </div>
  );
}

export default Index;
