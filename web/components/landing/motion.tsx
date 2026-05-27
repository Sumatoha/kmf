"use client";

import { motion, type Variants } from "motion/react";
import { type ReactNode, type ElementType } from "react";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

export const stagger = (delay = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
});

export const staggerSlow = stagger(0.12);

const DEFAULT_TRANSITION = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };
const DEFAULT_VIEWPORT = { once: true, amount: 0.15 as const };

export function Reveal({
  children,
  variants = fadeUp,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  const Component = motion.create(as);
  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={DEFAULT_VIEWPORT}
      variants={variants}
      transition={{ ...DEFAULT_TRANSITION, delay }}
      className={className}
    >
      {children}
    </Component>
  );
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={DEFAULT_VIEWPORT}
      variants={stagger(staggerDelay)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      transition={DEFAULT_TRANSITION}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FloatingCard({
  children,
  className,
  y = 12,
  duration = 4,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [-y, y, -y] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

export { motion };
