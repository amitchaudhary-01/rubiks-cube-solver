"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
} from "@react-three/drei";

const COLORS = {
  red: "#D9232E",
  orange: "#F28C28",
  blue: "#1557D6",
  green: "#159447",
  yellow: "#FFD500",
  white: "#F5F5F0",
  black: "#111111",
};

type Position = [number, number, number];

type StickerProps = {
  position: Position;
  rotation: Position;
  color: string;
};

function Sticker({ position, rotation, color }: StickerProps) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[0.27, 0.27]} />

      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Cubelet({
  position,
}: {
  position: Position;
}) {
  const [x, y, z] = position;

  const gap = 1.01;
  const stickerOffset = 0.491;

  const stickers: React.ReactNode[] = [];

  /*
   * RIGHT FACE - RED
   */
  if (x === 1) {
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        stickers.push(
          <Sticker
            key={`right-${row}-${col}`}
            color={COLORS.red}
            position={[
              x * gap + stickerOffset,
              row * 0.31,
              col * 0.31,
            ]}
            rotation={[0, Math.PI / 2, 0]}
          />,
        );
      }
    }
  }

  /*
   * LEFT FACE - ORANGE
   */
  if (x === -1) {
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        stickers.push(
          <Sticker
            key={`left-${row}-${col}`}
            color={COLORS.orange}
            position={[
              x * gap - stickerOffset,
              row * 0.31,
              col * 0.31,
            ]}
            rotation={[0, Math.PI / 2, 0]}
          />,
        );
      }
    }
  }

  /*
   * TOP FACE - YELLOW
   */
  if (y === 1) {
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        stickers.push(
          <Sticker
            key={`top-${row}-${col}`}
            color={COLORS.yellow}
            position={[
              col * 0.31,
              y * gap + stickerOffset,
              row * 0.31,
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          />,
        );
      }
    }
  }

  /*
   * BOTTOM FACE - WHITE
   */
  if (y === -1) {
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        stickers.push(
          <Sticker
            key={`bottom-${row}-${col}`}
            color={COLORS.white}
            position={[
              col * 0.31,
              y * gap - stickerOffset,
              row * 0.31,
            ]}
            rotation={[Math.PI / 2, 0, 0]}
          />,
        );
      }
    }
  }

  /*
   * FRONT FACE - BLUE
   */
  if (z === 1) {
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        stickers.push(
          <Sticker
            key={`front-${row}-${col}`}
            color={COLORS.blue}
            position={[
              col * 0.31,
              row * 0.31,
              z * gap + stickerOffset,
            ]}
            rotation={[0, 0, 0]}
          />,
        );
      }
    }
  }

  /*
   * BACK FACE - GREEN
   */
  if (z === -1) {
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        stickers.push(
          <Sticker
            key={`back-${row}-${col}`}
            color={COLORS.green}
            position={[
              col * 0.31,
              row * 0.31,
              z * gap - stickerOffset,
            ]}
            rotation={[0, Math.PI, 0]}
          />,
        );
      }
    }
  }

  return (
    <group
      position={[
        x * gap,
        y * gap,
        z * gap,
      ]}
    >
      {/* Black cube body */}
      <mesh>
        <boxGeometry args={[0.98, 0.98, 0.98]} />

        <meshBasicMaterial color={COLORS.black} />
      </mesh>

      {/* Individual stickers */}
      {stickers}
    </group>
  );
}

/* =========================================================
   RUBIK'S CUBE
========================================================= */

function RubiksCube() {
  const cubelets: Position[] = [];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubelets.push([x, y, z]);
      }
    }
  }

  return (
    <group
      rotation={[
        THREE.MathUtils.degToRad(-18),
        THREE.MathUtils.degToRad(-32),
        0,
      ]}
    >
      {cubelets.map((position) => (
        <Cubelet
          key={position.join("-")}
          position={position}
        />
      ))}
    </group>
  );
}

/* =========================================================
   SCENE
========================================================= */

