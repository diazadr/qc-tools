import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { ReactNode } from "react";
import { sectionFade } from "../../config/animations";

export const MotionSection = ({
  children,
  className = "",
  variants = sectionFade,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants; // ← fleksibel, bisa terima semua variants
}) => (
  <motion.section
    className={className}
    variants={variants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: false, amount: 0.15 }}
  >
    {children}
  </motion.section>
);
