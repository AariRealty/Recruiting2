"use client";

import Script from "next/script";

export default function Calendar() {
  return (
    <section id="calendar" className="py-24 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-black/40 font-semibold tracking-widest uppercase text-sm mb-3">
            Book a Meeting
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Let&apos;s Talk About Your Career
          </h2>
          <p className="text-gray-500 text-lg">
            Ready to learn more? Schedule a confidential, no-pressure
            conversation with our team. Pick a time that works for you.
          </p>
        </div>

        {/* Koalendar Inline Embed */}
        <div
          id="inline-widget-meet-with-marlenyi-paredes-2"
          className="min-h-[500px]"
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
              url: "https://koalendar.com/e/meet-with-marlenyi-paredes-2",
              selector: "#inline-widget-meet-with-marlenyi-paredes-2",
            });
          }}
        />
      </div>
    </section>
  );
}
