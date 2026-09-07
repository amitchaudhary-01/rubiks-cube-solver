"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const SIZE = 0.95;
const GAP = 0.08;
const STEP = SIZE + GAP;
const STICKER = 0.72;

const COLORS: Record<string, string> = {
  U: "#ffffff",
  D: "#ffd500",
  F: "#00a651",
  B: "#0051ba",
  R: "#c41e3a",
  L: "#ff5800",
};

type Face = "U" | "R" | "F" | "D" | "L" | "B";

type CubieData = {
  id: string;

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

type Move = {
  face: Face;
  amount: 1 | 2 | -1;
  notation: string;
};

type RubiksCube3DProps = {
  kociembaString?: string | null;
  solution?: string;
  autoPlay?: boolean;
  moveDuration?: number;
};

/* ========================================================= */
/* KOCIEMBA STRING                                           */
/* ========================================================= */

function getStickerColor(
  kociembaString: string | null,
  index: number,
  fallback: string,
) {
  if (!kociembaString || kociembaString.length !== 54) {
    return fallback;
  }

  return COLORS[kociembaString[index]] ?? fallback;
}

/* ========================================================= */
/* FACE INDEX MAPPING                                        */
/* ========================================================= */

function getUIndex(x: number, z: number) {
  return (1 - z) * 3 + (x + 1);
}

function getDIndex(x: number, z: number) {
  return (z + 1) * 3 + (x + 1);
}

function getFIndex(x: number, y: number) {
  return (1 - y) * 3 + (x + 1);
}

function getBIndex(x: number, y: number) {
  return (1 - y) * 3 + (1 - x);
}

function getRIndex(y: number, z: number) {
  return (1 - y) * 3 + (1 - z);
}

function getLIndex(y: number, z: number) {
  return (1 - y) * 3 + (z + 1);
}

/* ========================================================= */
/* CREATE CUBIES                                             */
/* ========================================================= */

function createCubies(
  kociembaString: string | null,
): CubieData[] {
  const cubies: CubieData[] = [];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const uIndex =
          y === 1 ? getUIndex(x, z) : -1;

        const dIndex =
          y === -1 ? getDIndex(x, z) : -1;

        const fIndex =
          z === 1 ? getFIndex(x, y) : -1;

        const bIndex =
          z === -1 ? getBIndex(x, y) : -1;

        const rIndex =
          x === 1 ? getRIndex(y, z) : -1;

        const lIndex =
          x === -1 ? getLIndex(y, z) : -1;

        cubies.push({
          id: `${x}-${y}-${z}`,

          x,
          y,
          z,

          uColor:
            uIndex >= 0
              ? getStickerColor(
                  kociembaString,
                  uIndex,
                  COLORS.U,
                )
              : undefined,

          dColor:
            dIndex >= 0
              ? getStickerColor(
                  kociembaString,
                  27 + dIndex,
                  COLORS.D,
                )
              : undefined,

          fColor:
            fIndex >= 0
              ? getStickerColor(
                  kociembaString,
                  18 + fIndex,
                  COLORS.F,
                )
              : undefined,

          bColor:
            bIndex >= 0
              ? getStickerColor(
                  kociembaString,
                  45 + bIndex,
                  COLORS.B,
                )
              : undefined,

          rColor:
            rIndex >= 0
              ? getStickerColor(
                  kociembaString,
                  9 + rIndex,
                  COLORS.R,
                )
              : undefined,

          lColor:
            lIndex >= 0
              ? getStickerColor(
                  kociembaString,
                  36 + lIndex,
                  COLORS.L,
                )
              : undefined,
        });
      }
    }
  }

  return cubies;
}

/* ========================================================= */
/* PARSE SOLUTION                                            */
/* ========================================================= */

function parseSolution(solution: string): Move[] {
  if (!solution.trim()) {
    return [];
  }

  return solution
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((notation) => {
      const face = notation[0] as Face;

      if (!"URFDLB".includes(face)) {
        throw new Error(
          `Invalid Kociemba move: ${notation}`,
        );
      }

      if (notation.endsWith("2")) {
        return {
          face,
          amount: 2,
          notation,
        };
      }

      if (notation.endsWith("'")) {
        return {
          face,
          amount: -1,
          notation,
        };
      }

      return {
        face,
        amount: 1,
        notation,
      };
    });
}

/* ========================================================= */
/* LAYER DETECTION                                           */
/* ========================================================= */

function isInMoveLayer(
  cubie: CubieData,
  face: Face,
) {
  switch (face) {
    case "R":
      return cubie.x === 1;

    case "L":
      return cubie.x === -1;

    case "U":
      return cubie.y === 1;

    case "D":
      return cubie.y === -1;

    case "F":
      return cubie.z === 1;

    case "B":
      return cubie.z === -1;

    default:
      return false;
  }
}

