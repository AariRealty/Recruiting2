const reasons = [
  {
    num: "01",
    title: "Compliance First",
    text: "Every system is built around FREC and DBPR compliance. Clear, defensible operations that protect you and your clients.",
  },
  {
    num: "02",
    title: "Real Broker Access",
    text: "Not a voicemail box. Direct access to the qualifying broker for contract questions, negotiations, and everything in between.",
  },
  {
    num: "03",
    title: "Systems Built In",
    text: "Aari operates across four entities. You plug into a working infrastructure — no reinventing the wheel, just execution.",
  },
  {
    num: "04",
    title: "Boutique Advantage",
    text: "You are not a number. The brokerage is intentionally small — faster decisions, tighter community, a brand that stands for something specific.",
  },
  {
    num: "05",
    title: "Transaction Support",
    text: "Aari Transactions keeps your deals clean, on schedule, and compliant from contract to close. Built into the ecosystem.",
  },
  {
    num: "06",
    title: "SW Florida Focused",
    text: "Lehigh Acres. Fort Myers. Cape Coral. Growth markets. Aari is rooted here — not a franchise with a national playbook.",
  },
];

export default function WhySection() {
  return (
    <section id="why" className="bg-[#f0f0f0] px-6 lg:px-20 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-20 items-start">
        {/* Left title */}
        <div className="lg:sticky lg:top-10 reveal">
          <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[rgba(10,10,10,0.4)] mb-3.5">
            The Difference
          </p>
          <h2 className="font-[family-name:var(--font-serif)] text-[clamp(36px,4vw,54px)] font-light leading-[1.08] text-[#0a0a0a]">
            Why agents
            <br />
            choose
            <br />
            Aari.
          </h2>
        </div>

        {/* Right grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[rgba(10,10,10,0.08)] reveal">
          {reasons.map((reason) => (
            <div
              key={reason.num}
              className="bg-[#f0f0f0] p-7 sm:p-9 transition-colors duration-300 hover:bg-white"
            >
              <div className="font-[family-name:var(--font-serif)] text-[44px] font-light text-[rgba(10,10,10,0.08)] leading-none mb-4">
                {reason.num}
              </div>
              <h4 className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#0a0a0a] mb-2.5">
                {reason.title}
              </h4>
              <p className="text-[11px] font-normal text-[#5a5a5a] leading-[1.75]">
                {reason.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
