import {
  HiOutlineDesktopComputer,
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiOutlinePresentationChartBar,
  HiOutlineDatabase,
  HiOutlineGlobe,
} from "react-icons/hi";

const tools = [
  {
    icon: HiOutlineDesktopComputer,
    name: "KV Core",
    description: "All-in-one CRM and lead generation platform",
  },
  {
    icon: HiOutlineCloudUpload,
    name: "Dotloop",
    description: "Streamlined transaction management",
  },
  {
    icon: HiOutlineDatabase,
    name: "Raindance",
    description: "Commission tracking and accounting",
  },
  {
    icon: HiOutlinePresentationChartBar,
    name: "David Knox Training",
    description: "World-class sales training library",
  },
  {
    icon: HiOutlineDocumentText,
    name: "Agent 3000",
    description: "Automated marketing and campaigns",
  },
  {
    icon: HiOutlineGlobe,
    name: "Personal Website",
    description: "Custom IDX website for every agent",
  },
];

export default function Technology() {
  return (
    <section id="technology" className="py-24 bg-section-alt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>
            <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-3">
              Technology & Tools
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-6">
              Industry-Leading Technology at Your Fingertips
            </h2>
            <p className="text-muted text-lg leading-relaxed mb-8">
              We provide every agent with the same cutting-edge technology
              platforms that top-producing agents across the country rely on.
              These aren&apos;t add-ons or upgrades — they&apos;re included from
              day one.
            </p>
            <div className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl border border-accent/20">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent font-bold text-lg">$0</span>
              </div>
              <div>
                <p className="font-semibold text-primary-dark">
                  All Tools Included
                </p>
                <p className="text-sm text-muted">
                  No hidden fees — every platform is included with your
                  membership
                </p>
              </div>
            </div>
          </div>

          {/* Right grid of tools */}
          <div className="grid sm:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-50"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <tool.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary-dark">
                    {tool.name}
                  </h4>
                  <p className="text-sm text-muted mt-0.5">
                    {tool.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
