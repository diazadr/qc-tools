import { useTranslation } from "react-i18next";
import { MotionSection } from "../../components/common/MotionSection";
import SectionTitle from "../../components/common/SectionTitle";
import { staggerContainer, itemFade } from "../../config/animations";
import { motion } from "framer-motion";

import { HiChartBar, HiSquares2X2, HiRectangleGroup } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const TheoryHubPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      key: "checksheet",
      icon: <HiSquares2X2 className="w-12 h-12 text-primary" />,
      title: t("theory.checksheet_title"),
      desc: t("theory.checksheet_desc"),
      link: "/theory/checksheet",
    },
    {
      key: "pareto",
      icon: <HiChartBar className="w-12 h-12 text-primary" />,
      title: t("theory.pareto_title"),
      desc: t("theory.pareto_desc"),
      link: "/theory/pareto",
    },
    {
      key: "histogram",
      icon: <HiRectangleGroup className="w-12 h-12 text-primary" />,
      title: t("theory.histogram_title"),
      desc: t("theory.histogram_desc"),
      link: "/theory/histogram",
    }
  ];

  return (
    <div className="w-full page pt-[160px] sm:pt-[140px] md:pt-[70px] pb-20 px-6 flex flex-col items-center">

      <MotionSection variants={staggerContainer} className="max-w-5xl w-full text-center">
        <SectionTitle>{t("theory.title")}</SectionTitle>

        <motion.p
          variants={itemFade}
          className="text-secondary text-lg max-w-2xl mx-auto mb-10"
        >
          {t("theory.subtitle")}
        </motion.p>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full"
        >
          {cards.map(card => (
            <motion.div
              key={card.key}
              variants={itemFade}
              onClick={() => navigate(card.link)}
              className="cursor-pointer p-6 border border-border rounded-xl bg-card shadow-sm 
                         hover:shadow-md transition-all hover:-translate-y-1 
                         flex flex-col items-center text-center min-h-[220px]"
            >
              {card.icon}
              <h3 className="mt-4 text-xl font-bold">{card.title}</h3>
              <p className="text-secondary text-sm mt-2">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </MotionSection>

    </div>
  );
};

export default TheoryHubPage;
