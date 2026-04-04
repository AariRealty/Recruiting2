"use client";

import { useState } from "react";

const plans = [
  {
    tag: "Full Service · Full Support",
    name: "Aari Pro",
    split: "90 / 10 Split · $100/quarter",
    badge: "Most Selected",
    features: [
      "Direct broker access on every deal — call or text, no runaround",
      "Contract guidance and deal support",
      "Compliance audit included",
      "Discounted transaction coordination through Aari Transactions LLC",
      "Access to Aari systems, tools, and templates",
    ],
    idealLabel: "Best for",
    idealText:
      "Agents who want a broker that's actually in their corner — with the support, systems, and guidance to grow with confidence.",
    highlighted: false,
  },
  {
    tag: "Independence",
    name: "Aari Max",
    split: "100% Commission · $100/month",
    badge: null,
    features: [
      "Keep 100% of every commission",
      "Compliance audit included",
      "Broker license and compliance coverage",
    ],
    idealLabel: "Best for",
    idealText:
      "Experienced, self-sufficient agents who need a compliant brokerage home — not hands-on support.",
    highlighted: true,
  },
];

export default function Commission() {
  const [mentorshipOpen, setMentorshipOpen] = useState(false);

  return (
    <section id="plans" className="bg-[#0a0a0a] px-6 lg:px-20 py-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-14 pb-8 border-b border-white/8 reveal">
        <div>
          <p className="text-[9px] font-semibold tracking-[3px] uppercase text-white/30 mb-3.5">
            Commission Structure
          </p>
          <h2 className="font-[family-name:var(--font-serif)] text-[clamp(36px,4vw,54px)] font-light leading-[1.08] text-white">
            Two plans.
            <br />
            Both built to perform.
          </h2>
        </div>
        <p className="text-[11px] font-normal text-white/30 max-w-[220px] text-left lg:text-right leading-[1.7] mt-4 lg:mt-0">
          All plans include E&amp;O insurance. Standard transaction fees apply per closing.
        </p>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-white/10 mb-10 reveal">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-8 sm:p-11 border-b lg:border-b-0 lg:border-r border-white/10 last:border-r-0 last:border-b-0 transition-colors duration-300 relative ${
              plan.highlighted
                ? "bg-white hover:bg-[#f5f5f5]"
                : "hover:bg-white/[0.02]"
            }`}
          >
            {plan.badge && (
              <span
                className={`absolute -top-px left-8 text-[8px] font-bold tracking-[2px] uppercase px-3.5 py-1.5 ${
                  plan.highlighted
                    ? "bg-[#0a0a0a] text-white"
                    : "bg-white text-[#0a0a0a]"
                }`}
              >
                {plan.badge}
              </span>
            )}

            <p
              className={`text-[9px] font-semibold tracking-[2.5px] uppercase mb-[18px] ${
                plan.highlighted ? "text-[rgba(10,10,10,0.4)]" : "text-white/30"
              }`}
            >
              {plan.tag}
            </p>
            <h3
              className={`font-[family-name:var(--font-serif)] text-[42px] font-light mb-1.5 ${
                plan.highlighted ? "text-[#0a0a0a]" : "text-white"
              }`}
            >
              {plan.name}
            </h3>
            <p
              className={`text-[11px] font-medium tracking-[1px] mb-8 pb-8 border-b ${
                plan.highlighted
                  ? "text-[rgba(10,10,10,0.45)] border-[rgba(10,10,10,0.1)]"
                  : "text-white/40 border-white/8"
              }`}
            >
              {plan.split}
            </p>

            <ul className="list-none flex flex-col gap-3.5 mb-9">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className={`text-[11px] font-normal leading-[1.5] flex items-start gap-2.5 ${
                    plan.highlighted
                      ? "text-[rgba(10,10,10,0.7)]"
                      : "text-white/60"
                  }`}
                >
                  <span
                    className={`text-[10px] shrink-0 mt-px ${
                      plan.highlighted
                        ? "text-[rgba(10,10,10,0.25)]"
                        : "text-white/25"
                    }`}
                  >
                    &rarr;
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <p
              className={`text-[9px] font-semibold tracking-[1.5px] uppercase mb-1.5 ${
                plan.highlighted
                  ? "text-[rgba(10,10,10,0.3)]"
                  : "text-white/25"
              }`}
            >
              {plan.idealLabel}
            </p>
            <p
              className={`text-[11px] font-normal leading-[1.6] ${
                plan.highlighted
                  ? "text-[rgba(10,10,10,0.55)]"
                  : "text-white/45"
              }`}
            >
              {plan.idealText}
            </p>
          </div>
        ))}
      </div>

      {/* Mentorship Toggle */}
      <div id="mentorship-section">
        <div
          className="border border-white/10 border-t-0 px-6 sm:px-11 py-7 flex flex-col lg:flex-row items-start lg:items-center justify-between cursor-pointer transition-colors duration-300 hover:bg-white/[0.02] reveal"
          onClick={() => setMentorshipOpen(!mentorshipOpen)}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-5">
            <div className="flex flex-col gap-1.5">
              <span className="font-[family-name:var(--font-serif)] text-[22px] font-light text-white">
                Aari Mentorship
              </span>
              <span className="text-[9px] font-semibold tracking-[2px] uppercase text-white/30 whitespace-nowrap">
                For New Agents
              </span>
            </div>
            <span className="text-[10px] font-normal text-white/35 lg:ml-5">
              New to real estate? You don&apos;t have to figure it out alone.
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-[9px] font-semibold tracking-[2px] uppercase text-white/45 cursor-pointer whitespace-nowrap mt-4 lg:mt-0">
            {mentorshipOpen ? "Close" : "Learn More"}
            <svg
              width="14"
              height="8"
              viewBox="0 0 14 8"
              fill="none"
              className={`transition-transform duration-300 ${mentorshipOpen ? "rotate-180" : ""}`}
            >
              <path
                d="M1 1l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div
          className={`border border-white/10 border-t-0 overflow-hidden transition-all duration-400 ${
            mentorshipOpen ? "max-h-[300px] px-6 sm:px-11 py-8" : "max-h-0 px-6 sm:px-11 py-0"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <p className="text-[13px] font-normal text-white/55 leading-[1.85] mb-5 max-w-[560px]">
              The Aari Mentorship Program pairs new agents with experienced
              guidance from day one — real deals, real support, no guesswork.
            </p>
            <p className="text-[13px] font-normal text-white/40 leading-[1.85] mb-7">
              Spots are limited. Reach out to learn if you&apos;re a fit.
            </p>
            <a
              href="https://wa.me/12392018950?text=Hi%20Marlenyi%2C%20I%20saw%20the%20Aari%20Realty%20recruiting%20page%20and%20had%20a%20question."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] text-white no-underline text-[9px] font-bold tracking-[2px] uppercase px-7 py-3.5 rounded transition-all duration-300 hover:bg-[#1ebe5a]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              Let&apos;s Chat
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
