const testimonials = [
  {
    quote:
      "The mentorship program at Aari Realty changed everything for me. I went from zero closings to a thriving business in under a year. The support is real.",
    name: "Sarah M.",
    role: "Residential Agent",
  },
  {
    quote:
      "No hidden fees, no games. The commission structure is exactly what they promise — fair splits that reward hard work. Best move I ever made.",
    name: "James R.",
    role: "Senior Agent",
  },
  {
    quote:
      "The transaction coordination alone saves me hours every week. Add in the CRM, marketing support, and coaching — it's everything I needed to grow.",
    name: "Maria G.",
    role: "Top Producer",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-black/40 font-semibold tracking-widest uppercase text-sm mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            What Our Agents Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col p-8 rounded-2xl bg-section-alt border border-gray-100"
            >
              {/* Quote mark */}
              <span className="text-6xl font-serif text-black/10 leading-none mb-4">
                &ldquo;
              </span>

              <blockquote className="text-black/70 leading-relaxed mb-6 flex-1">
                {testimonial.quote}
              </blockquote>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-semibold text-black text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
