import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <span className="text-2xl font-bold tracking-wide">
              Aari <span className="font-light">Realty</span>
            </span>
            <p className="text-white/40 text-sm leading-relaxed mt-4">
              Real estate services in Southwest Florida.
              Fair splits. Real training. Actual support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Why Aari Realty", href: "#why" },
                { label: "Commission Plans", href: "#commission" },
                { label: "Business Tools", href: "#benefits" },
                { label: "New Agents", href: "#new-agents" },
                { label: "Book a Meeting", href: "#calendar" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/40 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/40 text-sm">
                <HiOutlinePhone className="w-4 h-4 text-white/60 flex-shrink-0" />
                (239) 555-0100
              </li>
              <li className="flex items-center gap-3 text-white/40 text-sm">
                <HiOutlineMail className="w-4 h-4 text-white/60 flex-shrink-0" />
                careers@aarirealty.com
              </li>
              <li className="flex items-start gap-3 text-white/40 text-sm">
                <HiOutlineLocationMarker className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
                Southwest Florida
              </li>
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h4 className="font-semibold text-white mb-4">Our Platforms</h4>
            <ul className="space-y-2.5">
              <li className="text-white/40 text-sm">SkySlope + SkySlope Books</li>
              <li className="text-white/40 text-sm">Lofty CRM</li>
              <li className="text-white/40 text-sm">Canva Pro</li>
              <li className="text-white/40 text-sm">Koalendar Scheduling</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">
            &copy; {new Date().getFullYear()} Aari Realty. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-white/30 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-white/30 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
