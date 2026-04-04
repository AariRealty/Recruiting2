export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/[0.06] px-6 lg:px-20 pt-14 pb-10">
      {/* Top section */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-16 items-start mb-10 pb-10 border-b border-white/8">
        {/* Logo */}
        <div>
          <span className="text-xl font-bold text-white/85 tracking-wide">
            Aari <span className="font-light">Realty</span>
          </span>
        </div>

        {/* Info */}
        <div className="text-[10.5px] font-normal text-white/30 leading-8 tracking-[0.02em]">
          <p>Aari Realty LLC &middot; Licensed Real Estate Brokerage &middot; State of Florida</p>
          <p>3620 Colonial Blvd, Suite 130 &middot; Fort Myers, FL 33966</p>
          <div className="flex items-center gap-5 mt-3.5">
            {/* Instagram */}
            <a
              href="https://instagram.com/aari.realty"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center text-white/25 transition-colors duration-300 hover:text-white/70 no-underline"
              aria-label="Instagram"
            >
              <svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@aarirealty"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center text-white/25 transition-colors duration-300 hover:text-white/70 no-underline"
              aria-label="TikTok"
            >
              <svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.53V6.76a4.85 4.85 0 0 1-1.01-.07z" />
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="https://youtube.com/@aari.realty"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center text-white/25 transition-colors duration-300 hover:text-white/70 no-underline"
              aria-label="YouTube"
            >
              <svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
              </svg>
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="text-[10.5px] font-normal text-white/30 leading-8 tracking-[0.02em] text-left lg:text-right">
          <p>aarirealty.com</p>
          <p>broker@aarirealty.com &middot; 239.688.1770</p>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[9px] font-normal text-white/15 leading-[1.8] text-center max-w-[860px] mx-auto">
        Aari Realty LLC is a licensed real estate brokerage in the State of
        Florida. License information is subject to verification through the
        Florida Department of Business and Professional Regulation (DBPR). The
        information contained on this page is for recruiting purposes only and
        does not constitute a legal or contractual offer. Commission structures,
        fees, and plan details are subject to change and will be formalized in an
        Independent Contractor Agreement. Results and income are not guaranteed
        and vary based on individual effort, market conditions, and experience.
        Equal Opportunity Employer. &copy; 2025 Aari Realty LLC. All rights
        reserved.
      </p>
    </footer>
  );
}
