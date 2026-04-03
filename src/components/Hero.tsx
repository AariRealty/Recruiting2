export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center py-32">
        <p className="animate-fade-in-up text-white/50 font-medium tracking-widest uppercase text-sm mb-6">
          Southwest Florida&apos;s Modern Brokerage
        </p>
        <h1 className="animate-fade-in-up animate-delay-200 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
          You Work Hard.
          <br />
          <span className="font-light">You Should Get Paid.</span>
        </h1>
        <p className="animate-fade-in-up animate-delay-400 max-w-2xl mx-auto text-lg sm:text-xl text-white/50 mb-12 leading-relaxed">
          Fair splits. Real training. Actual support. No weird fine print.
          Focus on closing deals while keeping more of what you earn.
        </p>
        <div className="animate-fade-in-up animate-delay-600 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#join"
            className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-black hover:bg-gray-200 transition-all hover:scale-105 shadow-lg"
          >
            Join Our Team
          </a>
          <a
            href="#why"
            className="rounded-full border-2 border-white/20 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-all"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-white/60" />
        </div>
      </div>
    </section>
  );
}
