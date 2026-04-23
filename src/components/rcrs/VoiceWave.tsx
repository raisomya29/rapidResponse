export function VoiceWave({ active }: { active: boolean }) {
  const bars = Array.from({ length: 28 });
  return (
    <div className="flex items-center justify-center gap-[3px] h-12">
      {bars.map((_, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-primary"
          style={{
            height: `${20 + (i % 5) * 10}%`,
            animation: active ? `wave-bar 0.${5 + (i % 5)}s ease-in-out ${i * 0.04}s infinite` : "none",
            opacity: active ? 1 : 0.3,
            boxShadow: active ? "0 0 8px hsl(var(--primary) / 0.8)" : "none",
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}

export default VoiceWave;
