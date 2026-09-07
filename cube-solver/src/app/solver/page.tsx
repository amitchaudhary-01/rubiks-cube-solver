"use client";

import { useState } from "react";
import RubiksCube3D from "@/src/components/solver/cube3D/RubiksCube3D";

export default function SolverPage() {
  const [cubeString, setCubeString] = useState<string | null>(null);
  const [solution, setSolution] = useState<string>("");

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