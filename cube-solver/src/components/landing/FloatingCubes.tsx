"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Cube() {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.rotation.x += delta * 0.25;
    ref.current.rotation.y += delta * 0.4;
  });

  return (
    <group ref={ref}>
      {/* Main cube */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Front - Green */}
      <mesh position={[0, 0, 1.01]}>
        <planeGeometry args={[1.7, 1.7]} />
        <meshStandardMaterial color="#00a651" />
      </mesh>

      {/* Right - Red */}
      <mesh
        position={[1.01, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[1.7, 1.7]} />
        <meshStandardMaterial color="#c41e3a" />
      </mesh>

      {/* Top - White */}
      <mesh
        position={[0, 1.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1.7, 1.7]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export default function FloatingCubes() {
  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-0
        h-full
        w-full
      "
      aria-hidden="true"
    >
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 45,
        }}
        gl={{
          alpha: true,
          antialias: true,
        }}
      >
        <ambientLight intensity={2} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={3}
        />

        {/* Top left */}
        <group position={[-4, 3, 0]} scale={0.7}>
          <Cube />
        </group>

        {/* Top right */}
        <group position={[4, 3, 0]} scale={0.8}>
          <Cube />
        </group>

        {/* Middle left */}
        <group position={[-5, 0, -1]} scale={0.5}>
          <Cube />
        </group>

        {/* Middle right */}
        <group position={[5, 0, -1]} scale={0.55}>
          <Cube />
        </group>

        {/* Bottom left */}
        <group position={[-4, -3, -1]} scale={0.7}>
          <Cube />
        </group>

        {/* Bottom right */}
        <group position={[4, -3, -1]} scale={0.65}>
          <Cube />
        </group>
      </Canvas>
    </div>
  );
}