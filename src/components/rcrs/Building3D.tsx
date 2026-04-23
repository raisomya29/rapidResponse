import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Mode = "safe" | "warning" | "emergency";

const COLORS = {
  safe: { primary: "#22e07a", glow: "#22e07a", ambient: "#0c2a18" },
  warning: { primary: "#ffb020", glow: "#ffb020", ambient: "#2a1f0a" },
  emergency: { primary: "#ff3050", glow: "#ff3050", ambient: "#2a0a12" },
};

function Floor({ y, index, mode, label }: { y: number; index: number; mode: Mode; label: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const c = COLORS[mode];
  return (
    <group position={[0, y, 0]}>
      {/* Slab */}
      <mesh ref={ref} castShadow receiveShadow>
        <boxGeometry args={[7, 0.18, 5]} />
        <meshStandardMaterial color="#0d1726" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Glass walls */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[6.8, 1.6, 4.8]} />
        <meshPhysicalMaterial
          color={c.primary}
          transparent
          opacity={0.08}
          roughness={0.05}
          metalness={0.2}
          transmission={0.9}
          thickness={0.5}
          emissive={c.glow}
          emissiveIntensity={mode === "emergency" ? 0.6 : mode === "warning" ? 0.3 : 0.15}
        />
      </mesh>
      {/* Edge lights */}
      <mesh position={[0, 1.66, 0]}>
        <boxGeometry args={[6.85, 0.04, 4.85]} />
        <meshStandardMaterial color={c.primary} emissive={c.primary} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {/* Inner partitions (rooms) */}
      {[-2, 0, 2].map((x) => (
        <mesh key={`p-${index}-${x}`} position={[x, 0.85, 0]}>
          <boxGeometry args={[0.05, 1.55, 4.6]} />
          <meshStandardMaterial color="#1a2942" emissive={c.glow} emissiveIntensity={0.05} />
        </mesh>
      ))}
      {/* Floor label */}
      <Html position={[3.6, 0.4, 0]} center distanceFactor={10}>
        <div className="pointer-events-none select-none font-mono text-[10px] tracking-widest text-primary/80">
          {label}
        </div>
      </Html>
    </group>
  );
}

function Person({ floorY, color, speed, radius, offset }: { floorY: number; color: string; speed: number; radius: number; offset: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const trail = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius * 0.7;
    if (ref.current) {
      ref.current.position.set(x, floorY + 0.35, z);
    }
    if (trail.current) {
      trail.current.position.set(x, floorY + 0.1, z);
      const m = trail.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.35 + Math.sin(t * 4) * 0.15;
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <mesh ref={trail} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.32, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function ZoneMarker({ position, color, type }: { position: [number, number, number]; color: string; type: "danger" | "safe" }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
      ref.current.scale.set(s, 1, s);
    }
  });
  return (
    <group position={position}>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.18, 0.4, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={type === "danger" ? 1.2 : 0.6} distance={3} />
    </group>
  );
}

function Building({ mode }: { mode: Mode }) {
  const group = useRef<THREE.Group>(null);
  const floors = useMemo(
    () => [
      { y: 0, label: "L01 LOBBY" },
      { y: 1.85, label: "L02 RESTAURANT" },
      { y: 3.7, label: "L03 ROOMS" },
      { y: 5.55, label: "L04 ROOMS" },
      { y: 7.4, label: "L05 SPA" },
    ],
    []
  );

  useFrame(({ clock }) => {
    if (group.current) {
      // gentle idle sway
      group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.05 + group.current.rotation.y * 0.999;
    }
  });

  return (
    <group ref={group} position={[0, -3.5, 0]}>
      {/* Base platform */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <cylinderGeometry args={[5.5, 6, 0.5, 64]} />
        <meshStandardMaterial color="#070d18" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.2, 5.5, 64]} />
        <meshBasicMaterial color={COLORS[mode].primary} toneMapped={false} />
      </mesh>

      {floors.map((f, i) => (
        <Floor key={i} y={f.y} index={i} mode={mode} label={f.label} />
      ))}

      {/* Roof */}
      <mesh position={[0, 8.45, 0]}>
        <boxGeometry args={[7.2, 0.25, 5.2]} />
        <meshStandardMaterial color="#0d1726" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 8.7, 0]}>
        <coneGeometry args={[0.4, 0.8, 4]} />
        <meshStandardMaterial color={COLORS[mode].primary} emissive={COLORS[mode].primary} emissiveIntensity={1.5} toneMapped={false} />
      </mesh>

      {/* People on each floor */}
      {floors.map((f, i) => (
        <group key={`ppl-${i}`}>
          <Person floorY={f.y + 0.1} color="#3ec1ff" speed={0.4 + i * 0.1} radius={1.8} offset={i * 1.1} />
          <Person floorY={f.y + 0.1} color="#3ec1ff" speed={0.3 + i * 0.05} radius={2.4} offset={i * 0.7 + 1} />
          {mode === "emergency" && i === 2 && (
            <Person floorY={f.y + 0.1} color="#ff3050" speed={0.6} radius={1.2} offset={2.2} />
          )}
        </group>
      ))}

      {/* Zone markers */}
      {mode === "emergency" && <ZoneMarker position={[1.5, 3.85, 0.5]} color="#ff3050" type="danger" />}
      <ZoneMarker position={[-2.5, 0.15, -1.5]} color="#22e07a" type="safe" />
      <ZoneMarker position={[2.5, 7.55, 1.5]} color="#22e07a" type="safe" />
    </group>
  );
}

function Scene({ mode }: { mode: Mode }) {
  const c = COLORS[mode];
  return (
    <>
      <color attach="background" args={["#03060d"]} />
      <fog attach="fog" args={["#03060d", 14, 30]} />
      <ambientLight intensity={0.35} color={c.ambient} />
      <directionalLight position={[6, 10, 6]} intensity={0.7} color="#7fc8ff" />
      <pointLight position={[0, 6, 6]} intensity={1.2} color={c.glow} distance={20} />
      <pointLight position={[-6, 2, -4]} intensity={0.6} color="#3ec1ff" distance={18} />

      <Building mode={mode} />

      {/* Grid floor */}
      <gridHelper args={[40, 40, c.primary, "#0a1424"]} position={[0, -3.95, 0]} />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={8}
        maxDistance={24}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </>
  );
}

export function Building3D({ mode = "safe" }: { mode?: Mode }) {
  const [hint, setHint] = useState(true);
  return (
    <div className="relative w-full h-full min-h-[420px]">
      <Canvas
        shadows
        camera={{ position: [10, 4, 12], fov: 45 }}
        dpr={[1, 2]}
        onPointerDown={() => setHint(false)}
      >
        <Suspense fallback={null}>
          <Scene mode={mode} />
        </Suspense>
      </Canvas>
      {hint && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full glass-panel font-mono text-[10px] tracking-widest text-primary/80 pointer-events-none">
          DRAG TO ROTATE · SCROLL TO ZOOM
        </div>
      )}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md glass-panel font-mono text-[10px] tracking-widest">
        <span className={mode === "emergency" ? "neon-text-emergency" : mode === "warning" ? "neon-text-warning" : "neon-text-safe"}>
          ● {mode === "emergency" ? "EMERGENCY MODE" : mode === "warning" ? "WARNING MODE" : "ALL CLEAR"}
        </span>
      </div>
    </div>
  );
}

export default Building3D;
