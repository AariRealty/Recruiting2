"use client";

import { useState } from "react";

const navLinks = [
  { label: "Plans", href: "#plans" },
  { label: "Why Aari", href: "#why" },
  { label: "Leadership", href: "#broker" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-12 py-[18px] flex justify-between items-center bg-[rgba(10,10,10,0.95)] backdrop-blur-[16px] border-b border-white/10">
      <a href="#" className="block">
        <span className="text-2xl font-bold text-white tracking-wide">
          Aari <span className="font-light">Realty</span>
        </span>
      </a>

      <ul className="hidden lg:flex gap-9 list-none items-center">
        {navLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-[9px] font-medium tracking-[2.5px] uppercase text-white/45 no-underline transition-colors duration-300 hover:text-white"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex gap-3 items-center shrink-0">
        <a
          href="#apply"
          className="text-white border border-white/25 px-4 sm:px-[22px] py-[9px] no-underline text-[9px] font-semibold tracking-[2px] uppercase transition-all duration-300 rounded hover:bg-white hover:text-[#0a0a0a]"
        >
          Apply Now
        </a>
        <a
          href="https://wa.me/12392018950?text=Hi%20Marlenyi%2C%20I%20saw%20the%20Aari%20Realty%20recruiting%20page%20and%20had%20a%20question."
          className="text-white bg-[#25D366] border border-[#25D366] px-4 sm:px-[22px] py-[9px] no-underline text-[9px] font-semibold tracking-[2px] uppercase transition-all duration-300 rounded hover:bg-[#1ebe5a] hover:border-[#1ebe5a]"
          target="_blank"
          rel="noopener noreferrer"
        >
          Let&apos;s Chat
        </a>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-white ml-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#0a0a0a] border-t border-white/10 px-4 py-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-white/45 hover:text-white text-[9px] font-medium tracking-[2.5px] uppercase transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
