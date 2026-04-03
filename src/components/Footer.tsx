import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-primary-dark font-bold text-xl">
                A
              </div>
              <span className="text-2xl font-bold tracking-wide">
                Aari <span className="text-accent">Realty</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Positioning agents for success with cutting-edge technology,
              superior training, and flexible commission plans.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-accent mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Why Aari Realty", href: "#why" },
                { label: "Technology", href: "#technology" },
                { label: "Training Programs", href: "#training" },
                { label: "Commission Plans", href: "#commission" },
                { label: "Testimonials", href: "#testimonials" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-accent text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-accent mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/60 text-sm">
                <HiOutlinePhone className="w-4 h-4 text-accent flex-shrink-0" />
                (555) 123-4567
              </li>
              <li className="flex items-center gap-3 text-white/60 text-sm">
                <HiOutlineMail className="w-4 h-4 text-accent flex-shrink-0" />
                careers@aarirealty.com
              </li>
              <li className="flex items-start gap-3 text-white/60 text-sm">
                <HiOutlineLocationMarker className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                123 Main Street, Suite 100
                <br />
                Fort Myers, FL 33901
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-accent mb-4">Stay Updated</h4>
            <p className="text-white/60 text-sm mb-4">
              Join our newsletter for industry updates and tips to take your
              business to the top 10%.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 rounded-lg bg-white/10 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-primary-dark hover:bg-accent-light transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} Aari Realty. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-white/40 hover:text-accent text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-white/40 hover:text-accent text-sm transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
