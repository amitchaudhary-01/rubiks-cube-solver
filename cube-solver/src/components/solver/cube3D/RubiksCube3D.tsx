"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const SIZE = 0.95;
const GAP = 0.08;
const STICKER = 0.72;

const COLORS: Record<string, string> = {
  U: "#ffffff",
  D: "#ffd500",
  F: "#00a651",
  B: "#0051ba",
  R: "#c41e3a",
  L: "#ff5800",
};

type RubiksCube3DProps = {
  kociembaString?: string | null;
};

type CubieProps = {
  x: number;
  y: number;
  z: number;

  uColor?: string;
  dColor?: string;
  fColor?: string;
  bColor?: string;
  rColor?: string;
  lColor?: string;
};

function getStickerColor(
  kociembaString: string | null,
  index: number,
  fallback: string,
) {
  if (!kociembaString || kociembaString.length !== 54) {
    return fallback;
  }

  const face = kociembaString[index];

  return COLORS[face] ?? fallback;
}

function Cubie({
  x,
  y,
  z,
  uColor,
  dColor,
  fColor,
  bColor,
  rColor,
  lColor,
}: CubieProps) {
  return (
    <group
      position={[
        x * (SIZE + GAP),
        y * (SIZE + GAP),
        z * (SIZE + GAP),
      ]}
    >
      {/* Black cubie */}
      <mesh>
        <boxGeometry args={[SIZE, SIZE, SIZE]} />
        <meshStandardMaterial
          color="#111111"
          roughness={0.3}
        />
      </mesh>

      {/* U */}
      {y === 1 && (
        <mesh position={[0, SIZE / 2 + 0.015, 0]}>
          <boxGeometry args={[STICKER, 0.025, STICKER]} />
          <meshStandardMaterial color={uColor ?? COLORS.U} />
        </mesh>
      )}

      {/* D */}
      {y === -1 && (
        <mesh position={[0, -SIZE / 2 - 0.015, 0]}>
          <boxGeometry args={[STICKER, 0.025, STICKER]} />
          <meshStandardMaterial color={dColor ?? COLORS.D} />
        </mesh>
      )}

      {/* F */}
      {z === 1 && (
        <mesh position={[0, 0, SIZE / 2 + 0.015]}>
          <boxGeometry args={[STICKER, STICKER, 0.025]} />
          <meshStandardMaterial color={fColor ?? COLORS.F} />
        </mesh>
      )}

      {/* B */}
      {z === -1 && (
        <mesh position={[0, 0, -SIZE / 2 - 0.015]}>
          <boxGeometry args={[STICKER, STICKER, 0.025]} />
          <meshStandardMaterial color={bColor ?? COLORS.B} />
        </mesh>
      )}

      {/* R */}
      {x === 1 && (
        <mesh position={[SIZE / 2 + 0.015, 0, 0]}>
          <boxGeometry args={[0.025, STICKER, STICKER]} />
          <meshStandardMaterial color={rColor ?? COLORS.R} />
        </mesh>
      )}

      {/* L */}
      {x === -1 && (
        <mesh position={[-SIZE / 2 - 0.015, 0, 0]}>
          <boxGeometry args={[0.025, STICKER, STICKER]} />
          <meshStandardMaterial color={lColor ?? COLORS.L} />
        </mesh>
      )}
    </group>
  );
}

function CubeModel({
  kociembaString,
}: {
  kociembaString: string | null;
}) {
  const cubies = [];

  /*
   * Kociemba order:
   *
   * U = 0 - 8
   * R = 9 - 17
   * F = 18 - 26
   * D = 27 - 35
   * L = 36 - 44
   * B = 45 - 53
   */

  /*
   * For now we map the visible stickers
   * using their corresponding face indexes.
   *
   * This gives us the first working
   * scanned-state visualization.
   */

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const uIndex =
          y === 1
            ? getUIndex(x, z)
            : -1;

        const dIndex =
          y === -1
            ? getDIndex(x, z)
            : -1;

        const fIndex =
          z === 1
            ? getFIndex(x, y)
            : -1;

        const bIndex =
          z === -1
            ? getBIndex(x, y)
            : -1;

        const rIndex =
          x === 1
            ? getRIndex(y, z)
            : -1;

        const lIndex =
          x === -1
            ? getLIndex(y, z)
            : -1;

        cubies.push(
          <Cubie
            key={`${x}-${y}-${z}`}
            x={x}
            y={y}
            z={z}
            uColor={
              uIndex >= 0
                ? getStickerColor(
                    kociembaString,
                    uIndex,
                    COLORS.U,
                  )
                : undefined
            }
            dColor={
              dIndex >= 0
                ? getStickerColor(
                    kociembaString,
                    27 + dIndex,
                    COLORS.D,
                  )
                : undefined
            }
            fColor={
              fIndex >= 0
                ? getStickerColor(
                    kociembaString,
                    18 + fIndex,
                    COLORS.F,
                  )
                : undefined
            }
            bColor={
              bIndex >= 0
                ? getStickerColor(
                    kociembaString,
                    45 + bIndex,
                    COLORS.B,
                  )
                : undefined
            }
            rColor={
              rIndex >= 0
                ? getStickerColor(
                    kociembaString,
                    9 + rIndex,
                    COLORS.R,
                  )
                : undefined
            }
            lColor={
              lIndex >= 0
                ? getStickerColor(
                    kociembaString,
                    36 + lIndex,
                    COLORS.L,
                  )
                : undefined
            }
          />,
        );
      }
    }
  }

  return <group>{cubies}</group>;
}

/*
 * Convert our x/z positions into
 * the 3x3 U face index.
 */
function getUIndex(x: number, z: number) {
  const row = 1 - z;
  const col = x + 1;

  return row * 3 + col;
}

/*
 * D face.
 */
function getDIndex(x: number, z: number) {
  const row = z + 1;
  const col = x + 1;

  return row * 3 + col;
}

/*
 * F face.
 */
function getFIndex(x: number, y: number) {
  const row = 1 - y;
  const col = x + 1;

  return row * 3 + col;
}

/*
 * B face.
 */
function getBIndex(x: number, y: number) {
  const row = 1 - y;
  const col = 1 - x;

  return row * 3 + col;
}

/*
 * R face.
 */
function getRIndex(y: number, z: number) {
  const row = 1 - y;
  const col = 1 - z;

  return row * 3 + col;
}

/*
 * L face.
 */
function getLIndex(y: number, z: number) {
  const row = 1 - y;
  const col = z + 1;

  return row * 3 + col;
}

export default function RubiksCube3D({
  kociembaString = null,
}: RubiksCube3DProps) {
  return (
    <div className="h-[620px] w-full overflow-hidden rounded-2xl">
      <Canvas
        camera={{
          position: [5, 5, 7],
          fov: 45,
        }}
      >
        <color
          attach="background"
          args={["#09090b"]}
        />

        <ambientLight intensity={2} />

        <directionalLight
          position={[5, 8, 5]}
          intensity={4}
        />

        <directionalLight
          position={[-5, 3, 5]}
          intensity={2}
        />

        <CubeModel
          kociembaString={kociembaString}
        />

        <OrbitControls
          enableRotate
          enableZoom
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}