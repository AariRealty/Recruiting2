const plans = [
  {
    name: "Aari Growth",
    split: "75 / 25",
    monthlyFee: "$39",
    transactionFee: "$299",
    badge: null,
    callouts: [
      "Full transaction coordination (all paperwork handled for you)",
      "Marketing essentials",
    ],
    includes: [
      "Accountability club",
      "One-on-one with broker",
      "SkySlope Suite",
      "SkySlope Books",
    ],
    highlighted: false,
  },
  {
    name: "Aari Pro",
    split: "90 / 10",
    monthlyFee: "$69",
    transactionFee: "$349",
    badge: "Most Agents Start Here",
    callouts: [
      "90/10 commission split",
      "More control over your business",
    ],
    includes: [
      "Marketing support",
      "SkySlope Suite",
      "SkySlope Books",
    ],
    highlighted: true,
  },
  {
    name: "Aari Max",
    split: "100%",
    monthlyFee: "$99",
    transactionFee: "$399",
    badge: null,
    callouts: [
      "100% commission",
      "Full control of your business",
    ],
    includes: [
      "SkySlope Suite",
      "SkySlope Books",
      "Broker support when needed",
    ],
    highlighted: false,
  },
];

export default function Commission() {
  return (
    <section id="commission" className="py-24 bg-[#f9f9f9]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-black/40 font-semibold tracking-widest uppercase text-sm mb-3">
            Step 01
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Choose Your Structure
          </h2>
        </div>

        {/* Compliance banner */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="bg-black text-white text-center rounded-xl px-6 py-4">
            <p className="text-sm font-medium">
              $199/year — E&amp;O + Compliance · Applies to all agents · Billed
              after ICA is signed · Renews annually
            </p>
          </div>
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
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              {/* Name */}
              <h3
                className={`text-xl font-bold mb-4 ${plan.highlighted ? "text-white" : "text-black"}`}
              >
                {plan.name}
              </h3>

              {/* Split */}
              <div className="mb-4">
                <span
                  className={`text-5xl font-bold ${plan.highlighted ? "text-white" : "text-black"}`}
                >
                  {plan.split}
                </span>
              </div>

              {/* Monthly + Transaction Fee */}
              <p
                className={`text-sm mb-6 ${plan.highlighted ? "text-white/60" : "text-gray-500"}`}
              >
                {plan.monthlyFee}/month · {plan.transactionFee} Transaction Fee
              </p>

              {/* Callouts */}
              <div
                className={`mb-6 pb-6 border-b ${plan.highlighted ? "border-white/10" : "border-gray-100"}`}
              >
                {plan.callouts.map((callout) => (
                  <p
                    key={callout}
                    className={`text-sm font-semibold leading-relaxed ${plan.highlighted ? "text-white" : "text-black"}`}
                  >
                    {callout}
                  </p>
                ))}
              </div>

              {/* Includes */}
              <div className="mb-6 flex-1">
                <p
                  className={`text-xs font-semibold tracking-wider uppercase mb-3 ${plan.highlighted ? "text-white/40" : "text-gray-400"}`}
                >
                  Includes
                </p>
                <ul className="space-y-2">
                  {plan.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span
                        className={plan.highlighted ? "text-white/50" : "text-gray-400"}
                      >
                        →
                      </span>
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
