"use client";

import { useState } from "react";

const plans = [
  {
    id: "growth",
    name: "Aari Growth",
    split: "75 / 25",
    monthlyFee: "$39",
    transactionFee: "$299",
    badge: null,
    includes: [
      "⭐️⭐️ Transaction Coordination (done for you)",
      "⭐️ Marketing Essentials",
      "Accountability club",
      "One-on-one with broker",
    ],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Aari Pro",
    split: "90 / 10",
    monthlyFee: "$69",
    transactionFee: "$349",
    badge: "Most Agents Start Here",
    includes: [
      "⭐️ Deal support when you need it",
      "More control over your business",
    ],
    highlighted: true,
  },
  {
    id: "max",
    name: "Aari Max",
    split: "100%",
    monthlyFee: "$99",
    transactionFee: "$399",
    badge: null,
    includes: [
      "Clean transaction structure",
      "Independent workflow",
    ],
    highlighted: false,
  },
];

const addOns = [
  {
    name: "CRM System",
    price: "$49",
    features: ["Manage contacts, track activity, and stay organized"],
  },
  {
    name: "Marketing System",
    price: "$49",
    features: [
      "Video recording sessions",
      "Pop-by strategy + execution",
      "Social media planning",
      "Social media templates",
      "Accountability club",
    ],
  },
];

export default function Commission() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <section id="commission" className="py-24 bg-[#f9f9f9]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-black/40 font-semibold tracking-widest uppercase text-sm mb-3">
            Aari Realty
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Commission Structure
          </h2>
        </div>

        {/* Compliance banner */}
        <div className="max-w-6xl mx-auto mb-4">
          <div className="bg-black text-white text-center rounded-xl px-6 py-4">
            <p className="text-sm font-medium">
              $199/year — E&amp;O + Compliance (all agents)
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mb-12">
          <p className="text-center text-sm text-black/40">
            One flat transaction fee per plan
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-black text-white shadow-2xl shadow-black/25 lg:scale-105"
                    : "bg-white border border-gray-100 hover:shadow-lg"
                } ${isSelected ? "ring-2 ring-black ring-offset-2" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <h3
                  className={`text-xl font-bold mb-4 ${plan.highlighted ? "text-white" : "text-black"}`}
                >
                  {plan.name}
                </h3>

                <div className="mb-4">
                  <span
                    className={`text-5xl font-bold ${plan.highlighted ? "text-white" : "text-black"}`}
                  >
                    {plan.split}
                  </span>
                </div>

                <p
                  className={`text-sm mb-6 ${plan.highlighted ? "text-white/60" : "text-gray-500"}`}
                >
                  {plan.monthlyFee}/month · {plan.transactionFee} per transaction
                </p>

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

                <button
                  onClick={() =>
                    setSelectedPlan(isSelected ? null : plan.id)
                  }
                  className={`block w-full text-center rounded-full py-3 font-semibold transition-all cursor-pointer ${
                    plan.highlighted
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {isSelected ? "Selected ✓" : "Select Plan"}
                </button>
              </div>
            );
          })}
        </div>

        {/* ADD-ONS — shown after plan is selected */}
        {selectedPlan && (
          <div className="max-w-6xl mx-auto mt-16">
            <div className="text-center mb-8">
              <p className="text-black/40 font-semibold tracking-widest uppercase text-sm mb-3">
                Optional
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-black">
                Add-Ons
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {addOns.map((addon) => (
                <div
                  key={addon.name}
                  className="rounded-2xl bg-white border border-gray-100 p-8 hover:shadow-lg transition-shadow"
                >
                  <h4 className="text-lg font-bold text-black mb-1">
                    {addon.name}
                  </h4>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold text-black">
                      {addon.price}
                    </span>
                    <span className="text-gray-400 text-sm ml-1">/month</span>
                  </div>
                  <ul className="space-y-2">
                    {addon.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