function CubeScene() {
  return (
    <>
      <ambientLight intensity={2} />

      <directionalLight
        position={[5, 8, 6]}
        intensity={4}
      />

      <directionalLight
        position={[-5, 4, 5]}
        intensity={2}
      />

      <pointLight
        position={[0, 5, 5]}
        intensity={1.5}
      />

      <Environment preset="studio" />

      <Float
        speed={1.2}
        rotationIntensity={0.15}
        floatIntensity={0.15}
      >
        <RubiksCube />
      </Float>

      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.35}
        scale={8}
        blur={2.8}
        far={4}
      />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.8}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RealisticCube() {
  return (
    <div className="relative h-[380px] w-full sm:h-[460px]">

      {/* Soft background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/70 blur-3xl" />

      {/* Three.js */}
      <div className="relative h-full w-full">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
          }}
          camera={{
            position: [5.2, 4.2, 6.5],
            fov: 42,
          }}
        >
          <CubeScene />
        </Canvas>
      </div>

      {/* Label */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-green-700 shadow-md">
        Smart Cube Scanner
      </div>
    </div>
  );
}







// "use client";

// import * as THREE from "three";
// import { Canvas } from "@react-three/fiber";
// import {
//   ContactShadows,
//   Environment,
//   Float,
//   OrbitControls,
// } from "@react-three/drei";

// const COLORS = {
//   red: "#D9232E",
//   orange: "#F28C28",
//   blue: "#1557D6",
//   green: "#159447",
//   yellow: "#FFD500",
//   white: "#F5F5F0",
//   black: "#111111",
// };

// type Position = [number, number, number];

// type StickerProps = {
//   position: Position;
//   rotation: Position;
//   color: string;
// };

// /* =========================================================
//    SINGLE STICKER
// ========================================================= */

// function Sticker({
//   position,
//   rotation,
//   color,
// }: StickerProps) {
//   return (
//     <mesh
//       position={position}
//       rotation={rotation}
//     >
//       <planeGeometry args={[0.82, 0.82]} />

//       <meshBasicMaterial
//         color={color}
//         side={THREE.DoubleSide}
//       />
//     </mesh>
//   );
// }

// /* =========================================================
//    CUBELET
//    ONE sticker per exposed face.
//    Total across the whole cube = exactly 54 stickers.
// ========================================================= */

// function Cubelet({
//   position,
// }: {
//   position: Position;
// }) {
//   const [x, y, z] = position;

//   const gap = 1.01;
//   const cubeletSize = 0.98;

//   // Sticker sits just outside the cubelet face.
//   const stickerOffset = cubeletSize / 2 + 0.006;

//   return (
//     <group
//       position={[
//         x * gap,
//         y * gap,
//         z * gap,
//       ]}
//     >
//       {/* =====================================================
//           BLACK CUBE BODY
//       ====================================================== */}

//       <mesh>
//         <boxGeometry
//           args={[
//             cubeletSize,
//             cubeletSize,
//             cubeletSize,
//           ]}
//         />

//         <meshBasicMaterial
//           color={COLORS.black}
//         />
//       </mesh>

//       {/* =====================================================
//           RIGHT - RED
//       ====================================================== */}

//       {x === 1 && (
//         <Sticker
//           color={COLORS.red}
//           position={[
//             stickerOffset,
//             0,
//             0,
//           ]}
//           rotation={[
//             0,
//             Math.PI / 2,
//             0,
//           ]}
//         />
//       )}

//       {/* =====================================================
//           LEFT - ORANGE
//       ====================================================== */}

//       {x === -1 && (
//         <Sticker
//           color={COLORS.orange}
//           position={[
//             -stickerOffset,
//             0,
//             0,
//           ]}
//           rotation={[
//             0,
//             Math.PI / 2,
//             0,
//           ]}
//         />
//       )}

//       {/* =====================================================
//           TOP - YELLOW
//       ====================================================== */}

//       {y === 1 && (
//         <Sticker
//           color={COLORS.yellow}
//           position={[
//             0,
//             stickerOffset,
//             0,
//           ]}
//           rotation={[
//             -Math.PI / 2,
//             0,
//             0,
//           ]}
//         />
//       )}

//       {/* =====================================================
//           BOTTOM - WHITE
//       ====================================================== */}

