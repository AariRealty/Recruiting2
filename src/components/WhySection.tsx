import {
  HiOutlineLightBulb,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlineSupport,
} from "react-icons/hi";

const reasons = [
  {
    icon: HiOutlineLightBulb,
    title: "Cutting-Edge Technology",
    description:
      "Access industry-leading tools and platforms that top-producing agents rely on to close more deals and serve clients better.",
  },
  {
    icon: HiOutlineAcademicCap,
    title: "Superior Training",
    description:
      "Proprietary training programs designed for every career stage — from brand new agents to seasoned professionals looking to level up.",
  },
  {
    icon: HiOutlineCurrencyDollar,
    title: "Flexible Commission Plans",
    description:
      "Choose the commission structure that works best for you, with the ability to adjust your plan as your business grows.",
  },
  {
    icon: HiOutlineUserGroup,
    title: "Supportive Culture",
    description:
      "Join a collaborative community of driven agents who share knowledge, celebrate wins, and support each other's growth.",
  },
  {
    icon: HiOutlineChartBar,
    title: "Business Growth",
    description:
      "We provide the systems, accountability, and coaching you need to build a scalable, sustainable real estate business.",
  },
  {
    icon: HiOutlineSupport,
    title: "Dedicated Support",
    description:
      "From transaction coordination to marketing assistance, our support team ensures you can focus on what you do best — selling.",
  },
];

export default function WhySection() {
  return (
    <section id="why" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-3">
            Why Choose Us
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-4">
            Why Aari Realty?
          </h2>
          <p className="max-w-2xl mx-auto text-muted text-lg">
            We built our brokerage with a clear purpose — to redefine what it
            means to support real estate agents and position them for long-term
            success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-accent/10 transition-colors">
                <reason.icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-3">
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
