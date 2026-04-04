export default function MidCTA() {
  return (
    <div className="bg-[#f0f0f0] px-6 lg:px-20 py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 reveal">
      <p className="font-[family-name:var(--font-serif)] text-[clamp(20px,2.5vw,30px)] font-light italic text-[#0a0a0a]">
        Ready to make your move?
      </p>
      <a
        href="#apply"
        className="inline-flex items-center gap-2.5 bg-[#0a0a0a] text-white no-underline text-[9px] font-bold tracking-[2.5px] uppercase px-7 py-3.5 rounded transition-all duration-300 shrink-0 hover:bg-transparent hover:text-[#0a0a0a] hover:outline hover:outline-1 hover:outline-[rgba(10,10,10,0.4)] group"
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
    </div>
  );
}
