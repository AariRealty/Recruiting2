import {
  HiOutlineCurrencyDollar,
  HiOutlineAcademicCap,
  HiOutlineSupport,
  HiOutlineChartBar,
  HiOutlineClipboardCheck,
  HiOutlineSpeakerphone,
} from "react-icons/hi";

const reasons = [
  {
    icon: HiOutlineCurrencyDollar,
    title: "Commission That Rewards You",
    description:
      "More deals = bigger splits. Your commission increases as you produce. Fair splits, no weird fine print.",
  },
  {
    icon: HiOutlineAcademicCap,
    title: "One-on-One Mentorship",
    description:
      "Someone actually invested in your success. Not a call center, not an email chain — real, personalized guidance.",
  },
  {
    icon: HiOutlineSupport,
    title: "Weekly Coaching",
    description:
      "Strategies you can actually use, not just fluff. Learn what works right now in today's market.",
  },
  {
    icon: HiOutlineClipboardCheck,
    title: "Transaction Coordination",
    description:
      "Covered. Less paperwork, more deals. We handle the details so you can focus on selling.",
  },
  {
    icon: HiOutlineChartBar,
    title: "CRM That Works",
    description:
      "A CRM that keeps you on track — because your brain has enough to handle already.",
  },
  {
    icon: HiOutlineSpeakerphone,
    title: "Marketing Support",
    description:
      "Leads, listings, and branding — handled. Professional listing management so you look polished and sell faster.",
  },
];

export default function WhySection() {
  return (
    <section id="why" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-black/40 font-semibold tracking-widest uppercase text-sm mb-3">
            Why Aari Realty
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Everything You Need. Nothing You Don&apos;t.
          </h2>
          <p className="max-w-2xl mx-auto text-muted text-lg">
            We built our brokerage around what agents actually need — not what
            looks good on a brochure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-black/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-black/5 flex items-center justify-center mb-5 group-hover:bg-black transition-colors">
                <reason.icon className="w-7 h-7 text-black group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">
                {reason.title}
              </h3>
              <p className="text-muted leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
