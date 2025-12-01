import { motion } from "framer-motion";
import { itemFade } from "../../config/animations";

const SectionTitle = ({ children }: { children: string }) => (
  <motion.h2
    className="section-title text-2xl md:text-3xl font-extrabold text-primary mb-8 text-center mx-auto block"
    variants={itemFade}
    initial="hidden"
    whileInView="visible"
    onViewportEnter={(entry: any) => entry.target.classList.add("is-active")}
    onViewportLeave={(entry: any) => entry.target.classList.remove("is-active")}
  >
    {children}
  </motion.h2>
);

export default SectionTitle;
