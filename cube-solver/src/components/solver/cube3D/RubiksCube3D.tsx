
"use client";

import {
  Canvas,
  useFrame,
  type ThreeEvent,
} from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

const SIZE = 0.95;
const GAP = 0.08;
const STEP = SIZE + GAP;
const STICKER = 0.72;

const ANIMATION_SPEED = 0.35;

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

  // Logical position
  x: number;
  y: number;
  z: number;

  // Sticker colors
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

  /**
   * Example:
   *
   * "R U R' U' F2"
   */
  solution?: string;

  /**
   * Automatically start playing solution.
   */
  autoPlay?: boolean;

  /**
   * Animation speed in seconds.
   */
  moveDuration?: number;
};

/* ========================================================= */
/* KOCIEMBA STRING HELPERS                                   */
/* ========================================================= */

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

/* ========================================================= */
/* FACE INDEX MAPPING                                        */
/* ========================================================= */

function getUIndex(x: number, z: number) {
  const row = 1 - z;
  const col = x + 1;

  return row * 3 + col;
}

function getDIndex(x: number, z: number) {
  const row = z + 1;
  const col = x + 1;

  return row * 3 + col;
}

function getFIndex(x: number, y: number) {
  const row = 1 - y;
  const col = x + 1;

  return row * 3 + col;
}

function getBIndex(x: number, y: number) {
  const row = 1 - y;
  const col = 1 - x;

  return row * 3 + col;
}

function getRIndex(y: number, z: number) {
  const row = 1 - y;
  const col = 1 - z;

  return row * 3 + col;
}

function getLIndex(y: number, z: number) {
  const row = 1 - y;
  const col = z + 1;

  return row * 3 + col;
}

/* ========================================================= */
/* CREATE INITIAL CUBIES                                     */
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
/* MOVE PARSER                                               */
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
/* MOVE LAYER TEST                                           */
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
/* ROTATE INTEGER CUBIE POSITION                              */
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

  /*
   * Direction is intentionally defined here
   * according to standard Singmaster notation.
   */

  if (face === "R") {
    // Rotate around X axis.
    if (direction === 1) {
      ny = -z;
      nz = y;
    } else {
      ny = z;
      nz = -y;
    }
  }

  if (face === "L") {
    if (direction === 1) {
      ny = z;
      nz = -y;
    } else {
      ny = -z;
      nz = y;
    }
  }

  if (face === "U") {
    // Rotate around Y axis.
    if (direction === 1) {
      nx = z;
      nz = -x;
    } else {
      nx = -z;
      nz = x;
    }
  }

  if (face === "D") {
    if (direction === 1) {
      nx = -z;
      nz = x;
    } else {
      nx = z;
      nz = -x;
    }
  }

  if (face === "F") {
    // Rotate around Z axis.
    if (direction === 1) {
      nx = -y;
      ny = x;
    } else {
      nx = y;
      ny = -x;
    }
  }

  if (face === "B") {
    if (direction === 1) {
      nx = y;
      ny = -x;
    } else {
      nx = -y;
      ny = x;
    }
  }

  return {
    x: nx,
    y: ny,
    z: nz,
  };
}

/* ========================================================= */
/* CUBIE COMPONENT                                           */
/* ========================================================= */

type CubieProps = {
  cubie: CubieData;
  meshRef: (id: string, object: THREE.Group | null) => void;
};

