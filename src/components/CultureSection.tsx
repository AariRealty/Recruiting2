const pillars = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Standards, not rules",
    text: "We do not manage agents. We hold a standard — and everyone here chose to meet it. The difference matters.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      </svg>
    ),
    title: "Small on purpose",
    text: "Aari is not trying to be the biggest brokerage in Fort Myers. We are trying to be the best one for the agents who belong here.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Compliance is non-negotiable",
    text: "It is not a checkbox. It is how we protect clients, agents, and the brokerage. If that bothers you, we are probably not the right fit.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Execution over conversation",
    text: "We do not spend time talking about what we are going to do. We build systems, close deals, and move forward.",
  },
];

export default function CultureSection() {
  return (
    <section className="bg-[#0a0a0a] px-6 lg:px-20 pb-24 border-t border-white/[0.06]">
      <div className="mb-14 pt-[60px] pb-8 border-b border-white/8 reveal">
        <p className="text-[9px] font-semibold tracking-[3px] uppercase text-white/30 mb-3.5">
          Life at Aari
        </p>
        <h2 className="font-[family-name:var(--font-serif)] text-[clamp(36px,4vw,54px)] font-light leading-[1.08] text-white">
          What we actually stand for.
        </h2>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-white/8 mb-16 reveal">
        {pillars.map((pillar) => (
          <div
            key={pillar.title}
            className="p-7 sm:p-9 border-r border-white/8 last:border-r-0 border-b sm:border-b-0 transition-colors duration-300 hover:bg-white/[0.02]"
          >
            <div className="flex items-center mb-5 text-white/30">
              {pillar.icon}
            </div>
            <h4 className="text-[11px] font-bold tracking-[1px] uppercase text-white mb-3 leading-[1.4]">
              {pillar.title}
            </h4>
            <p className="text-[11px] font-normal text-white/40 leading-[1.75]">
              {pillar.text}
            </p>
          </div>
        ))}
      </div>

      {/* WhatsApp strip */}
      <div className="border border-white/10 px-6 lg:px-13 py-12 lg:py-[60px] flex flex-col items-center text-center gap-8 reveal">
        <div>
          <p className="text-[9px] font-semibold tracking-[2.5px] uppercase text-white/30 mb-2.5">
            Have a quick question?
          </p>
          <h3 className="font-[family-name:var(--font-serif)] text-[32px] font-light text-white mb-2.5">
            Text Marlenyi directly.
          </h3>
          <p className="text-[11px] font-normal text-white/40 leading-[1.7] max-w-[480px]">
            Not ready to apply yet? That is fine. Send a message, ask what you
            need to know, and take your time.
          </p>
        </div>
        <a
          href="https://wa.me/12392018950?text=Hi%20Marlenyi%2C%20I%20saw%20the%20Aari%20Realty%20recruiting%20page%20and%20had%20a%20question."
          className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white no-underline text-[10px] font-bold tracking-[1.5px] uppercase px-13 py-[18px] rounded whitespace-nowrap transition-all duration-300 hover:bg-[#1ebe5a] w-full max-w-[340px] sm:w-auto"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
          Let&apos;s Chat
        </a>
      </div>
    </section>
  );
}
