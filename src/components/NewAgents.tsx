export default function NewAgents() {
  return (
    <section id="new-agents" className="py-24 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40 font-semibold tracking-widest uppercase text-sm mb-3">
            New to Real Estate?
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Fast-Track Your Success
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-12">
            Our program is built for new agents who want real training, real
            support, and a commission plan that rewards growth — not just empty
            promises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Real Training",
              description:
                "Hands-on training that teaches you what works right now in today's market. No outdated textbook theory.",
            },
            {
              step: "02",
              title: "Real Support",
              description:
                "One-on-one mentorship with someone actually invested in your success. Weekly coaching with actionable strategies.",
            },
            {
              step: "03",
              title: "Real Compensation",
              description:
                "A commission plan that rewards growth. More deals = bigger splits. You work hard — you should get paid accordingly.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-colors"
            >
              <span className="text-5xl font-bold text-white/10">
                {item.step}
              </span>
              <h3 className="text-xl font-bold mt-4 mb-3">{item.title}</h3>
              <p className="text-white/50 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="#join"
            className="inline-block rounded-full bg-white px-8 py-4 text-lg font-semibold text-black hover:bg-gray-200 transition-all hover:scale-105"
          >
            Start Your Career
          </a>
        </div>
      </div>
    </section>
  );
}
