export default function Benefits() {
  return (
    <section id="benefits" className="py-24 bg-[#f9f9f9]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-black/40 font-semibold tracking-widest uppercase text-sm mb-3">
            Business Tools
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Everything You Need to Grow
          </h2>
          <p className="max-w-2xl mx-auto text-gray-500 text-lg">
            Choose the package that fits your business. Both plans give you the
            tools and support to close more deals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* $99/month plan */}
          <div className="flex flex-col rounded-2xl bg-white border border-gray-100 p-8 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-black mb-1">
              Marketing Essentials
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Access to brokerage marketing activities
            </p>

            <div className="mb-8">
              <span className="text-5xl font-bold text-black">$99</span>
              <span className="text-gray-400 text-sm ml-1">/month</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Video recording sessions",
                "Pop-by strategy + execution",
                "Social media planning",
                "Social media templates",
                "Accountability sessions",
                "One-on-one with broker",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <svg
                    className="w-5 h-5 text-black flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href="#join"
              className="block text-center rounded-full py-3 font-semibold bg-black text-white hover:bg-gray-800 transition-all"
            >
              Get Started
            </a>
          </div>

          {/* $149/month plan */}
          <div className="relative flex flex-col rounded-2xl bg-black text-white p-8 shadow-2xl shadow-black/25 lg:scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
              Best Value
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Marketing + CRM + Leads
            </h3>
            <p className="text-sm text-white/60 mb-6">
              Everything in Essentials plus CRM and lead generation
            </p>

            <div className="mb-8">
              <span className="text-5xl font-bold text-white">$149</span>
              <span className="text-white/40 text-sm ml-1">/month</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Everything in Marketing Essentials",
                "Lofty CRM access",
                "Lead generation",
                "Video recording sessions",
                "Pop-by strategy + execution",
                "Social media planning",
                "Social media templates",
                "Accountability sessions",
                "One-on-one with broker",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <svg
                    className="w-5 h-5 text-white flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href="#join"
              className="block text-center rounded-full py-3 font-semibold bg-white text-black hover:bg-gray-200 transition-all"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
