
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  useCallback,
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
const STICKER_OFFSET = SIZE / 2 + 0.015;

const COLORS: Record<string, string> = {
  U: "#ffffff",
  D: "#ffd500",
  F: "#00a651",
  B: "#0051ba",
  R: "#c41e3a",
  L: "#ff5800",
};

type Face = "U" | "R" | "F" | "D" | "L" | "B";

type Vector3Int = {
  x: number;
  y: number;
  z: number;
};

type Sticker = {
  color: string;
  normal: Vector3Int;
};

type CubieData = {
  id: string;
  x: number;
  y: number;
  z: number;
  stickers: Sticker[];
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
  if (
    !kociembaString ||
    kociembaString.length !== 54
  ) {
    return fallback;
  }

  return (
    COLORS[kociembaString[index]] ??
    fallback
  );
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
/* CREATE STICKER                                            */
/* ========================================================= */

function createSticker(
  color: string,
  x: number,
  y: number,
  z: number,
): Sticker {
  return {
    color,
    normal: {
      x,
      y,
      z,
    },
  };
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
        const stickers: Sticker[] = [];

        /* U */
        if (y === 1) {
          const index = getUIndex(x, z);

          stickers.push(
            createSticker(
              getStickerColor(
                kociembaString,
                index,
                COLORS.U,
              ),
              0,
              1,
              0,
            ),
          );
        }

        /* D */
        if (y === -1) {
          const index = getDIndex(x, z);

          stickers.push(
            createSticker(
              getStickerColor(
                kociembaString,
                27 + index,
                COLORS.D,
              ),
              0,
              -1,
              0,
            ),
          );
        }

        /* F */
        if (z === 1) {
          const index = getFIndex(x, y);

          stickers.push(
            createSticker(
              getStickerColor(
                kociembaString,
                18 + index,
                COLORS.F,
              ),
              0,
              0,
              1,
            ),
          );
        }

        /* B */
        if (z === -1) {
          const index = getBIndex(x, y);

          stickers.push(
            createSticker(
              getStickerColor(
                kociembaString,
                45 + index,
                COLORS.B,
              ),
              0,
              0,
              -1,
            ),
          );
        }

        /* R */
        if (x === 1) {
          const index = getRIndex(y, z);

          stickers.push(
            createSticker(
              getStickerColor(
                kociembaString,
                9 + index,
                COLORS.R,
              ),
              1,
              0,
              0,
            ),
          );
        }

        /* L */
        if (x === -1) {
          const index = getLIndex(y, z);

          stickers.push(
            createSticker(
              getStickerColor(
                kociembaString,
                36 + index,
                COLORS.L,
              ),
              -1,
              0,
              0,
            ),
          );
        }

        cubies.push({
          id: `${x}-${y}-${z}`,
          x,
          y,
          z,
          stickers,
        });
      }
    }
  }

  return cubies;
}

/* ========================================================= */
/* PARSE SOLUTION                                            */
/* ========================================================= */

function parseSolution(
  solution: string,
): Move[] {
  if (!solution.trim()) {
    return [];
  }

  return solution
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((notation) => {
      const face =
        notation[0] as Face;

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
/* MOVE LAYER                                                */
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
/* ROTATE VECTOR                                             */
/* ========================================================= */

function rotateVector(
  vector: Vector3Int,
  face: Face,
  direction: 1 | -1,
): Vector3Int {
  const { x, y, z } = vector;

  switch (face) {
    case "R":
      return direction === 1
        ? {
            x,
            y: -z,
            z: y,
          }
        : {
            x,
            y: z,
            z: -y,
          };

    case "L":
      return direction === 1
        ? {
            x,
            y: z,
            z: -y,
          }
        : {
            x,
            y: -z,
            z: y,
          };

    case "U":
      return direction === 1
        ? {
            x: z,
            y,
            z: -x,
          }
        : {
            x: -z,
            y,
            z: x,
          };

    case "D":
      return direction === 1
        ? {
            x: -z,
            y,
            z: x,
          }
        : {
            x: z,
            y,
            z: -x,
          };

    case "F":
      return direction === 1
        ? {
            x: -y,
            y: x,
            z,
          }
        : {
            x: y,
            y: -x,
            z,
          };

    case "B":
      return direction === 1
        ? {
            x: y,
            y: -x,
            z,
          }
        : {
            x: -y,
            y: x,
            z,
          };
  }
}

/* ========================================================= */
/* APPLY MOVE TO STATE                                       */
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
    if (
      !isInMoveLayer(
        cubie,
        move.face,
      )
    ) {
      return {
        ...cubie,
        stickers:
          cubie.stickers.map(
            (sticker) => ({
              ...sticker,
              normal: {
                ...sticker.normal,
              },
            }),
          ),
      };
    }

    let position: Vector3Int = {
      x: cubie.x,
      y: cubie.y,
      z: cubie.z,
    };

    let stickers =
      cubie.stickers.map(
        (sticker) => ({
          ...sticker,
          normal: {
            ...sticker.normal,
          },
        }),
      );

    for (
      let i = 0;
      i < turns;
      i++
    ) {
      position =
        rotateVector(
          position,
          move.face,
          direction,
        );

      stickers =
        stickers.map(
          (sticker) => ({
            ...sticker,
            normal:
              rotateVector(
                sticker.normal,
                move.face,
                direction,
              ),
          }),
        );
    }

    return {
      ...cubie,
      ...position,
      stickers,
    };
  });
}

