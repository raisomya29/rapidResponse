import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function Orb({ active }: { active: boolean }) {
  const core = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (core.current) {
      const s = 1 + Math.sin(t * (active ? 6 : 2.5)) * (active ? 0.08 : 0.04);
      core.current.scale.setScalar(s);
    }
    if (ring1.current) ring1.current.rotation.x = t * 0.6;
    if (ring1.current) ring1.current.rotation.y = t * 0.4;
    if (ring2.current) ring2.current.rotation.x = -t * 0.5;
    if (ring2.current) ring2.current.rotation.z = t * 0.7;
    if (ring3.current) ring3.current.rotation.y = t * 0.9;
    if (ring3.current) ring3.current.rotation.z = -t * 0.3;
  });

  const color = active ? "#ff3050" : "#ff3050";
  return (
    <group>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 3]} intensity={2} color={color} />
      <pointLight position={[-2, -2, -3]} intensity={1.2} color="#ff80a0" />

      <mesh ref={core}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          roughness={0.15}
          metalness={0.4}
          clearcoat={1}
          clearcoatRoughness={0.05}
          toneMapped={false}
        />
      </mesh>
      {/* Inner glow */}
      <mesh scale={1.18}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} toneMapped={false} />
      </mesh>

      <mesh ref={ring1}>
        <torusGeometry args={[1.45, 0.025, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[1.65, 0.018, 16, 100]} />
        <meshStandardMaterial color="#ff80a0" emissive="#ff80a0" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <mesh ref={ring3}>
        <torusGeometry args={[1.85, 0.012, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function SOSButton({
  onTrigger,
  active,
}: {
  onTrigger: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onTrigger}
      aria-label="Trigger SOS emergency"
      className="group relative w-full aspect-square max-w-[280px] mx-auto outline-none focus-visible:ring-2 focus-visible:ring-emergency rounded-full"
    >
      {/* Ripples */}
      <span className="absolute inset-6 rounded-full bg-emergency/30 animate-ripple" />
      <span className="absolute inset-6 rounded-full bg-emergency/30 animate-ripple [animation-delay:0.6s]" />
      <span className="absolute inset-6 rounded-full bg-emergency/30 animate-ripple [animation-delay:1.2s]" />

      <div className="absolute inset-0 rounded-full" style={{ boxShadow: "var(--glow-emergency)" }} />

      <div className="absolute inset-0 animate-pulse-emergency rounded-full" />

      <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
        <Canvas camera={{ position: [0, 0, 5], fov: 38 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Orb active={active} />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-display font-bold text-3xl tracking-[0.3em] text-white drop-shadow-[0_0_12px_rgba(255,48,80,0.9)]">
          SOS
        </span>
        <span className="font-mono text-[10px] tracking-[0.4em] text-white/80 mt-1">TAP TO ACTIVATE</span>
      </div>
    </button>
  );
}

export default SOSButton;
