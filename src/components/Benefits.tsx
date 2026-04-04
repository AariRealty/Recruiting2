export default function Benefits() {
  return (
    <section id="benefits" className="py-24 bg-[#f9f9f9]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-black/40 font-semibold tracking-widest uppercase text-sm mb-3">
            Step 02
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Business Tools
          </h2>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="rounded-2xl bg-white border border-gray-100 p-8 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-black mb-1">
              Marketing + CRM System
            </h3>

            <div className="mt-4 mb-6">
              <span className="text-5xl font-bold text-black">$50</span>
              <span className="text-gray-400 text-sm ml-1">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Video recording sessions",
                "Pop-by strategy + execution",
                "Social media planning",
                "Social media templates",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href="#calendar"
              className="block text-center rounded-full py-3 font-semibold bg-black text-white hover:bg-gray-800 transition-all"
            >
              Add to Any Plan
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
