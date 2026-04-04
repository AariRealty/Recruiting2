"use client";

import Script from "next/script";
import Tiles from "@/components/Tiles";
import Commission from "@/components/Commission";
import NewAgents from "@/components/NewAgents";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="pt-16 pb-12 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-wide mb-2">
          Aari <span className="font-light">Realty</span>
        </h1>
        <p className="text-white/40 text-sm tracking-widest uppercase">
          Southwest Florida
        </p>
      </header>

      {/* Content */}
      <main>
        <div className="max-w-2xl mx-auto px-4 pb-16">
          {/* Headline */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Join Our Team
            </h2>
            <p className="text-white/50 text-lg">
              Fair splits. Real support. No weird fine print.
            </p>
          </div>

          {/* Bullets */}
          <div className="mb-16 space-y-4 max-w-md mx-auto">
            {[
              "Commission plans from 75/25 up to 100%",
              "Full transaction coordination on Growth plan",
              "SkySlope Suite + SkySlope Books on every plan",
              "Marketing support, CRM, and lead generation available",
              "One-on-one mentorship and accountability",
              "Weekly coaching and video recording sessions",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-white/30 mt-0.5">→</span>
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold mb-2">Book a Consultation</h3>
            <p className="text-white/40 text-sm">
              Pick a time that works for you — confidential, no pressure.
            </p>
          </div>

          <div
            id="inline-widget-meet-with-marlenyi"
            className="min-h-[500px] bg-white rounded-2xl overflow-hidden"
          />
          <Script
            id="koalendar-global"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.Koalendar=window.Koalendar||function(){(Koalendar.props=Koalendar.props||[]).push(arguments)};`,
            }}
          />
          <Script
            src="https://koalendar.com/assets/widget.js"
            strategy="afterInteractive"
            onLoad={() => {
              // @ts-expect-error Koalendar is loaded via external script
              window.Koalendar("inline", {
                url: "https://koalendar.com/e/meet-with-marlenyi",
                selector: "#inline-widget-meet-with-marlenyi",
              });
            }}
          />

          {/* Learn more hint */}
          <div className="text-center mt-12">
            <a
              href="#plans"
              className="text-white/30 text-sm hover:text-white/60 transition-colors"
            >
              Learn more about our plans ↓
            </a>
          </div>
        </div>

        {/* Detailed sections */}
        <div id="plans">
          <Tiles />
          <Commission />
          <NewAgents />
          <Testimonials />
        </div>
      </main>

      <Footer />
    </div>
  );
}
