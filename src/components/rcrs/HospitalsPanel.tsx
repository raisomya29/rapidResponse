import { useState } from "react";
import { Hospital, MapPin, Navigation, Phone, Stethoscope } from "lucide-react";

interface HospitalEntry {
  name: string;
  type: "General" | "Trauma" | "Cardiac" | "Pediatric";
  level: string;
  distanceKm: number;
  etaMin: number;
  phone: string;
  address: string;
  open247: boolean;
}

const HOSPITALS: HospitalEntry[] = [
  {
    name: "St. Marina General",
    type: "Trauma",
    level: "Level II Trauma",
    distanceKm: 1.4,
    etaMin: 6,
    phone: "+1 (415) 555-0142",
    address: "120 Marina Blvd · Bay District",
    open247: true,
  },
  {
    name: "Lakeside Medical Center",
    type: "Cardiac",
    level: "Cardiac Specialty",
    distanceKm: 2.1,
    etaMin: 9,
    phone: "+1 (415) 555-0188",
    address: "455 Lake View Ave · Northgate",
    open247: true,
  },
  {
    name: "Greenfield Children's Hospital",
    type: "Pediatric",
    level: "Pediatric ER",
    distanceKm: 3.4,
    etaMin: 13,
    phone: "+1 (415) 555-0211",
    address: "78 Greenfield Pkwy · Riverside",
    open247: true,
  },
  {
    name: "Harborview Community",
    type: "General",
    level: "General Care",
    distanceKm: 4.7,
    etaMin: 18,
    phone: "+1 (415) 555-0307",
    address: "990 Harbor Rd · Pier 9",
    open247: false,
  },
];

const TYPE_TONE: Record<HospitalEntry["type"], string> = {
  Trauma: "text-emergency border-emergency/40 bg-emergency/10",
  Cardiac: "text-warning border-warning/40 bg-warning/10",
  Pediatric: "text-primary border-primary/40 bg-primary/10",
  General: "text-success border-success/40 bg-success/10",
};

export function HospitalsPanel() {
  const [active, setActive] = useState(0);

  return (
    <div className="glass-panel rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Hospital className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold tracking-wide">Nearby Hospitals</h3>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-success flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          {HOSPITALS.length} ONLINE
        </span>
      </div>

      <ul className="space-y-2 flex-1">
        {HOSPITALS.map((h, i) => {
          const isActive = i === active;
          return (
            <li
              key={h.name}
              className={`rounded-xl border bg-background/40 p-3 transition cursor-pointer ${
                isActive ? "border-primary/60 shadow-[0_0_20px_hsl(var(--primary)/0.25)]" : "border-border hover:border-foreground/20"
              }`}
              onClick={() => setActive(i)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-semibold text-sm truncate">{h.name}</p>
                    <span className={`font-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded border ${TYPE_TONE[h.type]}`}>
                      {h.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                    <Stethoscope className="w-3 h-3" /> {h.level}
                  </p>
                </div>
                <div className="text-right flex-none">
                  <p className="font-display text-sm font-semibold tabular-nums">{h.distanceKm} km</p>
                  <p className="font-mono text-[10px] tracking-widest text-muted-foreground">ETA {h.etaMin}m</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
                  <MapPin className="w-3 h-3 flex-none" />
                  <span className="truncate">{h.address}</span>
                </div>
                <span className={`font-mono text-[9px] tracking-widest ${h.open247 ? "text-success" : "text-warning"}`}>
                  {h.open247 ? "24/7" : "DAYTIME"}
                </span>
              </div>

              <div className="flex gap-2 mt-3">
                <a
                  href={`tel:${h.phone.replace(/[^+\d]/g, "")}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition"
                  style={{ boxShadow: "var(--glow-active)" }}
                  aria-label={`Call ${h.name}`}
                >
                  <Phone className="w-3 h-3" />
                  <span className="font-mono tabular-nums">{h.phone}</span>
                </a>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 border border-border bg-secondary/60 hover:bg-secondary text-xs transition"
                  aria-label={`Navigate to ${h.name}`}
                >
                  <Navigation className="w-3 h-3" /> Route
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="font-mono text-[10px] tracking-widest text-muted-foreground mt-3 pt-3 border-t border-border/60 text-center">
        EMERGENCY · DIAL 911
      </p>
    </div>
  );
}

export default HospitalsPanel;
