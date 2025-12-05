import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MotionSection } from "../../components/common/MotionSection";
import SectionTitle from "../../components/common/SectionTitle";
import { staggerContainer, itemFade } from "../../config/animations";

const ParetoTheoryPage = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full page pt-[120px] pb-12 px-6 max-w-4xl mx-auto text-left leading-relaxed">
      <MotionSection variants={staggerContainer}>
        <SectionTitle>{t("pareto_theory.title")}</SectionTitle>

        <motion.section variants={itemFade} className="space-y-4">
          <h2 className="text-2xl font-bold">{t("pareto_theory.section1_title")}</h2>
          <p>{t("pareto_theory.section1_desc1")}</p>
          <p>{t("pareto_theory.section1_desc2")}</p>

          <ul className="list-disc ml-6 space-y-1">
            <li>{t("pareto_theory.section1_point1")}</li>
            <li>{t("pareto_theory.section1_point2")}</li>
            <li>{t("pareto_theory.section1_point3")}</li>
            <li>{t("pareto_theory.section1_point4")}</li>
          </ul>
        </motion.section>

        <motion.section variants={itemFade} className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">{t("pareto_theory.section2_title")}</h2>
          <p>{t("pareto_theory.section2_desc")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 border border-border rounded bg-card">
              <h3 className="font-semibold">{t("pareto_theory.A_title")}</h3>
              <p className="text-sm mt-2">{t("pareto_theory.A_desc")}</p>
            </div>

            <div className="p-4 border border-border rounded bg-card">
              <h3 className="font-semibold">{t("pareto_theory.B_title")}</h3>
              <p className="text-sm mt-2">{t("pareto_theory.B_desc")}</p>
            </div>

            <div className="p-4 border border-border rounded bg-card">
              <h3 className="font-semibold">{t("pareto_theory.C_title")}</h3>
              <p className="text-sm mt-2">{t("pareto_theory.C_desc")}</p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemFade} className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">{t("pareto_theory.section3_title")}</h2>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li>{t("pareto_theory.section3_point1")}</li>
            <li>{t("pareto_theory.section3_point2")}</li>
            <li>{t("pareto_theory.section3_point3")}</li>
            <li>{t("pareto_theory.section3_point4")}</li>
          </ul>
        </motion.section>

        <motion.section variants={itemFade} className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">{t("pareto_theory.section4_title")}</h2>
          <p>{t("pareto_theory.section4_text")}</p>
        </motion.section>
      </MotionSection>
    </div>
  );
};

export default ParetoTheoryPage;
