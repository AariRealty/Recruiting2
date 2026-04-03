"use client";

import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

const navLinks = [
  { label: "Why Aari Realty", href: "#why" },
  { label: "Technology", href: "#technology" },
  { label: "Training", href: "#training" },
  { label: "Commission Plans", href: "#commission" },
  { label: "Testimonials", href: "#testimonials" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-primary-dark font-bold text-xl">
              A
            </div>
            <span className="text-2xl font-bold text-white tracking-wide">
              Aari <span className="text-accent">Realty</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/80 hover:text-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#join"
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-primary-dark hover:bg-accent-light transition-colors"
            >
              Join Our Team
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-primary-dark border-t border-white/10">
          <div className="px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-accent py-2 text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#join"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-primary-dark text-center hover:bg-accent-light transition-colors"
            >
              Join Our Team
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
