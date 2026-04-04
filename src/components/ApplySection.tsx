"use client";

export default function ApplySection() {
  function selectRadio(label: HTMLElement, name: string) {
    document
      .querySelectorAll(`input[name="${name}"]`)
      .forEach((r) => {
        (r as HTMLInputElement)
          .closest(".q-radio-label")
          ?.classList.remove("selected");
      });
    label.classList.add("selected");
  }

  return (
    <section id="apply" className="bg-white px-6 lg:px-20 py-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-14 pb-8 border-b border-[rgba(10,10,10,0.1)] reveal">
        <div>
          <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[rgba(10,10,10,0.4)] mb-3.5">
            Agent Application
          </p>
          <h2 className="font-[family-name:var(--font-serif)] text-[clamp(36px,4vw,54px)] font-light leading-[1.08] text-[#0a0a0a]">
            Tell us about
            <br />
            where you are.
          </h2>
        </div>
        <p className="text-[11px] font-normal text-[#5a5a5a] max-w-[240px] text-left lg:text-right leading-[1.7] mt-4 lg:mt-0">
          Answer a few quick questions. We will review your submission and be in
          touch within 1-2 business days.
        </p>
      </div>

      {/* Form */}
      <div className="reveal">
        {/* Full Name */}
        <div className="border-t border-[rgba(10,10,10,0.1)] py-5 sm:py-7 grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-3 sm:gap-10 items-center">
          <label className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#5a5a5a]">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Your full name"
            className="w-full bg-transparent border-0 border-b border-[rgba(10,10,10,0.15)] py-2.5 font-[family-name:var(--font-sans)] text-[13px] font-normal text-[#0a0a0a] outline-none transition-colors duration-300 focus:border-[#0a0a0a] placeholder:text-[rgba(10,10,10,0.25)]"
          />
        </div>

        {/* Email */}
        <div className="border-t border-[rgba(10,10,10,0.1)] py-5 sm:py-7 grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-3 sm:gap-10 items-center">
          <label className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#5a5a5a]">
            Email Address
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full bg-transparent border-0 border-b border-[rgba(10,10,10,0.15)] py-2.5 font-[family-name:var(--font-sans)] text-[13px] font-normal text-[#0a0a0a] outline-none transition-colors duration-300 focus:border-[#0a0a0a] placeholder:text-[rgba(10,10,10,0.25)]"
          />
        </div>

        {/* Phone */}
        <div className="border-t border-[rgba(10,10,10,0.1)] py-5 sm:py-7 grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-3 sm:gap-10 items-center">
          <label className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#5a5a5a]">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="(239) 000-0000"
            className="w-full bg-transparent border-0 border-b border-[rgba(10,10,10,0.15)] py-2.5 font-[family-name:var(--font-sans)] text-[13px] font-normal text-[#0a0a0a] outline-none transition-colors duration-300 focus:border-[#0a0a0a] placeholder:text-[rgba(10,10,10,0.25)]"
          />
        </div>

        {/* License */}
        <div className="border-t border-[rgba(10,10,10,0.1)] py-5 sm:py-7 grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-3 sm:gap-10 items-center">
          <label className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#5a5a5a]">
            Florida License #
          </label>
          <input
            type="text"
            placeholder="SL or BK number (or pending)"
            className="w-full bg-transparent border-0 border-b border-[rgba(10,10,10,0.15)] py-2.5 font-[family-name:var(--font-sans)] text-[13px] font-normal text-[#0a0a0a] outline-none transition-colors duration-300 focus:border-[#0a0a0a] placeholder:text-[rgba(10,10,10,0.25)]"
          />
        </div>

        {/* Years Licensed */}
        <div className="border-t border-[rgba(10,10,10,0.1)] py-5 sm:py-7 grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-3 sm:gap-10 items-center">
          <label className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#5a5a5a]">
            Years Licensed
          </label>
          <div className="flex flex-wrap gap-3">
            {["Not yet licensed", "Less than 1 year", "1-3 years", "3+ years"].map(
              (opt) => (
                <label
                  key={opt}
                  className="q-radio-label flex items-center gap-2 cursor-pointer text-[11px] font-medium text-[#0a0a0a] px-[18px] py-2.5 border border-[rgba(10,10,10,0.15)] rounded transition-all duration-200 hover:border-[#0a0a0a]"
                  onClick={(e) =>
                    selectRadio(e.currentTarget, "years")
                  }
                >
                  <input type="radio" name="years" className="hidden" />
                  <span>{opt}</span>
                </label>
              )
            )}
          </div>
        </div>

        {/* Plan of Interest */}
        <div className="border-t border-[rgba(10,10,10,0.1)] py-5 sm:py-7 grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-3 sm:gap-10 items-center">
          <label className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#5a5a5a]">
            Plan of Interest
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              "Aari Pro - 90/10",
              "Aari Max - 100%",
              "Mentorship Program",
              "Not sure yet",
            ].map((opt) => (
              <label
                key={opt}
                className="q-radio-label flex items-center gap-2 cursor-pointer text-[11px] font-medium text-[#0a0a0a] px-[18px] py-2.5 border border-[rgba(10,10,10,0.15)] rounded transition-all duration-200 hover:border-[#0a0a0a]"
                onClick={(e) =>
                  selectRadio(e.currentTarget, "plan")
                }
              >
                <input type="radio" name="plan" className="hidden" />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Closings */}
        <div className="border-t border-[rgba(10,10,10,0.1)] py-5 sm:py-7 grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-3 sm:gap-10 items-center">
          <label className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#5a5a5a]">
            Closings Last 12 Months
          </label>
          <select className="w-full bg-transparent border-0 border-b border-[rgba(10,10,10,0.15)] py-2.5 font-[family-name:var(--font-sans)] text-[13px] font-normal text-[#0a0a0a] outline-none transition-colors duration-300 focus:border-[#0a0a0a] appearance-none cursor-pointer">
            <option value="" disabled selected>
              Select range
            </option>
            <option>0 - Getting started</option>
            <option>1-3</option>
            <option>4-10</option>
            <option>11-20</option>
            <option>20+</option>
          </select>
        </div>

        {/* Looking for */}
        <div className="border-t border-[rgba(10,10,10,0.1)] py-5 sm:py-7 grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-3 sm:gap-10 items-center">
          <label className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#5a5a5a]">
            What are you looking for in a brokerage?
          </label>
          <textarea
            placeholder="Be direct - what matters most to you."
            rows={3}
            className="w-full bg-transparent border-0 border-b border-[rgba(10,10,10,0.15)] py-2.5 font-[family-name:var(--font-sans)] text-[13px] font-normal text-[#0a0a0a] outline-none transition-colors duration-300 focus:border-[#0a0a0a] resize-none min-h-[60px] placeholder:text-[rgba(10,10,10,0.25)]"
          />
        </div>

        {/* Anything else */}
        <div className="border-t border-[rgba(10,10,10,0.1)] py-5 sm:py-7 border-b grid grid-cols-1 sm:grid-cols-[260px_1fr] gap-3 sm:gap-10 items-center">
          <label className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#5a5a5a]">
            Anything else we should know?
          </label>
          <textarea
            placeholder="Optional - current situation, timeline, questions."
            rows={3}
            className="w-full bg-transparent border-0 border-b border-[rgba(10,10,10,0.15)] py-2.5 font-[family-name:var(--font-sans)] text-[13px] font-normal text-[#0a0a0a] outline-none transition-colors duration-300 focus:border-[#0a0a0a] resize-none min-h-[60px] placeholder:text-[rgba(10,10,10,0.25)]"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="mt-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 reveal">
        <p className="text-[10px] font-normal text-[rgba(10,10,10,0.35)] max-w-[320px] leading-[1.6]">
          By submitting, you agree to be contacted by Aari Realty regarding your
          application. No spam. No pressure.
        </p>
        <button className="inline-flex items-center gap-2.5 bg-[#0a0a0a] text-white font-[family-name:var(--font-sans)] text-[9px] font-bold tracking-[2.5px] uppercase px-11 py-[18px] rounded border-none cursor-pointer transition-all duration-300 hover:bg-transparent hover:text-[#0a0a0a] hover:outline hover:outline-1 hover:outline-[rgba(10,10,10,0.5)]">
          Submit Application
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path
              d="M1 5h12M8 1l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
