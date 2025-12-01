import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { sectionFade } from "../../config/animations";

export const MotionSection = ({
  children,
  className = "",
  variants = sectionFade,
}: {
  children: ReactNode;
  className?: string;
  variants?: typeof sectionFade;
}) => (
  <motion.section
    className={className}
    variants={variants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: false, amount: 0.15 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {children}
  </motion.section>
);
