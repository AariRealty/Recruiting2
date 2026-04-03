export default function Benefits() {
  return (
    <section id="benefits" className="py-24 bg-section-alt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>
            <p className="text-black/40 font-semibold tracking-widest uppercase text-sm mb-3">
              What You Get
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-6">
              Tools & Support That Make a Difference
            </h2>
            <p className="text-muted text-lg leading-relaxed mb-8">
              We give you everything you need to focus on what matters most —
              closing deals and growing your business. No hidden fees, no
              surprises.
            </p>
            <div className="flex items-center gap-4 p-4 bg-black rounded-xl">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">$0</span>
              </div>
              <div>
                <p className="font-semibold text-white">
                  No Hidden Costs
                </p>
                <p className="text-sm text-white/60">
                  Fair splits with no weird fine print — your hard work pays you
                </p>
              </div>
            </div>
          </div>

          {/* Right grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "CRM System",
                description: "Stay organized and on track with a CRM built for agents",
              },
              {
                title: "Marketing Support",
                description: "Leads, listings, and branding — all handled for you",
              },
              {
                title: "Transaction Coordination",
                description: "Less paperwork, more deals — we cover the details",
              },
              {
                title: "Listing Management",
                description: "Look polished and sell faster with professional support",
              },
              {
                title: "Weekly Coaching",
                description: "Real strategies you can actually use in today's market",
              },
              {
                title: "One-on-One Mentorship",
                description: "Personalized guidance from someone invested in you",
              },
            ].map((tool) => (
              <div
                key={tool.title}
                className="flex flex-col p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-50"
              >
                <h4 className="font-semibold text-black mb-1">
                  {tool.title}
                </h4>
                <p className="text-sm text-muted">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
