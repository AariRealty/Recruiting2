const plans = [
  {
    name: "Growth Plan",
    split: "70/30",
    description: "Perfect for new agents building their pipeline",
    features: [
      "All technology included",
      "Full training access",
      "Mentor program",
      "Marketing support",
      "Office space access",
    ],
    highlighted: false,
  },
  {
    name: "Professional Plan",
    split: "80/20",
    description: "For agents ready to accelerate their business",
    features: [
      "Everything in Growth",
      "Advanced coaching sessions",
      "Priority lead routing",
      "Enhanced marketing budget",
      "Transaction coordinator support",
    ],
    highlighted: true,
  },
  {
    name: "100% Plan",
    split: "100%",
    description: "For top producers who want to keep it all",
    features: [
      "Keep 100% of your commission",
      "All technology included",
      "Small monthly flat fee",
      "Full brokerage support",
      "Complete autonomy",
    ],
    highlighted: false,
  },
];

export default function Commission() {
  return (
    <section id="commission" className="py-24 bg-section-alt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-3">
            Commission Plans
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-4">
            Flexible Plans That Grow With You
          </h2>
          <p className="max-w-2xl mx-auto text-muted text-lg">
            Choose the commission structure that fits your business today, and
            change it as often as every 90 days as your needs evolve.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 transition-shadow duration-300 ${
                plan.highlighted
                  ? "bg-primary text-white shadow-2xl shadow-primary/25 scale-105"
                  : "bg-white border border-gray-100 hover:shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-primary-dark text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
                  Most Popular
                </div>
              )}

              <h3
                className={`text-lg font-bold mb-1 ${plan.highlighted ? "text-white" : "text-primary-dark"}`}
              >
                {plan.name}
              </h3>
              <p
                className={`text-sm mb-6 ${plan.highlighted ? "text-white/70" : "text-muted"}`}
              >
                {plan.description}
              </p>

              <div className="mb-8">
                <span
                  className={`text-5xl font-bold ${plan.highlighted ? "text-accent" : "text-primary"}`}
                >
                  {plan.split}
                </span>
                {plan.split !== "100%" && (
                  <span
                    className={`text-sm ml-2 ${plan.highlighted ? "text-white/60" : "text-muted"}`}
                  >
                    agent/brokerage
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-accent" : "text-accent"}`}
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
                        plan.highlighted ? "text-white/90" : "text-foreground/80"
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
                    ? "bg-accent text-primary-dark hover:bg-accent-light"
                    : "bg-primary text-white hover:bg-primary-light"
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
