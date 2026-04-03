"use client";

import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

const navLinks = [
  { label: "Why Aari Realty", href: "#why" },
  { label: "What You Get", href: "#benefits" },
  { label: "Commission Plans", href: "#commission" },
  { label: "New Agents", href: "#new-agents" },
  { label: "Book a Meeting", href: "#calendar" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white tracking-wide">
              Aari <span className="font-light">Realty</span>
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#join"
              className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-gray-200 transition-colors"
            >
              Join Our Team
            </a>
          </div>

          <button
            className="lg:hidden text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-black border-t border-white/10">
          <div className="px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white py-2 text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#join"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black text-center hover:bg-gray-200 transition-colors"
            >
              Join Our Team
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
