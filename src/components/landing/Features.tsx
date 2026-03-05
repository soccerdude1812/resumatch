"use client";

import { motion } from "framer-motion";
import { Target, Wand2, GitCompareArrows } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

const features = [
  {
    icon: Target,
    title: "ATS Match Score",
    description:
      "Instantly see how well your resume matches the job description. Get a clear compatibility score with detailed keyword analysis.",
    color: "text-[var(--success)]",
    bgColor: "bg-[var(--success)]",
  },
  {
    icon: Wand2,
    title: "AI-Powered Rewrite",
    description:
      "Our AI rewrites your bullet points to naturally incorporate missing keywords, preserving your voice while boosting ATS compatibility.",
    color: "text-[var(--accent-primary)]",
    bgColor: "bg-[var(--accent-primary)]",
  },
  {
    icon: GitCompareArrows,
    title: "Side-by-Side Diff",
    description:
      "See exactly what changed between your original and optimized resume. Every modification is highlighted so nothing is a surprise.",
    color: "text-[var(--accent-secondary)]",
    bgColor: "bg-[var(--accent-secondary)]",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Features() {
  return (
    <section className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need to{" "}
            <span className="text-gradient">land the interview</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Three powerful tools working together to give your resume the best
            chance of getting past ATS filters.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <GlassCard className="h-full" padding="p-8">
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bgColor} bg-opacity-10 flex items-center justify-center mb-5`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