/* ========================================================= */
/* BUILD TIMELINE                                            */
/* ========================================================= */

function buildTimeline(
  initialCubies: CubieData[],
  moves: Move[],
): CubieData[][] {
  const timeline: CubieData[][] = [
    initialCubies,
  ];

  let current =
    initialCubies;

  for (const move of moves) {
    current =
      applyMove(
        current,
        move,
      );

    timeline.push(current);
  }

  return timeline;
}

/* ========================================================= */
/* MOVE AXIS                                                 */
/* ========================================================= */

function getMoveAxis(
  face: Face,
): "x" | "y" | "z" {
  switch (face) {
    case "R":
    case "L":
      return "x";

    case "U":
    case "D":
      return "y";

    case "F":
    case "B":
      return "z";
  }
}

/* ========================================================= */
/* MOVE ANIMATION DIRECTION                                  */
/* ========================================================= */

function getAnimationAngle(
  move: Move,
): number {
  const direction =
    move.amount === -1
      ? -1
      : 1;

  const turns =
    move.amount === 2
      ? 2
      : 1;

  /*
   * The mathematical rotations used by rotateVector
   * match Three.js positive axis rotations.
   *
   * This gives us:
   *
   * R  = +90° X
   * R' = -90° X
   * U  = +90° Y
   * U' = -90° Y
   * F  = +90° Z
   * F' = -90° Z
   */
  return (
    direction *
    turns *
    (Math.PI / 2)
  );
}

/* ========================================================= */
/* STICKER MESH                                              */
/* ========================================================= */

type StickerMeshProps = {
  sticker: Sticker;
};

