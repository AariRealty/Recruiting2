const tiles = [
  {
    title: "Content Studio",
    description:
      "Branded templates and tools to create clean, consistent marketing",
  },
  {
    title: "Accountability Club",
    description:
      "Stay consistent with content, follow-through, and execution",
  },
  {
    title: "Lead Distribution",
    description:
      "Inbound leads routed through brokerage systems when available",
  },
  {
    title: "SkySlope Suite",
    description:
      "Manage transactions, documents, and compliance in one place",
  },
  {
    title: "SkySlope Books",
    description:
      "Track commissions, payouts, and production in real time",
  },
  {
    title: "File Compliance Review",
    description:
      "Every file is reviewed for accuracy, completeness, and compliance",
  },
];

export default function Tiles() {
  return (
    <section className="py-24 bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiles.map((tile) => (
            <div
              key={tile.title}
              className="rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-colors"
            >
              <h3 className="text-lg font-bold mb-2">{tile.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">
                {tile.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
