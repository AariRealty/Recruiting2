import {
  HiOutlineAcademicCap,
  HiOutlineTrendingUp,
  HiOutlineUserGroup,
} from "react-icons/hi";

const programs = [
  {
    icon: HiOutlineAcademicCap,
    tier: "New Agents",
    title: "RE 101 Program",
    description:
      "Our proprietary RE 101 Course provides a comprehensive learning environment designed specifically for new agents entering the industry. Build a strong foundation from day one with hands-on mentorship and practical training.",
    features: [
      "Dedicated mentor for your first 6 transactions",
      "Hands-on training with real scenarios",
      "Step-by-step guide from license to first closing",
      "Weekly group coaching sessions",
    ],
    accent: "bg-blue-500",
  },
  {
    icon: HiOutlineTrendingUp,
    tier: "Experienced Agents",
    title: "R.E.D & B.A.M.S Programs",
    description:
      "Our proprietary R.E.D (Real Estate Development) and B.A.M.S (Business & Marketing Systems) courses help mid-career agents understand the nuances of the modern real estate business landscape and break through to the next level.",
    features: [
      "Advanced negotiation strategies",
      "Business planning and accountability",
      "Marketing and personal branding mastery",
      "Lead generation systems that scale",
    ],
    accent: "bg-accent",
  },
  {
    icon: HiOutlineUserGroup,
    tier: "Teams",
    title: "Team Leader Program",
    description:
      "Built for agents ready to leverage their business by building a team. Our approach covers team theory, leverage, systems, specific coaching, and a proprietary commission model based on 100% control by the team leader.",
    features: [
      "Team building and recruiting strategies",
      "Proprietary team commission model",
      "Leadership development and coaching",
      "Systems and operations framework",
    ],
    accent: "bg-emerald-500",
  },
];

export default function Training() {
  return (
    <section id="training" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-3">
            Training Programs
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-4">
            Training for Every Career Stage
          </h2>
          <p className="max-w-2xl mx-auto text-muted text-lg">
            Whether you&apos;re just getting started or ready to build a team,
            we have a program tailored to your goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {programs.map((program) => (
            <div
              key={program.title}
              className="relative flex flex-col rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`h-1.5 ${program.accent}`} />
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <program.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-bold tracking-widest uppercase text-muted">
                    {program.tier}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-primary-dark mb-3">
                  {program.title}
                </h3>
                <p className="text-muted leading-relaxed mb-6">
                  {program.description}
                </p>

                <ul className="mt-auto space-y-3">
                  {program.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <svg
                        className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
