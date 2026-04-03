const plans = [
  {
    name: "Starter",
    split: "75/25",
    deals: "0–5 transactions",
    description: "Perfect for new agents building their business",
    features: [
      "Lofty CRM included",
      "SkySlope transaction management",
      "Canva Pro & social media templates",
      "One-on-one mentorship",
      "Weekly coaching sessions",
      "Transaction coordination",
    ],
    highlighted: false,
  },
  {
    name: "Growth",
    split: "90/10",
    deals: "6–10 transactions",
    description: "For agents gaining momentum and closing more",
    features: [
      "Everything in Starter",
      "Higher split — keep more of what you earn",
      "Advanced coaching strategies",
      "Priority marketing support",
      "Professional listing management",
      "Branding & social media support",
    ],
    highlighted: true,
  },
  {
    name: "Top Producer",
    split: "100%",
    deals: "11+ transactions",
    description: "For top producers who want to keep it all",
    features: [
      "Keep 100% of your commission",
      "All tools & technology included",
      "Full brokerage support",
      "Complete autonomy",
      "Continued mentorship access",
      "You earned it — you keep it",
    ],
    highlighted: false,
  },
];

export default function Commission() {
  return (
    <section id="commission" className="py-24 bg-[#f9f9f9]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-black/40 font-semibold tracking-widest uppercase text-sm mb-3">
            Commission Plans
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Your Commission Grows With You
          </h2>
          <p className="max-w-2xl mx-auto text-gray-500 text-lg">
            More deals = bigger splits. Start at 75/25 and work your way to
            keeping 100% of your commission. No caps, no games.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 transition-shadow duration-300 ${
                plan.highlighted
                  ? "bg-black text-white shadow-2xl shadow-black/25 lg:scale-105"
                  : "bg-white border border-gray-100 hover:shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
                  Most Popular
                </div>
              )}

              <h3
                className={`text-lg font-bold mb-1 ${plan.highlighted ? "text-white" : "text-black"}`}
              >
                {plan.name}
              </h3>
              <p
                className={`text-sm mb-2 ${plan.highlighted ? "text-white/60" : "text-gray-500"}`}
              >
                {plan.description}
              </p>
              <p
                className={`text-xs font-semibold tracking-wider uppercase mb-6 ${plan.highlighted ? "text-white/40" : "text-gray-400"}`}
              >
                {plan.deals}
              </p>

              <div className="mb-8">
                <span
                  className={`text-5xl font-bold ${plan.highlighted ? "text-white" : "text-black"}`}
                >
                  {plan.split}
                </span>
                {plan.split !== "100%" && (
                  <span
                    className={`text-sm ml-2 ${plan.highlighted ? "text-white/50" : "text-gray-400"}`}
                  >
                    agent / brokerage
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-white" : "text-black"}`}
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
                    <span
                      className={
                        plan.highlighted ? "text-white/80" : "text-gray-600"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#join"
                className={`block text-center rounded-full py-3 font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
