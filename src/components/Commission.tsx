const plans = [
  {
    name: "Aari Growth",
    split: "75/25",
    monthlyFee: "$39",
    badge: null,
    availability: "Where every agent starts",
    yearlyFee: "$199/year",
    yearlyLabel: "E&O + Compliance",
    transactionFee: "$299",
    transactionLabel: "Transaction Processing Fee (all transaction types)",
    position: "Full support environment to build and grow with broker engagement",
    capNote: "Available after 5 transactions: upgrade to Pro or Max",
    includes: [
      "Full transaction coordination (all paperwork done for you)",
      "Hands-on broker engagement",
      "SkySlope + SkySlope Books access",
    ],
    highlighted: false,
  },
  {
    name: "Aari Pro",
    split: "90/10",
    monthlyFee: "$69",
    badge: "Most Popular",
    availability: "Available after 5 transactions",
    yearlyFee: "$199/year",
    yearlyLabel: "E&O + Compliance",
    transactionFee: "$299",
    transactionLabel: "Transaction Processing Fee (all transaction types)",
    position: "Independent with guidance when needed",
    capNote: null,
    includes: [
      "Marketing tools included ($99/mo value)",
      "Video recording sessions",
      "Pop-by strategy + execution",
      "Social media planning & templates",
      "Accountability sessions",
      "One-on-one with broker",
      "Broker access for deal guidance",
      "SkySlope + SkySlope Books access",
    ],
    highlighted: true,
  },
  {
    name: "Aari Max",
    split: "100%",
    monthlyFee: "$99",
    badge: null,
    availability: "Keep 100% of your commission",
    yearlyFee: "$199/year",
    yearlyLabel: "E&O + Compliance",
    transactionFee: "$399",
    transactionLabel: "Transaction Processing Fee",
    position: "Fully independent — complete autonomy over your business",
    capNote: null,
    includes: [
      "SkySlope + SkySlope Books access",
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
            Choose the plan that fits your business. Start with full support or
            go independent — every plan includes SkySlope and a clear path
            forward.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 transition-shadow duration-300 ${
                plan.highlighted
                  ? "bg-black text-white shadow-2xl shadow-black/25 lg:scale-105"
                  : "bg-white border border-gray-100 hover:shadow-lg"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
                  {plan.badge}
                </div>
              )}

              <h3
                className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-black"}`}
              >
                {plan.name}
              </h3>
              <p
                className={`text-xs font-medium mb-4 ${plan.highlighted ? "text-white/40" : "text-gray-400"}`}
              >
                {plan.availability}
              </p>

              {/* Split */}
              <div className="mb-2">
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

              {/* Monthly fee */}
              <p
                className={`text-sm font-semibold mb-6 ${plan.highlighted ? "text-white/70" : "text-gray-600"}`}
              >
                {plan.monthlyFee}
                <span
                  className={`font-normal ${plan.highlighted ? "text-white/40" : "text-gray-400"}`}
                >
                  /month
                </span>
              </p>

              {/* Fees */}
              <div
                className={`space-y-3 mb-6 pb-6 border-b ${plan.highlighted ? "border-white/10" : "border-gray-100"}`}
              >
                <div>
                  <span
                    className={`text-base font-bold ${plan.highlighted ? "text-white" : "text-black"}`}
                  >
                    {plan.yearlyFee}
                  </span>
                  <p
                    className={`text-xs ${plan.highlighted ? "text-white/50" : "text-gray-400"}`}
                  >
                    {plan.yearlyLabel}
                  </p>
                </div>
                <div>
                  <span
                    className={`text-base font-bold ${plan.highlighted ? "text-white" : "text-black"}`}
                  >
                    {plan.transactionFee}
                  </span>
                  <p
                    className={`text-xs ${plan.highlighted ? "text-white/50" : "text-gray-400"}`}
                  >
                    {plan.transactionLabel}
                  </p>
                </div>
              </div>

              {/* Includes */}
              <div className="mb-4 flex-1">
                <p
                  className={`text-xs font-semibold tracking-wider uppercase mb-3 ${plan.highlighted ? "text-white/40" : "text-gray-400"}`}
                >
                  Includes
                </p>
                <ul className="space-y-2">
                  {plan.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <svg
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-white" : "text-black"}`}
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
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Position */}
              <div
                className={`mb-4 p-3 rounded-lg ${plan.highlighted ? "bg-white/5" : "bg-gray-50"}`}
              >
                <p
                  className={`text-xs font-semibold tracking-wider uppercase mb-1 ${plan.highlighted ? "text-white/40" : "text-gray-400"}`}
                >
                  Position
                </p>
                <p
                  className={`text-sm font-medium ${plan.highlighted ? "text-white/80" : "text-gray-700"}`}
                >
                  {plan.position}
                </p>
              </div>

              {/* Cap note */}
              {plan.capNote && (
                <p
                  className={`text-xs italic mb-4 ${plan.highlighted ? "text-white/40" : "text-gray-400"}`}
                >
                  {plan.capNote}
                </p>
              )}

              <a
                href="#calendar"
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