/* ========================================================= */
/* POSITION ROTATION                                         */
/* ========================================================= */

function rotatePosition(
  x: number,
  y: number,
  z: number,
  face: Face,
  direction: 1 | -1,
) {
  let nx = x;
  let ny = y;
  let nz = z;

  switch (face) {
    case "R":
      if (direction === 1) {
        ny = -z;
        nz = y;
      } else {
        ny = z;
        nz = -y;
      }
      break;

    case "L":
      if (direction === 1) {
        ny = z;
        nz = -y;
      } else {
        ny = -z;
        nz = y;
      }
      break;

    case "U":
      if (direction === 1) {
        nx = z;
        nz = -x;
      } else {
        nx = -z;
        nz = x;
      }
      break;

    case "D":
      if (direction === 1) {
        nx = -z;
        nz = x;
      } else {
        nx = z;
        nz = -x;
      }
      break;

    case "F":
      if (direction === 1) {
        nx = -y;
        ny = x;
      } else {
        nx = y;
        ny = -x;
      }
      break;

    case "B":
      if (direction === 1) {
        nx = y;
        ny = -x;
      } else {
        nx = -y;
        ny = x;
      }
      break;
  }

  return {
    x: nx,
    y: ny,
    z: nz,
  };
}

/* ========================================================= */
/* APPLY MOVE                                               */
/* ========================================================= */

function applyMove(
  cubies: CubieData[],
  move: Move,
): CubieData[] {
  const direction: 1 | -1 =
    move.amount === -1 ? -1 : 1;

  const turns =
    move.amount === 2 ? 2 : 1;

  return cubies.map((cubie) => {
    if (!isInMoveLayer(cubie, move.face)) {
      return {
        ...cubie,
      };
    }

    let position = {
      x: cubie.x,
      y: cubie.y,
      z: cubie.z,
    };

    for (let i = 0; i < turns; i++) {
      position = rotatePosition(
        position.x,
        position.y,
        position.z,
        move.face,
        direction,
      );
    }

    return {
      ...cubie,
      ...position,
    };
  });
}

/* ========================================================= */
/* BUILD SOLUTION TIMELINE                                   */
/* ========================================================= */

function buildTimeline(
  initialCubies: CubieData[],
  moves: Move[],
) {
  const timeline: CubieData[][] = [
    initialCubies,
  ];

  let current = initialCubies;

  for (const move of moves) {
    current = applyMove(current, move);
    timeline.push(current);
  }

  return timeline;
}

/* ========================================================= */
/* CUBIE                                                     */
/* ========================================================= */

type CubieProps = {
  cubie: CubieData;
};

function Cubie({ cubie }: CubieProps) {
  return (
    <group
      position={[
        cubie.x * STEP,
        cubie.y * STEP,
        cubie.z * STEP,
      ]}
    >
      {/* Cubie body */}
      <mesh>
        <boxGeometry
          args={[
            SIZE,
            SIZE,
            SIZE,
          ]}
        />

        <meshStandardMaterial
          color="#111111"
          roughness={0.3}
          metalness={0.05}
        />
      </mesh>

      {/* U */}
      {cubie.uColor && (
        <mesh
          position={[
            0,
            SIZE / 2 + 0.015,
            0,
          ]}
        >
          <boxGeometry
            args={[
              STICKER,
              0.025,
              STICKER,
            ]}
          />

          <meshStandardMaterial
            color={cubie.uColor}
            roughness={0.25}
          />
        </mesh>
      )}

      {/* D */}
      {cubie.dColor && (
        <mesh
          position={[
            0,
            -SIZE / 2 - 0.015,
            0,
          ]}
        >
          <boxGeometry
            args={[
              STICKER,
              0.025,
              STICKER,
            ]}
          />

          <meshStandardMaterial
            color={cubie.dColor}
            roughness={0.25}
          />
        </mesh>
      )}

      {/* F */}
      {cubie.fColor && (
        <mesh
          position={[
            0,
            0,
            SIZE / 2 + 0.015,
          ]}
        >
          <boxGeometry
            args={[
              STICKER,
              STICKER,
              0.025,
            ]}
          />

          <meshStandardMaterial
            color={cubie.fColor}
            roughness={0.25}
          />
        </mesh>
      )}

      {/* B */}
      {cubie.bColor && (
        <mesh
          position={[
            0,
            0,
            -SIZE / 2 - 0.015,
          ]}
        >
          <boxGeometry
            args={[
              STICKER,
              STICKER,
              0.025,
            ]}
          />

          <meshStandardMaterial
            color={cubie.bColor}
            roughness={0.25}
          />
        </mesh>
      )}

      {/* R */}
      {cubie.rColor && (
        <mesh
          position={[
            SIZE / 2 + 0.015,
            0,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.025,
              STICKER,
              STICKER,
            ]}
          />

          <meshStandardMaterial
            color={cubie.rColor}
            roughness={0.25}
          />
        </mesh>
      )}

      {/* L */}
      {cubie.lColor && (
        <mesh
          position={[
            -SIZE / 2 - 0.015,
            0,
            0,
          ]}
        >
          <boxGeometry
            args={[
              0.025,
              STICKER,
              STICKER,
            ]}
          />

          <meshStandardMaterial
            color={cubie.lColor}
            roughness={0.25}
          />
        </mesh>
      )}
    </group>
  );
}

