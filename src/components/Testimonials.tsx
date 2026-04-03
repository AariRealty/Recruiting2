const testimonials = [
  {
    quote:
      "Joining Aari Realty was the best career decision I ever made. The training programs gave me the confidence and skills to close my first 12 deals in year one.",
    name: "Sarah Martinez",
    role: "Residential Agent",
    years: "3 years with Aari Realty",
  },
  {
    quote:
      "The technology stack alone is worth it. Having KV Core, Dotloop, and all these tools at no extra cost saved me thousands compared to my previous brokerage.",
    name: "James Richardson",
    role: "Senior Agent",
    years: "5 years with Aari Realty",
  },
  {
    quote:
      "The team leader program helped me build a 6-person team that closed $15M last year. The support and commission structure are unmatched in our market.",
    name: "Maria Gonzalez",
    role: "Team Leader",
    years: "7 years with Aari Realty",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-4">
            What Our Agents Say
          </h2>
          <p className="max-w-2xl mx-auto text-muted text-lg">
            Don&apos;t just take our word for it — hear from agents who have
            transformed their careers with Aari Realty.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col p-8 rounded-2xl bg-section-alt border border-gray-100"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-accent"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <blockquote className="text-foreground/80 leading-relaxed mb-6 flex-1">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-semibold text-primary-dark text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted">
                    {testimonial.role} &middot; {testimonial.years}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
