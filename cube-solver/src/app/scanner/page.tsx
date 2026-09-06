import CubeEditor from "@/src/components/cube/CubeEditor";
import CubeScanner from "@/src/components/scanner/CubeScanner";

export default function ScannerPage() {
  return (
    <main className="min-h-screen bg-[#FBFBFA] text-zinc-900">
      <CubeScanner />
      <CubeEditor/>
    </main>
  );
}



// "use client";

// import { useState } from "react";
// import CubeScanner from "@/src/components/solver/CubeScanner";
// import CubeEditor from "@/src/components/solver/CubeEditor";

// export default function SolverPage() {
//   const [cubeState, setCubeState] = useState<any>(null);

//   return (
//     <main className="min-h-screen">
//       {!cubeState ? (
//         <CubeScanner
//           onScanComplete={(scannedCube) => {
//             setCubeState(scannedCube);
//           }}
//         />
//       ) : (
//         <CubeEditor
//           initialCubeState={cubeState}
//           onSolve={(editedCube) => {
//             console.log("Cube ready for solver:", editedCube);
//           }}
//         />
//       )}
//     </main>
//   );
// }