/* ========================================================= */
/* CUBE MODEL                                                */
/* ========================================================= */

type CubeModelProps = {
  cubies: CubieData[];
};

function CubeModel({
  cubies,
}: CubeModelProps) {
  return (
    <group>
      {cubies.map((cubie) => (
        <Cubie
          key={cubie.id}
          cubie={cubie}
        />
      ))}
    </group>
  );
}

/* ========================================================= */
/* MAIN COMPONENT                                            */
/* ========================================================= */

export default function RubiksCube3D({
  kociembaString = null,
  solution = "",
  autoPlay = false,
  moveDuration = 0.35,
}: RubiksCube3DProps) {
  const moves = useMemo(
    () => parseSolution(solution),
    [solution],
  );

  const initialCubies = useMemo(
    () =>
      createCubies(kociembaString),
    [kociembaString],
  );

  const timeline = useMemo(
    () =>
      buildTimeline(
        initialCubies,
        moves,
      ),
    [initialCubies, moves],
  );

  const [currentStep, setCurrentStep] =
    useState(0);

  const [playing, setPlaying] =
    useState(autoPlay);

  const timerRef =
    useRef<ReturnType<
      typeof setInterval
    > | null>(null);

  /* ======================================================= */
  /* RESET WHEN DATA CHANGES                                 */
  /* ======================================================= */

  useEffect(() => {
    setCurrentStep(0);
    setPlaying(autoPlay);
  }, [
    kociembaString,
    solution,
    autoPlay,
  ]);

  /* ======================================================= */
  /* CLEANUP TIMER                                           */
  /* ======================================================= */

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current,
        );

        timerRef.current = null;
      }
    };
  }, []);

  /* ======================================================= */
  /* AUTO PLAY                                               */
  /* ======================================================= */

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) {
        clearInterval(
          timerRef.current,
        );

        timerRef.current = null;
      }

      return;
    }

    if (moves.length === 0) {
      setPlaying(false);
      return;
    }

    if (currentStep >= moves.length) {
      setPlaying(false);
      return;
    }

    timerRef.current =
      setInterval(() => {
        setCurrentStep((previous) => {
          if (
            previous >= moves.length
          ) {
            return previous;
          }

          return previous + 1;
        });
      }, moveDuration * 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current,
        );

        timerRef.current = null;
      }
    };
  }, [
    playing,
    currentStep,
    moves.length,
    moveDuration,
  ]);

  /* ======================================================= */
  /* NAVIGATION                                              */
  /* ======================================================= */

  const goPrevious = () => {
    setPlaying(false);

    setCurrentStep((step) =>
      Math.max(step - 1, 0),
    );
  };

  const goNext = () => {
    setPlaying(false);

    setCurrentStep((step) =>
      Math.min(
        step + 1,
        moves.length,
      ),
    );
  };

  const goToStep = (step: number) => {
    setPlaying(false);

    setCurrentStep(
      Math.max(
        0,
        Math.min(
          step,
          moves.length,
        ),
      ),
    );
  };

  const reset = () => {
    setPlaying(false);
    setCurrentStep(0);
  };

  const play = () => {
    if (moves.length === 0) {
      return;
    }

    if (currentStep >= moves.length) {
      setCurrentStep(0);
    }

    setPlaying(true);
  };

  /* ======================================================= */
  /* STATE                                                   */
  /* ======================================================= */

  const isComplete =
    moves.length > 0 &&
    currentStep >= moves.length;

  const currentMove =
    currentStep > 0
      ? moves[currentStep - 1]
      : null;

  const progress =
    moves.length > 0
      ? (currentStep /
          moves.length) *
        100
      : 0;

  /* ======================================================= */
  /* RENDER                                                  */
  /* ======================================================= */

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[#09090b]">

      {/* ================================================= */}
      {/* 3D CUBE                                           */}
      {/* ================================================= */}

      <div className="h-[520px] w-full">
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
            cubies={
              timeline[currentStep] ??
              initialCubies
            }
          />

          <OrbitControls
            enableRotate={!playing}
            enableZoom
            enablePan={false}
            minDistance={4}
            maxDistance={12}
          />
        </Canvas>
      </div>

      {/* ================================================= */}
      {/* SOLUTION PANEL                                    */}
      {/* ================================================= */}

      {moves.length > 0 && (
        <div className="w-full border-t border-white/10 bg-black/80 p-4">
          <div className="mx-auto w-full max-w-5xl">

            {/* ================================================= */}
            {/* CURRENT STATE                                    */}
            {/* ================================================= */}

            <div className="mb-4 text-center">
              {currentStep === 0 ? (
                <>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Starting Position
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    Scrambled Cube
                  </p>
                </>
              ) : isComplete ? (
                <>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Finished
                  </p>

                  <p className="mt-1 text-2xl font-bold text-green-400">
                    Cube Solved ✓
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Current Move
                  </p>

                  <p className="mt-1 text-3xl font-bold text-white">
                    {currentMove?.notation}
                  </p>
                </>
              )}
            </div>

            {/* ================================================= */}
            {/* STEP BUTTONS                                      */}
            {/* ================================================= */}

            <div className="mb-4 overflow-x-auto pb-2">
              <div className="flex min-w-max justify-start gap-2 px-1 sm:justify-center">

                {/* START */}
                <button
                  type="button"
                  onClick={() =>
                    goToStep(0)
                  }
                  className={[
                    "flex min-w-[80px] flex-col items-center rounded-xl border px-3 py-2 transition",
                    currentStep === 0
                      ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="text-[10px] uppercase tracking-wide opacity-70">
                    Step
                  </span>

                  <span className="text-sm font-bold">
                    Start
                  </span>
                </button>

                {/* MOVES */}
                {moves.map(
                  (move, index) => {
                    const step =
                      index + 1;

                    return (
                      <button
                        key={`${move.notation}-${index}`}
                        type="button"
                        onClick={() =>
                          goToStep(step)
                        }
                        className={[
                          "flex min-w-[58px] flex-col items-center rounded-xl border px-3 py-2 transition",
                          currentStep ===
                          step
                            ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : currentStep >
                                step
                              ? "border-green-500/30 bg-green-500/10 text-green-300"
                              : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10",
                        ].join(" ")}
                      >
                        <span className="text-[10px] uppercase tracking-wide opacity-70">
                          {step}
                        </span>

                        <span className="text-base font-bold">
                          {
                            move.notation
                          }
                        </span>
                      </button>
                    );
                  },
                )}

                {/* SOLVED */}
                <button
                  type="button"
                  onClick={() =>
                    goToStep(
                      moves.length,
                    )
                  }
                  className={[
                    "flex min-w-[70px] flex-col items-center rounded-xl border px-3 py-2 transition",
                    currentStep ===
                    moves.length
                      ? "border-green-500 bg-green-600 text-white shadow-lg shadow-green-500/20"
                      : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="text-[10px] uppercase tracking-wide opacity-70">
                    End
                  </span>

                  <span className="text-sm font-bold">
                    Solved
                  </span>
                </button>
              </div>
            </div>

            {/* ================================================= */}
            {/* PROGRESS                                         */}
            {/* ================================================= */}

            <div className="mb-4">
              <div className="mb-1 flex justify-between text-xs text-gray-400">
                <span>
                  Step {currentStep} /{" "}
                  {moves.length}
                </span>

                <span>
                  {Math.round(
                    progress,
                  )}
                  %
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            {/* ================================================= */}
            {/* PREVIOUS / PLAY / NEXT                          */}
            {/* ================================================= */}

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">

              {/* PREVIOUS */}
              <button
                type="button"
                disabled={
                  currentStep === 0
                }
                onClick={
                  goPrevious
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              {/* PLAY / PAUSE */}
              <button
                type="button"
                onClick={
                  playing
                    ? () =>
                        setPlaying(
                          false,
                        )
                    : play
                }
                className="min-w-[110px] rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {playing
                  ? "⏸ Pause"
                  : isComplete
                    ? "▶ Replay"
                    : "▶ Play"}
              </button>

              {/* NEXT */}
              <button
                type="button"
                disabled={
                  currentStep >=
                  moves.length
                }
                onClick={goNext}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>

              {/* RESET */}
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
              >
                ↻ Reset
              </button>
            </div>

            {/* ================================================= */}
            {/* SOLUTION STRING                                  */}
            {/* ================================================= */}

            <div className="mt-4 rounded-xl bg-white/5 p-3">
              <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Kociemba Solution
              </p>

              <p className="break-words text-center text-sm font-medium leading-6 text-gray-300">
                {solution}
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}