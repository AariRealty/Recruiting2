export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(201,168,76,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(201,168,76,0.2) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center py-32">
        <p className="animate-fade-in-up text-accent font-semibold tracking-widest uppercase text-sm mb-6">
          Your Success Starts Here
        </p>
        <h1 className="animate-fade-in-up animate-delay-200 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
          Build Your Real Estate
          <br />
          <span className="text-accent">Career With Us</span>
        </h1>
        <p className="animate-fade-in-up animate-delay-400 max-w-2xl mx-auto text-lg sm:text-xl text-white/70 mb-12 leading-relaxed">
          Aari Realty positions agents for success with extensive expertise,
          comprehensive tools, cutting-edge technology, and superior training
          programs designed to take your career to the next level.
        </p>
        <div className="animate-fade-in-up animate-delay-600 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#join"
            className="rounded-full bg-accent px-8 py-4 text-lg font-semibold text-primary-dark hover:bg-accent-light transition-all hover:scale-105 shadow-lg shadow-accent/25"
          >
            Join Our Team
          </a>
          <a
            href="#why"
            className="rounded-full border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-all"
          >
            Learn More
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { number: "250+", label: "Active Agents" },
            { number: "#1", label: "Independent Brokerage" },
            { number: "100%", label: "Commission Plans" },
            { number: "15+", label: "Years of Excellence" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-accent">
                {stat.number}
              </div>
              <div className="text-sm text-white/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-accent" />
        </div>
      </div>
    </section>
  );
}
