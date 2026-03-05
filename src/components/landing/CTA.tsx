"use client";

import Link from "next/link";
import { ArrowRight, Check, Lock } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to get started",
    features: [
      "3 resume tailors per day",
      "ATS match scoring",
      "AI-powered rewriting",
      "Side-by-side diff view",
      "PDF download",
    ],
    cta: "Start Tailoring Free",
    href: "/app",
    active: true,
    badge: null,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "Unlimited power for serious job seekers",
    features: [
      "Unlimited tailors per day",
      "Priority AI processing",
      "Resume history & versioning",
      "Advanced keyword insights",
      "Cover letter generation",
    ],
    cta: "Coming Soon",
    href: "#",
    active: false,
    badge: "Coming Soon",
  },
];

export default function CTA() {
  return (
    <section className="py-24 sm:py-32 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Simple pricing.{" "}
            <span className="text-gradient">No surprises.</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-lg mx-auto">
            Start free and upgrade when you need more. No credit card required.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name}>
              <GlassCard
                hover={plan.active}
                className={`h-full relative ${
                  plan.active
                    ? "border-[var(--accent-primary)]/30 shadow-[var(--accent-primary)]/10"
                    : "opacity-70"
                }`}
                padding="p-8"
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-4 right-4 glass rounded-full px-3 py-1">
                    <span className="text-xs font-medium text-text-tertiary">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-text-tertiary">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {plan.description}
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm"
                    >
                      <Check
                        className={`w-4 h-4 flex-shrink-0 ${
                          plan.active
                            ? "text-[var(--success)]"
                            : "text-text-tertiary"
                        }`}
                      />
                      <span
                        className={
                          plan.active
                            ? "text-text-secondary"
                            : "text-text-tertiary"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                {plan.active ? (
                  <Link
                    href={plan.href}
                    className="btn-primary w-full justify-center text-sm py-3"
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--bg-tertiary)] text-text-tertiary text-sm font-medium cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {plan.cta}
                  </button>
                )}
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
