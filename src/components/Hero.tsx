export default function Hero() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] grid grid-cols-1 lg:grid-cols-[55%_45%] relative pt-[76px] overflow-hidden">
      {/* Left content */}
      <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-20 py-20 relative z-[2]">
        <p className="text-[9px] font-semibold tracking-[3.5px] uppercase text-white/35 mb-9">
          Aari Realty &middot; Agent Recruiting &middot; Fort Myers, FL
        </p>
        <h1 className="font-[family-name:var(--font-serif)] text-[clamp(52px,6.5vw,88px)] font-light leading-[1.02] text-white mb-7">
          Your business.
          <br />
          Your rules.
          <br />
          <em>Real support.</em>
        </h1>
        <p className="text-xs font-normal leading-[1.85] text-white/50 max-w-[400px] mb-13">
          A boutique brokerage in Southwest Florida built for agents who want
          structure without rigidity, support without micromanagement, and a
          brand worth being part of.
        </p>
        <div className="flex items-center gap-6 flex-wrap">
          <a
            href="#apply"
            className="inline-flex items-center gap-2.5 bg-white text-[#0a0a0a] no-underline text-[9px] font-bold tracking-[2.5px] uppercase px-8 py-4 rounded transition-all duration-300 hover:bg-transparent hover:text-white hover:outline hover:outline-1 hover:outline-white/50 group"
          >
            Apply Now
            <svg
              width="14"
              height="10"
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
          <p className="text-[10px] font-normal text-white/35">
            New agent?{" "}
            <a
              href="#mentorship-section"
              className="text-white/70 underline underline-offset-[3px] cursor-pointer"
            >
              We have a path for you.
            </a>
          </p>
        </div>
      </div>

      {/* Right stats panel */}
      <div className="relative overflow-hidden hidden lg:flex flex-col justify-end">
        {/* Grid background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,0.025) 59px,rgba(255,255,255,0.025) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,0.025) 59px,rgba(255,255,255,0.025) 60px)",
          }}
        />
        <div className="relative z-[1] p-[60px_60px_80px_40px]">
          {[
            { label: "Available Plans", value: "2" },
            { label: "Max Commission", value: "100%" },
            { label: "Markets Served", value: "5+" },
            { label: "Business Entities", value: "4" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="border-t border-white/8 py-5 flex justify-between items-baseline last:border-b last:border-white/8"
              style={{
                opacity: 0,
                transform: "translateY(16px)",
                animation: `fadeUp 0.6s ease forwards ${0.4 + i * 0.15}s`,
              }}
            >
              <span className="text-[9px] font-medium tracking-[2px] uppercase text-white/35">
                {stat.label}
              </span>
              <span className="font-[family-name:var(--font-serif)] text-[38px] font-light text-white">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
