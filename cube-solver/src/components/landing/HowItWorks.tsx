import CubeStatePreview from "./CubeStatePreview";

const steps = [
  {
    number: "1",
    title: "Position your cube",
    description: "Place one face of your cube inside the scanner.",
  },
  {
    number: "2",
    title: "Scan all six faces",
    description: "The system detects the colors and builds the cube state.",
  },
  {
    number: "3",
    title: "Generate the solution",
    description: "The solver calculates the moves required to solve your cube.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-gray-50 py-16"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">

        <div>
          <p className="text-sm font-semibold text-blue-600">
            HOW IT WORKS
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            From scrambled cube to solution
          </h2>

          <p className="mt-4 text-gray-600">
            Scan your cube and let the application handle
            the cube state and solution.
          </p>

          <div className="mt-8 space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {step.number}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {step.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <CubeStatePreview />

      </div>
    </section>
  );
}