function StickerMesh({
  sticker,
}: StickerMeshProps) {
  const {
    x,
    y,
    z,
  } = sticker.normal;

  if (y === 1) {
    return (
      <mesh
        position={[
          0,
          STICKER_OFFSET,
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
          color={sticker.color}
          roughness={0.25}
        />
      </mesh>
    );
  }

  if (y === -1) {
    return (
      <mesh
        position={[
          0,
          -STICKER_OFFSET,
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
          color={sticker.color}
          roughness={0.25}
        />
      </mesh>
    );
  }

  if (z === 1) {
    return (
      <mesh
        position={[
          0,
          0,
          STICKER_OFFSET,
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
          color={sticker.color}
          roughness={0.25}
        />
      </mesh>
    );
  }

  if (z === -1) {
    return (
      <mesh
        position={[
          0,
          0,
          -STICKER_OFFSET,
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
          color={sticker.color}
          roughness={0.25}
        />
      </mesh>
    );
  }

  if (x === 1) {
    return (
      <mesh
        position={[
          STICKER_OFFSET,
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
          color={sticker.color}
          roughness={0.25}
        />
      </mesh>
    );
  }

  return (
    <mesh
      position={[
        -STICKER_OFFSET,
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
        color={sticker.color}
        roughness={0.25}
      />
    </mesh>
  );
}

/* ========================================================= */
/* CUBIE                                                    */
/* ========================================================= */

type CubieProps = {
  cubie: CubieData;
};

function Cubie({
  cubie,
}: CubieProps) {
  return (
    <group
      position={[
        cubie.x * STEP,
        cubie.y * STEP,
        cubie.z * STEP,
      ]}
    >
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

      {cubie.stickers.map(
        (sticker, index) => (
          <StickerMesh
            key={`${cubie.id}-${index}`}
            sticker={sticker}
          />
        ),
      )}
    </group>
  );
}

/* ========================================================= */
/* ANIMATED CUBE MODEL                                       */
/* ========================================================= */

type AnimatedCubeModelProps = {
  cubies: CubieData[];
  animation: {
    move: Move;
    from: CubieData[];
    to: CubieData[];
  } | null;
  duration: number;
  onComplete: () => void;
};

function AnimatedCubeModel({
  cubies,
  animation,
  duration,
  onComplete,
}: AnimatedCubeModelProps) {
  const pivotRef =
    useRef<THREE.Group | null>(
      null,
    );

  const progressRef =
    useRef(0);

  const completedRef =
    useRef(false);

  useEffect(() => {
    progressRef.current = 0;
    completedRef.current = false;

    if (pivotRef.current) {
      pivotRef.current.rotation.set(
        0,
        0,
        0,
      );
    }
  }, [animation]);

  useFrame(
    (_, delta) => {
      if (!animation) {
        return;
      }

      if (completedRef.current) {
        return;
      }

      progressRef.current +=
        delta /
        Math.max(
          duration,
          0.05,
        );

      const progress =
        Math.min(
          progressRef.current,
          1,
        );

      /*
       * Smooth ease-in-out.
       */
      const eased =
        progress < 0.5
          ? 2 *
            progress *
            progress
          : 1 -
            Math.pow(
              -2 * progress +
                2,
              2,
            ) /
              2;

      const targetAngle =
        getAnimationAngle(
          animation.move,
        );

      if (pivotRef.current) {
        const axis =
          getMoveAxis(
            animation.move.face,
          );

        pivotRef.current.rotation[
          axis
        ] =
          targetAngle * eased;
      }

      if (progress >= 1) {
        completedRef.current =
          true;

        if (
          pivotRef.current
        ) {
          const axis =
            getMoveAxis(
              animation.move.face,
            );

          pivotRef.current.rotation[
            axis
          ] = targetAngle;
        }

        onComplete();
      }
    },
  );

  const source =
    animation?.from ?? cubies;

  const activeMove =
    animation?.move ?? null;

  const activeCubies =
    activeMove
      ? source.filter(
          (cubie) =>
            isInMoveLayer(
              cubie,
              activeMove.face,
            ),
        )
      : [];

  const staticCubies =
    activeMove
      ? source.filter(
          (cubie) =>
            !isInMoveLayer(
              cubie,
              activeMove.face,
            ),
        )
      : source;

  return (
    <group>
      {/* Non-moving cubies */}
      {staticCubies.map(
        (cubie) => (
          <Cubie
            key={cubie.id}
            cubie={cubie}
          />
        ),
      )}

      {/* Rotating layer */}
      {activeMove ? (
        <group ref={pivotRef}>
          {activeCubies.map(
            (cubie) => (
              <Cubie
                key={cubie.id}
                cubie={cubie}
              />
            ),
          )}
        </group>
      ) : null}
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
  /* ======================================================= */
  /* MOVES                                                   */
  /* ======================================================= */

  const moves = useMemo(
    () =>
      parseSolution(
        solution,
      ),
    [solution],
  );

  /* ======================================================= */
  /* INITIAL CUBE                                            */
  /* ======================================================= */

  const initialCubies =
    useMemo(
      () =>
        createCubies(
          kociembaString,
        ),
      [kociembaString],
    );

  /* ======================================================= */
  /* TIMELINE                                                */
  /* ======================================================= */

  const timeline =
    useMemo(
      () =>
        buildTimeline(
          initialCubies,
          moves,
        ),
      [
        initialCubies,
        moves,
      ],
    );

  /* ======================================================= */
  /* STATE                                                   */
  /* ======================================================= */

  const [
    currentStep,
    setCurrentStep,
  ] = useState(0);

  const [
    visualStep,
    setVisualStep,
  ] = useState(0);

  const [
    animation,
    setAnimation,
  ] = useState<{
    move: Move;
    from: CubieData[];
    to: CubieData[];
    targetStep: number;
  } | null>(null);

  const [
    playing,
    setPlaying,
  ] = useState(autoPlay);

  const requestedStepRef =
    useRef(0);

  /* ======================================================= */
  /* RESET                                                   */
  /* ======================================================= */

  useEffect(() => {
    setCurrentStep(0);
    setVisualStep(0);
    setAnimation(null);
    requestedStepRef.current = 0;
    setPlaying(autoPlay);
  }, [
    kociembaString,
    solution,
    autoPlay,
  ]);

  /* ======================================================= */
  /* START MOVE ANIMATION                                    */
  /* ======================================================= */

  const animateToStep =
    useCallback(
      (
        targetStep: number,
      ) => {
        if (
          targetStep ===
          visualStep
        ) {
          return;
        }

        const direction =
          targetStep >
          visualStep
            ? 1
            : -1;

        const nextStep =
          visualStep +
          direction;

        /*
         * Moving forward:
         * execute moves[nextStep - 1]
         *
         * Moving backward:
         * execute inverse of
         * moves[visualStep - 1]
         */
        if (direction === 1) {
          const move =
            moves[
              nextStep - 1
            ];

          if (!move) {
            return;
          }

          setAnimation({
            move,
            from:
              timeline[
                visualStep
              ],
            to:
              timeline[
                nextStep
              ],
            targetStep:
              nextStep,
          });

          return;
        }

        const originalMove =
          moves[
            visualStep - 1
          ];

        if (!originalMove) {
          return;
        }

        const inverseMove: Move =
          originalMove.amount === 2
            ? {
                ...originalMove,
                amount: 2,
                notation:
                  originalMove
                    .notation,
              }
            : {
                ...originalMove,
                amount:
                  originalMove
                    .amount === 1
                    ? -1
                    : 1,
                notation:
                  originalMove
                    .amount === 1
                    ? `${originalMove.face}'`
                    : originalMove.face,
              };

        setAnimation({
          move: inverseMove,
          from:
            timeline[
              visualStep
            ],
          to:
            timeline[
              nextStep
            ],
          targetStep:
            nextStep,
        });
      },
      [
        visualStep,
        moves,
        timeline,
      ],
    );

  /* ======================================================= */
  /* COMPLETE ANIMATION                                     */
  /* ======================================================= */

  const handleAnimationComplete =
    useCallback(() => {
      if (!animation) {
        return;
      }

      const completedStep =
        animation.targetStep;

      setVisualStep(
        completedStep,
      );

      setCurrentStep(
        completedStep,
      );

      setAnimation(null);

      /*
       * Continue toward requested step.
       * This allows clicking a far-away
       * step and animating through each
       * move one by one.
       */
      const requested =
        requestedStepRef.current;

      if (
        requested !==
        completedStep
      ) {
        setTimeout(() => {
          animateToStep(
            requested,
          );
        }, 30);

        return;
      }

      /*
       * Continue autoplay.
       */
      if (
        playing &&
        completedStep <
          moves.length
      ) {
        setTimeout(() => {
          requestedStepRef.current =
            completedStep + 1;

          animateToStep(
            completedStep + 1,
          );
        }, 50);
      } else if (
        playing &&
        completedStep >=
          moves.length
      ) {
        setPlaying(false);
      }
    }, [
      animation,
      playing,
      moves.length,
      animateToStep,
    ]);

  /* ======================================================= */
  /* REQUEST STEP                                            */
  /* ======================================================= */

  const goToStep =
    useCallback(
      (step: number) => {
        const safeStep =
          Math.max(
            0,
            Math.min(
              step,
              moves.length,
            ),
          );

        setPlaying(false);

        requestedStepRef.current =
          safeStep;

        if (
          safeStep ===
          visualStep
        ) {
          return;
        }

        if (animation) {
          return;
        }

        animateToStep(
          safeStep,
        );
      },
      [
        moves.length,
        visualStep,
        animation,
        animateToStep,
      ],
    );

  /* ======================================================= */
  /* PREVIOUS                                               */
  /* ======================================================= */

  const goPrevious =
    useCallback(() => {
      if (animation) {
        return;
      }

      const target =
        Math.max(
          visualStep - 1,
          0,
        );

      requestedStepRef.current =
        target;

      setPlaying(false);

      animateToStep(target);
    }, [
      visualStep,
      animation,
      animateToStep,
    ]);

  /* ======================================================= */
  /* NEXT                                                   */
  /* ======================================================= */

  const goNext =
    useCallback(() => {
      if (animation) {
        return;
      }

      const target =
        Math.min(
          visualStep + 1,
          moves.length,
        );

      requestedStepRef.current =
        target;

      setPlaying(false);

      animateToStep(target);
    }, [
      visualStep,
      moves.length,
      animation,
      animateToStep,
    ]);

  /* ======================================================= */
  /* RESET                                                   */
  /* ======================================================= */

  const reset =
    useCallback(() => {
      if (animation) {
        return;
      }

      setPlaying(false);

      requestedStepRef.current =
        0;

      animateToStep(0);
    }, [
      animation,
      animateToStep,
    ]);

  /* ======================================================= */
  /* PLAY                                                    */
  /* ======================================================= */

  const play =
    useCallback(() => {
      if (
        moves.length === 0 ||
        animation
      ) {
        return;
      }

      let target =
        visualStep;

      if (
        visualStep >=
        moves.length
      ) {
        target = 0;
      }

      requestedStepRef.current =
        target + 1;

      setPlaying(true);

      if (
        target ===
        moves.length
      ) {
        return;
      }

      animateToStep(
        target + 1,
      );
    }, [
      moves.length,
      visualStep,
      animation,
      animateToStep,
    ]);

  /* ======================================================= */
  /* CURRENT STATE                                           */
  /* ======================================================= */

  const isComplete =
    moves.length > 0 &&
    visualStep >=
      moves.length;

  const currentMove =
    visualStep > 0
      ? moves[
          visualStep - 1
        ]
      : null;

  const progress =
    moves.length > 0
      ? (visualStep /
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
            position: [
              5,
              5,
              7,
            ],
            fov: 45,
          }}
        >
          <color
            attach="background"
            args={[
              "#09090b",
            ]}
          />

          <ambientLight
            intensity={2}
          />

          <directionalLight
            position={[
              5,
              8,
              5,
            ]}
            intensity={4}
          />

          <directionalLight
            position={[
              -5,
              3,
              5,
            ]}
            intensity={2}
          />

          <AnimatedCubeModel
            cubies={
              timeline[
                visualStep
              ] ??
              initialCubies
            }
            animation={
              animation
                ? {
                    move:
                      animation.move,
                    from:
                      animation.from,
                    to:
                      animation.to,
                  }
                : null
            }
            duration={
              moveDuration
            }
            onComplete={
              handleAnimationComplete
            }
          />

          <OrbitControls
            enableRotate={
              !animation &&
              !playing
            }
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

            {/* CURRENT STATE */}
            <div className="mb-4 text-center">
              {visualStep === 0 ? (
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
                    {
                      currentMove?.notation
                    }
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
                  disabled={
                    !!animation
                  }
                  onClick={() =>
                    goToStep(0)
                  }
                  className={[
                    "flex min-w-[80px] flex-col items-center rounded-xl border px-3 py-2 transition",
                    visualStep ===
                    0
                      ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10",
                    animation
                      ? "cursor-not-allowed opacity-60"
                      : "",
                  ].join(
                    " ",
                  )}
                >
                  <span className="text-[10px] uppercase tracking-wide opacity-70">
                    Step
                  </span>

                  <span className="text-sm font-bold">
                    Start
                  </span>
                </button>

                {/* MOVE STEPS */}
                {moves.map(
                  (
                    move,
                    index,
                  ) => {
                    const step =
                      index + 1;

                    return (
                      <button
                        key={`${move.notation}-${index}`}
                        type="button"
                        disabled={
                          !!animation
                        }
                        onClick={() =>
                          goToStep(
                            step,
                          )
                        }
                        className={[
                          "flex min-w-[58px] flex-col items-center rounded-xl border px-3 py-2 transition",
                          visualStep ===
                          step
                            ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : visualStep >
                                step
                              ? "border-green-500/30 bg-green-500/10 text-green-300"
                              : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10",
                          animation
                            ? "cursor-not-allowed opacity-60"
                            : "",
                        ].join(
                          " ",
                        )}
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
                  disabled={
                    !!animation
                  }
                  onClick={() =>
                    goToStep(
                      moves.length,
                    )
                  }
                  className={[
                    "flex min-w-[70px] flex-col items-center rounded-xl border px-3 py-2 transition",
                    visualStep ===
                    moves.length
                      ? "border-green-500 bg-green-600 text-white shadow-lg shadow-green-500/20"
                      : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10",
                    animation
                      ? "cursor-not-allowed opacity-60"
                      : "",
                  ].join(
                    " ",
                  )}
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
                  Step{" "}
                  {visualStep} /{" "}
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
            {/* CONTROLS                                         */}
            {/* ================================================= */}

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">

              {/* PREVIOUS */}
              <button
                type="button"
                disabled={
                  visualStep ===
                    0 ||
                  !!animation
                }
                onClick={
                  goPrevious
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              {/* PLAY */}
              <button
                type="button"
                disabled={
                  !!animation
                }
                onClick={
                  playing
                    ? () =>
                        setPlaying(
                          false,
                        )
                    : play
                }
                className="min-w-[110px] rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                  visualStep >=
                    moves.length ||
                  !!animation
                }
                onClick={
                  goNext
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>

              {/* RESET */}
              <button
                type="button"
                disabled={
                  visualStep ===
                    0 ||
                  !!animation
                }
                onClick={
                  reset
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
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

