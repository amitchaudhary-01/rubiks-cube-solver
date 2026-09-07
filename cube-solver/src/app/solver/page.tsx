"use client";

import RubiksCube3D from "@/src/components/solver/cube3D/RubiksCube3D";

export default function SolverPage() {
  const cubeString =
    "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

  const solution = "R U R' U'";

  return (
    <main className="min-h-screen">
      <RubiksCube3D
        kociembaString={cubeString}
        solution={solution}
        autoPlay={false}
      />
    </main>
  );
}