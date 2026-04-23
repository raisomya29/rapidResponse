import { Ambulance, Hospital, PhoneCall } from "lucide-react";

interface Props {
  active: boolean;
  etaMinutes?: number;
}

export function EmergencyServices({ active, etaMinutes = 6 }: Props) {
  if (!active) {
    return (
      <div className="glass-panel rounded-2xl p-5 h-full">
        <div className="flex items-center gap-2 mb-3">
          <Hospital className="w-4 h-4 text-success" />
          <h3 className="font-display font-semibold tracking-wide">Emergency Services</h3>
        </div>
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <p className="text-sm text-success font-medium">All clear · standby</p>
          <p className="text-xs text-muted-foreground mt-1">
            No critical events. Services activate automatically when AI triage flags CRITICAL.
          </p>
        </div>
        <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
          <li className="flex justify-between"><span>Nearest hospital</span><span>St. Marina · 1.4 km</span></li>
          <li className="flex justify-between"><span>On-site medics</span><span>2 available</span></li>
          <li className="flex justify-between"><span>Defibrillators</span><span>4 stations</span></li>
        </ul>
      </div>
    );
  }

  return (
    <div className="glass-panel-emergency rounded-2xl p-5 h-full animate-flash-border">
      <div className="flex items-center gap-2 mb-3">
        <Ambulance className="w-4 h-4 text-emergency" />
        <h3 className="font-display font-semibold tracking-wide neon-text-emergency">Emergency Dispatch</h3>
      </div>

      <div className="rounded-xl border border-emergency/50 bg-emergency/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-widest text-emergency">AMBULANCE EN ROUTE</span>
          <span className="font-mono text-xs text-emergency animate-pulse">● LIVE</span>
        </div>
        <div className="flex items-end justify-between">
          <p className="font-display text-3xl font-bold text-emergency">{etaMinutes}<span className="text-base font-normal text-muted-foreground"> min ETA</span></p>
          <button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-emergency text-emergency-foreground font-semibold text-sm hover:brightness-110 transition" style={{ boxShadow: "var(--glow-emergency)" }}>
            <PhoneCall className="w-4 h-4" /> Call 911
          </button>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-xs">
        <li className="flex justify-between"><span className="text-muted-foreground">Hospital</span><span>St. Marina General</span></li>
        <li className="flex justify-between"><span className="text-muted-foreground">Distance</span><span>1.4 km</span></li>
        <li className="flex justify-between"><span className="text-muted-foreground">Trauma center</span><span className="text-success">Level II</span></li>
        <li className="flex justify-between"><span className="text-muted-foreground">Unit</span><span>MEDIC-01</span></li>
      </ul>
    </div>
  );
}

export default EmergencyServices;