//       {y === -1 && (
//         <Sticker
//           color={COLORS.white}
//           position={[
//             0,
//             -stickerOffset,
//             0,
//           ]}
//           rotation={[
//             Math.PI / 2,
//             0,
//             0,
//           ]}
//         />
//       )}

//       {/* =====================================================
//           FRONT - BLUE
//       ====================================================== */}

//       {z === 1 && (
//         <Sticker
//           color={COLORS.blue}
//           position={[
//             0,
//             0,
//             stickerOffset,
//           ]}
//           rotation={[
//             0,
//             0,
//             0,
//           ]}
//         />
//       )}

//       {/* =====================================================
//           BACK - GREEN
//       ====================================================== */}

//       {z === -1 && (
//         <Sticker
//           color={COLORS.green}
//           position={[
//             0,
//             0,
//             -stickerOffset,
//           ]}
//           rotation={[
//             0,
//             Math.PI,
//             0,
//           ]}
//         />
//       )}
//     </group>
//   );
// }

// /* =========================================================
//    COMPLETE 3 × 3 × 3 RUBIK'S CUBE
// ========================================================= */

// function RubiksCube() {
//   const cubelets: Position[] = [];

//   for (let x = -1; x <= 1; x++) {
//     for (let y = -1; y <= 1; y++) {
//       for (let z = -1; z <= 1; z++) {
//         cubelets.push([x, y, z]);
//       }
//     }
//   }

//   return (
//     <group
//       rotation={[
//         THREE.MathUtils.degToRad(-18),
//         THREE.MathUtils.degToRad(-32),
//         0,
//       ]}
//     >
//       {cubelets.map((position) => (
//         <Cubelet
//           key={position.join("-")}
//           position={position}
//         />
//       ))}
//     </group>
//   );
// }

// /* =========================================================
//    3D SCENE
// ========================================================= */

// function CubeScene() {
//   return (
//     <>
//       <ambientLight intensity={2} />

//       <directionalLight
//         position={[5, 8, 6]}
//         intensity={4}
//       />

//       <directionalLight
//         position={[-5, 4, 5]}
//         intensity={2}
//       />

//       <pointLight
//         position={[0, 5, 5]}
//         intensity={1.5}
//       />

//       <Environment preset="studio" />

//       <Float
//         speed={1.2}
//         rotationIntensity={0.15}
//         floatIntensity={0.15}
//       >
//         <RubiksCube />
//       </Float>

//       <ContactShadows
//         position={[0, -1.8, 0]}
//         opacity={0.35}
//         scale={8}
//         blur={2.8}
//         far={4}
//       />

//       <OrbitControls
//         enablePan={false}
//         enableZoom={false}
//         autoRotate
//         autoRotateSpeed={0.8}
//         minPolarAngle={Math.PI / 3}
//         maxPolarAngle={Math.PI / 1.8}
//       />
//     </>
//   );
// }

// /* =========================================================
//    MAIN COMPONENT
// ========================================================= */

// export default function RealisticCube() {
//   return (
//     <div className="relative h-[380px] w-full sm:h-[460px]">

//       {/* Background glow */}
//       <div
//         className="
//           pointer-events-none
//           absolute
//           left-1/2
//           top-1/2
//           h-[260px]
//           w-[260px]
//           -translate-x-1/2
//           -translate-y-1/2
//           rounded-full
//           bg-blue-100/70
//           blur-3xl
//         "
//       />

//       {/* Three.js Canvas */}
//       <div className="relative h-full w-full">
//         <Canvas
//           shadows
//           dpr={[1, 2]}
//           gl={{
//             antialias: true,
//             alpha: true,
//           }}
//           camera={{
//             position: [5.2, 4.2, 6.5],
//             fov: 42,
//           }}
//         >
//           <CubeScene />
//         </Canvas>
//       </div>

//       {/* Label */}
//       <div
//         className="
//           absolute
//           bottom-3
//           left-1/2
//           -translate-x-1/2
//           whitespace-nowrap
//           rounded-lg
//           border
//           border-gray-200
//           bg-white
//           px-4
//           py-2
//           text-xs
//           font-medium
//           text-gray-600
//           shadow-md
//         "
//       >
//         Smart Cube Scanner
//       </div>
//     </div>
//   );
// }

