"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type FadeInSectionProps = {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
};

export default function FadeInSection({
  children,
  className,
  as = "section",
}: FadeInSectionProps) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </MotionTag>
  );
}
