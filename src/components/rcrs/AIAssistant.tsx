import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send, Loader2, ShieldCheck, AlertTriangle, Siren } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VoiceWave } from "./VoiceWave";

export type Severity = "NORMAL" | "MODERATE" | "CRITICAL";
export interface TriageResult {
  severity: Severity;
  condition: string;
  explanation: string;
  steps: string[];
  ambulance_needed: boolean;
  est_response_minutes: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onResult: (r: TriageResult) => void;
}

// Web Speech API types (loose)
type SR = any;

export function AIAssistant({ open, onClose, onResult }: Props) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const recognitionRef = useRef<SR | null>(null);

  useEffect(() => {
    if (!open) {
      setText("");
      setResult(null);
      setLoading(false);
      stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startListening = () => {
    const W = window as any;
    const SpeechRecognition = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input not supported in this browser. Please type your symptoms.");
      return;
    }
    const rec: SR = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      let s = "";
      for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript;
      setText(s);
    };
    rec.onerror = (e: any) => {
      console.warn("speech error", e);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setListening(false);
  };

  const submit = async () => {
    const desc = text.trim();
    if (desc.length < 2) {
      toast.error("Please describe your symptoms or situation.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("triage", {
        body: { description: desc },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const r = data as TriageResult;
      setResult(r);
      onResult(r);
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "AI triage failed";
      if (msg.includes("Rate") || msg.includes("429")) toast.error("Rate limit hit. Try again in a moment.");
      else if (msg.includes("credits") || msg.includes("402")) toast.error("AI credits depleted. Add funds in Workspace > Usage.");
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const severityStyles: Record<Severity, { ring: string; glow: string; label: string; icon: JSX.Element }> = {
    NORMAL: {
      ring: "border-success/60",
      glow: "shadow-[0_0_40px_hsl(var(--success)/0.4)]",
      label: "NORMAL · SAFE",
      icon: <ShieldCheck className="w-5 h-5 text-success" />,
    },
    MODERATE: {
      ring: "border-warning/70",
      glow: "shadow-[0_0_40px_hsl(var(--warning)/0.4)]",
      label: "MODERATE · MONITOR",
      icon: <AlertTriangle className="w-5 h-5 text-warning" />,
    },
    CRITICAL: {
      ring: "border-emergency",
      glow: "shadow-[0_0_60px_hsl(var(--emergency)/0.6)]",
      label: "CRITICAL · EMERGENCY",
      icon: <Siren className="w-5 h-5 text-emergency" />,
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-up">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h2 className="font-display font-semibold text-lg tracking-wide">RCRS AI Triage</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-mono tracking-wider"
          >
            CLOSE ✕
          </button>
        </div>

        {!result && (
          <div className="space-y-5">
            <div>
              <p className="text-foreground/90 mb-1">Describe your problem or symptoms</p>
              <p className="text-sm text-muted-foreground">
                Use plain language — voice or text. AI will assess severity and respond instantly.
              </p>
            </div>

            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="e.g. I feel dizzy and my chest hurts when I breathe…"
              className="w-full rounded-2xl bg-secondary/40 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 p-4 text-foreground placeholder:text-muted-foreground/60 resize-none transition-colors"
            />

            <div className="rounded-2xl bg-background/40 border border-border p-3">
              <VoiceWave active={listening} />
              <p className="text-center text-xs font-mono tracking-widest text-muted-foreground mt-1">
                {listening ? "LISTENING…" : "VOICE INPUT IDLE"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={listening ? stopListening : startListening}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-medium transition-all border ${
                  listening
                    ? "bg-emergency/15 border-emergency text-emergency"
                    : "bg-secondary/60 border-border text-foreground hover:bg-secondary"
                }`}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {listening ? "Stop voice" : "Voice input"}
              </button>
              <button
                onClick={submit}
                disabled={loading || !text.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold bg-primary text-primary-foreground hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: "var(--glow-active)" }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? "Analyzing…" : "Analyze with AI"}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className={`space-y-4 rounded-2xl border ${severityStyles[result.severity].ring} ${severityStyles[result.severity].glow} bg-background/40 p-5 animate-fade-up`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs tracking-widest">
                {severityStyles[result.severity].icon}
                <span
                  className={
                    result.severity === "CRITICAL"
                      ? "neon-text-emergency"
                      : result.severity === "MODERATE"
                      ? "neon-text-warning"
                      : "neon-text-safe"
                  }
                >
                  {severityStyles[result.severity].label}
                </span>
              </div>
              {result.ambulance_needed && (
                <span className="font-mono text-[10px] tracking-widest text-emergency animate-pulse">
                  AMBULANCE DISPATCHED
                </span>
              )}
            </div>

            <div>
              <h3 className="font-display font-semibold text-xl">{result.condition}</h3>
              <p className="text-muted-foreground mt-1">{result.explanation}</p>
            </div>

            <div className="space-y-2">
              <p className="font-mono text-xs tracking-widest text-muted-foreground">IMMEDIATE STEPS</p>
              <ol className="space-y-2">
                {result.steps.map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-3 items-start rounded-xl border border-border bg-secondary/30 p-3 animate-fade-up"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <span
                      className={`flex-none w-7 h-7 rounded-lg grid place-items-center font-mono text-sm font-semibold ${
                        result.severity === "CRITICAL"
                          ? "bg-emergency/20 text-emergency"
                          : result.severity === "MODERATE"
                          ? "bg-warning/20 text-warning"
                          : "bg-success/20 text-success"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setResult(null);
                  setText("");
                }}
                className="flex-1 rounded-2xl px-4 py-3 font-medium border border-border bg-secondary/60 hover:bg-secondary transition"
              >
                New assessment
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl px-4 py-3 font-semibold bg-primary text-primary-foreground hover:brightness-110 transition"
              >
                Acknowledge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIAssistant;
