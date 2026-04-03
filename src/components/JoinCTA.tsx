"use client";

import { useState, type FormEvent } from "react";

export default function JoinCTA() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section
      id="join"
      className="py-24 bg-gradient-to-br from-primary-dark via-primary to-primary-light relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 70%, rgba(201,168,76,0.4) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>
            <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-3">
              Ready to Get Started?
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Take the First Step Toward Your{" "}
              <span className="text-accent">Dream Career</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Whether you&apos;re a newly licensed agent or a seasoned
              professional, Aari Realty has the tools, training, and support to
              help you reach your goals. Fill out the form and a member of our
              leadership team will be in touch within 24 hours.
            </p>

            <div className="space-y-4">
              {[
                "No desk fees or hidden costs",
                "Flexible commission plans starting day one",
                "Full technology stack included",
                "Personalized onboarding experience",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-accent flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-primary-dark mb-2">
                  Thank You!
                </h3>
                <p className="text-muted">
                  We&apos;ve received your information and will be in touch
                  within 24 hours.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-primary-dark mb-2">
                  Join Our Team
                </h3>
                <p className="text-muted mb-6">
                  Fill out the form below and we&apos;ll reach out to schedule a
                  confidential conversation.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Experience Level
                    </label>
                    <select
                      required
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all bg-white"
                    >
                      <option value="">Select your experience</option>
                      <option value="new">
                        Newly Licensed (0-1 years)
                      </option>
                      <option value="developing">
                        Developing (1-3 years)
                      </option>
                      <option value="experienced">
                        Experienced (3-7 years)
                      </option>
                      <option value="top-producer">
                        Top Producer (7+ years)
                      </option>
                      <option value="team-leader">Team Leader</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Tell Us About Yourself
                    </label>
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
                      placeholder="What are you looking for in a brokerage?"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-accent py-3.5 font-semibold text-primary-dark hover:bg-accent-light transition-colors text-base"
                  >
                    Submit Application
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