function Cubie({
  cubie,
  meshRef,
}: CubieProps) {
  return (
    <group
      ref={(object) =>
        meshRef(cubie.id, object)
      }
      position={[
        cubie.x * STEP,
        cubie.y * STEP,
        cubie.z * STEP,
      ]}
    >
      {/* Black cubie */}
      <mesh>
        <boxGeometry
          args={[SIZE, SIZE, SIZE]}
        />

        <meshStandardMaterial
          color="#111111"
          roughness={0.3}
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
  kociembaString: string | null;
  solution: string;
  autoPlay: boolean;
  moveDuration: number;
  onMoveChange?: (
    index: number,
    total: number,
    move: string | null,
  ) => void;
};

function CubeModel({
  kociembaString,
  solution,
  autoPlay,
  moveDuration,
  onMoveChange,
}: CubeModelProps) {
  const [cubies, setCubies] = useState<CubieData[]>(() =>
    createCubies(kociembaString),
  );

  const cubieRefs = useRef<
    Record<string, THREE.Group | null>
  >({});

  const moves = useMemo(
    () => parseSolution(solution),
    [solution],
  );

  const moveIndexRef = useRef(0);
  const playingRef = useRef(false);
  const animationRef = useRef<{
    move: Move;
    start: number;
    duration: number;
    cubieIds: string[];
    startPositions: Record<
      string,
      THREE.Vector3
    >;
    startQuaternions: Record<
      string,
      THREE.Quaternion
    >;
  } | null>(null);

  const [playing, setPlaying] =
    useState(false);

  /*
   * Rebuild cube whenever a completely
   * new Kociemba state is supplied.
   */
  useEffect(() => {
    setCubies(createCubies(kociembaString));

    moveIndexRef.current = 0;
    animationRef.current = null;
    playingRef.current = autoPlay;

    setPlaying(autoPlay);

    onMoveChange?.(
      0,
      moves.length,
      moves.length > 0
        ? moves[0].notation
        : null,
    );
  }, [
    kociembaString,
    moves.length,
    autoPlay,
  ]);

  /*
   * Keep autoPlay state synchronized.
   */
  useEffect(() => {
    if (moves.length === 0) {
      setPlaying(false);
      playingRef.current = false;
      return;
    }

    if (autoPlay) {
      playingRef.current = true;
      setPlaying(true);
    }
  }, [autoPlay, moves.length]);

  /*
   * Start a move animation.
   */
  const startMove = () => {
    if (
      animationRef.current ||
      moves.length === 0
    ) {
      return;
    }

    const index = moveIndexRef.current;

    if (index >= moves.length) {
      playingRef.current = false;
      setPlaying(false);

      onMoveChange?.(
        index,
        moves.length,
        null,
      );

      return;
    }

    const move = moves[index];

    const selectedCubies = cubies.filter(
      (cubie) =>
        isInMoveLayer(cubie, move.face),
    );

    const startPositions: Record<
      string,
      THREE.Vector3
    > = {};

    const startQuaternions: Record<
      string,
      THREE.Quaternion
    > = {};

    selectedCubies.forEach((cubie) => {
      const object =
        cubieRefs.current[cubie.id];

      if (!object) return;

      startPositions[cubie.id] =
        object.position.clone();

      startQuaternions[cubie.id] =
        object.quaternion.clone();
    });

    animationRef.current = {
      move,
      start: performance.now(),
      duration: moveDuration * 1000,
      cubieIds: selectedCubies.map(
        (cubie) => cubie.id,
      ),
      startPositions,
      startQuaternions,
    };

    onMoveChange?.(
      index,
      moves.length,
      move.notation,
    );
  };

  /*
   * Animate moves frame-by-frame.
   */
  useFrame(() => {
    if (
      !playingRef.current &&
      !animationRef.current
    ) {
      return;
    }

    if (
      !animationRef.current &&
      playingRef.current
    ) {
      startMove();
      return;
    }

    const animation =
      animationRef.current;

    if (!animation) return;

    const elapsed =
      performance.now() - animation.start;

    let progress =
      elapsed / animation.duration;

    progress = Math.min(
      Math.max(progress, 0),
      1,
    );

    /*
     * Smooth easing.
     */
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 -
          Math.pow(
            -2 * progress + 2,
            2,
          ) /
            2;

    /*
     * Standard face-turn angle.
     *
     * amount:
     *  1  = clockwise
     * -1  = counter-clockwise
     *  2  = 180 degrees
     */
    let angle =
      Math.PI / 2;

    if (animation.move.amount === -1) {
      angle = -Math.PI / 2;
    }

    if (animation.move.amount === 2) {
      angle = Math.PI;
    }

    angle *= eased;

    const axis =
      animation.move.face === "R" ||
      animation.move.face === "L"
        ? new THREE.Vector3(1, 0, 0)
        : animation.move.face === "U" ||
            animation.move.face === "D"
          ? new THREE.Vector3(0, 1, 0)
          : new THREE.Vector3(0, 0, 1);

    /*
     * L and D/B require opposite physical
     * rotation direction for Singmaster notation.
     */
    let directionMultiplier = 1;

    if (
      animation.move.face === "L" ||
      animation.move.face === "D" ||
      animation.move.face === "B"
    ) {
      directionMultiplier = -1;
    }

    const rotation =
      new THREE.Quaternion().setFromAxisAngle(
        axis,
        angle * directionMultiplier,
      );

    animation.cubieIds.forEach((id) => {
      const object =
        cubieRefs.current[id];

      const startPosition =
        animation.startPositions[id];

      const startQuaternion =
        animation.startQuaternions[id];

      if (
        !object ||
        !startPosition ||
        !startQuaternion
      ) {
        return;
      }

      /*
       * Rotate position around the origin.
       * Since each selected cubie is on the
       * turning layer, this creates the actual
       * layer-turn animation.
       */
      object.position
        .copy(startPosition)
        .applyQuaternion(rotation);

      object.quaternion
        .copy(startQuaternion);

      object.quaternion.premultiply(
        rotation,
      );
    });

    /*
     * Animation completed.
     */
    if (progress >= 1) {
      const move = animation.move;

      const direction =
        move.amount === -1
          ? -1
          : 1;

      const turns =
        move.amount === 2
          ? 2
          : 1;

      setCubies((previous) => {
        return previous.map((cubie) => {
          if (
            !isInMoveLayer(
              cubie,
              move.face,
            )
          ) {
            return cubie;
          }

          let result = {
            x: cubie.x,
            y: cubie.y,
            z: cubie.z,
          };

          for (
            let i = 0;
            i < turns;
            i++
          ) {
            result = rotatePosition(
              result.x,
              result.y,
              result.z,
              move.face,
              direction as 1 | -1,
            );
          }

          return {
            ...cubie,
            ...result,
          };
        });
      });

      animationRef.current = null;

      moveIndexRef.current += 1;

      if (
        moveIndexRef.current >=
        moves.length
      ) {
        playingRef.current = false;
        setPlaying(false);

        onMoveChange?.(
          moves.length,
          moves.length,
          null,
        );
      } else if (playingRef.current) {
        onMoveChange?.(
          moveIndexRef.current,
          moves.length,
          moves[
            moveIndexRef.current
          ].notation,
        );
      }
    }
  });

  /*
   * Prevent accidental interaction
   * with cubies while solution is playing.
   */
  const handlePointerDown = (
    event: ThreeEvent<PointerEvent>,
  ) => {
    if (playingRef.current) {
      event.stopPropagation();
    }
  };

  return (
    <group
      onPointerDown={handlePointerDown}
    >
      {cubies.map((cubie) => (
        <Cubie
          key={cubie.id}
          cubie={cubie}
          meshRef={(id, object) => {
            cubieRefs.current[id] =
              object;
          }}
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
  moveDuration = ANIMATION_SPEED,
}: RubiksCube3DProps) {
  const [playing, setPlaying] =
    useState(autoPlay);

  const [currentMove, setCurrentMove] =
    useState(0);

  const [totalMoves, setTotalMoves] =
    useState(0);

  const [activeMove, setActiveMove] =
    useState<string | null>(null);

  /*
   * This key forces the cube model to
   * completely reset when the user presses
   * Reset.
   */
  const [resetKey, setResetKey] =
    useState(0);

  const moves = useMemo(
    () => parseSolution(solution),
    [solution],
  );

  useEffect(() => {
    setPlaying(autoPlay);
    setCurrentMove(0);
    setActiveMove(
      moves.length > 0
        ? moves[0].notation
        : null,
    );
    setTotalMoves(moves.length);
  }, [solution, autoPlay, moves.length]);

  return (
    <div className="relative h-[620px] w-full overflow-hidden rounded-2xl">
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
          key={`${resetKey}-${kociembaString}`}
          kociembaString={kociembaString}
          solution={solution}
          autoPlay={playing}
          moveDuration={moveDuration}
          onMoveChange={(
            index,
            total,
            move,
          ) => {
            setCurrentMove(index);
            setTotalMoves(total);
            setActiveMove(move);
          }}
        />

        <OrbitControls
          enableRotate={!playing}
          enableZoom
          enablePan={false}
        />
      </Canvas>

      {/* ================================================= */}
      {/* SOLUTION CONTROLS                                */}
      {/* ================================================= */}

      {solution && (
        <div className="absolute bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2">
          <div className="rounded-2xl border border-white/10 bg-black/70 p-4 shadow-2xl backdrop-blur-md">

            {/* Current move */}
            <div className="mb-3 text-center">
              {activeMove ? (
                <>
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Current Move
                  </p>

                  <p className="mt-1 text-3xl font-bold text-white">
                    {activeMove}
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium text-green-400">
                  Solution Complete ✓
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-xs text-gray-400">
                <span>
                  Move {Math.min(
                    currentMove + 1,
                    totalMoves,
                  )}{" "}
                  / {totalMoves}
                </span>

                <span>
                  {totalMoves > 0
                    ? Math.round(
                        (currentMove /
                          totalMoves) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${
                      totalMoves > 0
                        ? Math.min(
                            (currentMove /
                              totalMoves) *
                              100,
                            100,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setPlaying((value) => !value)
                }
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {playing
                  ? "Pause"
                  : currentMove >= totalMoves
                    ? "Replay"
                    : "Play"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setCurrentMove(0);
                  setActiveMove(
                    moves.length > 0
                      ? moves[0].notation
                      : null,
                  );

                  setResetKey(
                    (value) => value + 1,
                  );
                }}
                className="rounded-xl border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Reset
              </button>
            </div>

            {/* Solution */}
            <div className="mt-4 max-h-20 overflow-auto rounded-xl bg-white/5 p-3">
              <p className="text-center text-xs leading-6 text-gray-300">
                {solution}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

