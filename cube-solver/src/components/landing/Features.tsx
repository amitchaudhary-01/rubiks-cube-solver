const features = [
  {
    number: "01",
    title: "Scan Your Cube",
    description:
      "Use your camera to scan each face of your Rubik's Cube.",
  },
  {
    number: "02",
    title: "Detect Colors",
    description:
      "The system automatically recognizes the colors of each sticker.",
  },
  {
    number: "03",
    title: "Validate",
    description:
      "The system checks whether the detected cube state is valid.",
  },
  {
    number: "04",
    title: "Solve",
    description:
      "Get an efficient sequence of moves to solve your cube.",
  },
];

export default function Features() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-blue-600">
            FEATURES
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Everything you need to solve your cube
          </h2>

          <p className="mt-4 text-gray-600">
            A simple workflow from scanning your scrambled cube
            to following the solution.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="rounded-xl border border-gray-200 bg-gray-50 p-6 hover:shadow-md"
            >
              <span className="text-sm font-semibold text-blue-600">
                {feature.number}
              </span>

              <h3 className="mt-4 font-semibold text-gray-900">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}