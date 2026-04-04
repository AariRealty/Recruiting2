export default function BrokerSection() {
  return (
    <>
      <section
        id="broker"
        className="bg-[#0a0a0a] px-6 lg:px-20 py-24 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-9 lg:gap-[72px] items-center"
      >
        <div className="reveal">
          <div className="w-[120px] h-[120px] lg:w-[200px] lg:h-[200px] rounded-full bg-white/10 border border-white/12 flex items-center justify-center">
            <span className="font-[family-name:var(--font-serif)] text-white/40 text-4xl lg:text-6xl font-light">
              MP
            </span>
          </div>
        </div>
        <div className="reveal">
          <p className="text-[9px] font-semibold tracking-[3px] uppercase text-white/30 mb-3">
            Your Qualifying Broker
          </p>
          <h2 className="font-[family-name:var(--font-serif)] text-[clamp(28px,3vw,40px)] font-light text-white mb-1.5">
            Marlenyi Paredes
          </h2>
          <p className="text-[9px] font-semibold tracking-[2.5px] uppercase text-white/30 mb-6">
            Qualifying Broker &amp; Owner &middot; Aari Realty LLC
          </p>
          <p className="text-xs font-normal text-white/50 leading-[1.85] mb-4">
            Marlenyi built Aari Realty from the ground up — designing the
            systems, establishing the compliance framework, and setting the
            standard for how business gets done. She is not a figurehead. She
            works directly with agents.
          </p>
          <p className="text-xs font-normal text-white/50 leading-[1.85] mb-4">
            If you have a question, a difficult deal, or a situation you have
            never navigated — she is available. That is not a selling point. That
            is how the brokerage is structured.
          </p>
          <div className="flex flex-wrap gap-2 mt-7">
            {["SRS", "PSA", "ABR", "C2EX", "Qualifying Broker"].map((cred) => (
              <span
                key={cred}
                className="text-[8px] font-bold tracking-[2px] uppercase text-white/50 border border-white/15 px-3 py-1.5"
              >
                {cred}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Broker CTA */}
      <div className="bg-[#0a0a0a] px-6 lg:px-20 py-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-t border-white/[0.06] reveal">
        <p className="font-[family-name:var(--font-serif)] text-[clamp(22px,2.5vw,32px)] font-light italic text-white">
          Still have questions?
        </p>
        <div className="flex flex-row flex-wrap gap-3 items-center shrink-0">
          <a
            href="#apply"
            className="inline-flex items-center gap-2.5 bg-white text-[#0a0a0a] no-underline text-[9px] font-bold tracking-[2.5px] uppercase px-7 py-3.5 rounded transition-all duration-300 hover:bg-transparent hover:text-white hover:outline hover:outline-1 hover:outline-white/40 group"
          >
            Apply Now
            <svg
              width="12"
              height="9"
              viewBox="0 0 14 10"
              fill="none"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                d="M1 5h12M8 1l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a
            href="https://wa.me/12392018950?text=Hi%20Marlenyi%2C%20I%20saw%20the%20Aari%20Realty%20recruiting%20page%20and%20had%20a%20question."
            className="inline-flex items-center gap-2 bg-[#25D366] text-white no-underline text-[9px] font-bold tracking-[2px] uppercase px-7 py-3.5 rounded transition-all duration-300 hover:bg-[#1ebe5a]"
            target="_blank"
            rel="noopener noreferrer"
          >
            Let&apos;s Chat
          </a>
        </div>
      </div>
    </>
  );
}
