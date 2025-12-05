import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { MotionSection } from "../../components/common/MotionSection"
import SectionTitle from "../../components/common/SectionTitle"
import { itemFade } from "../../config/animations"

const HistogramTheoryPage = () => {
  const { t } = useTranslation()

  return (
    <div className="w-full page pt-[90px] pb-12 px-6 max-w-5xl mx-auto text-left leading-relaxed">

      <MotionSection>
        <SectionTitle>{t("histogram_theory.title")}</SectionTitle>

        <motion.section variants={itemFade} className="space-y-4 mt-6">
          <h2 className="text-xl font-bold">{t("histogram_theory.s1_title")}</h2>
          <p>{t("histogram_theory.s1_desc1")}</p>
          <p>{t("histogram_theory.s1_desc2")}</p>
          <p>{t("histogram_theory.s1_desc3")}</p>
        </motion.section>

        <motion.section variants={itemFade} className="space-y-4 mt-10">
          <h2 className="text-xl font-bold">{t("histogram_theory.s2_title")}</h2>
          <p>{t("histogram_theory.s2_desc1")}</p>
          <p>{t("histogram_theory.s2_desc2")}</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>{t("histogram_theory.s2_point1")}</li>
            <li>{t("histogram_theory.s2_point2")}</li>
            <li>{t("histogram_theory.s2_point3")}</li>
          </ul>
        </motion.section>

        <motion.section variants={itemFade} className="space-y-4 mt-10">
          <h2 className="text-xl font-bold">{t("histogram_theory.s3_title")}</h2>
          <p>{t("histogram_theory.s3_desc1")}</p>
          <p>{t("histogram_theory.s3_desc2")}</p>
        </motion.section>

        <motion.section variants={itemFade} className="space-y-4 mt-12">
          <h2 className="text-xl font-bold">{t("histogram_theory.s4_title")}</h2>
          <p>{t("histogram_theory.s4_desc")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[
              "general",
              "comb",
              "positive",
              "left_precipice",
              "plateau",
              "twin_peak",
              "isolated"
            ].map((key) => (
              <div key={key} className="p-4 border border-border rounded bg-card">
                <h3 className="font-semibold">
                  {t(`histogram_theory.type_${key}_title`)}
                </h3>
                <p className="text-sm mt-2">
                  {t(`histogram_theory.type_${key}_desc`)}
                </p>
                <p className="text-xs text-secondary mt-1">
                  {t(`histogram_theory.type_${key}_note`)}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={itemFade} className="space-y-4 mt-12">
          <h2 className="text-xl font-bold">{t("histogram_theory.s5_title")}</h2>
          <p>{t("histogram_theory.s5_desc1")}</p>

          <ul className="list-disc ml-6 space-y-1">
            <li>{t("histogram_theory.s5_ok1")}</li>
            <li>{t("histogram_theory.s5_ok2")}</li>
            <li>{t("histogram_theory.s5_ok3")}</li>
            <li>{t("histogram_theory.s5_bad1")}</li>
            <li>{t("histogram_theory.s5_bad2")}</li>
          </ul>
        </motion.section>

        <motion.section variants={itemFade} className="space-y-4 mt-12">
          <h2 className="text-xl font-bold">{t("histogram_theory.s6_title")}</h2>
          <p>{t("histogram_theory.s6_desc1")}</p>
          <p>{t("histogram_theory.s6_desc2")}</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>{t("histogram_theory.s6_point1")}</li>
            <li>{t("histogram_theory.s6_point2")}</li>
            <li>{t("histogram_theory.s6_point3")}</li>
          </ul>
        </motion.section>

        <motion.section variants={itemFade} className="space-y-4 mt-12">
          <h2 className="text-xl font-bold">{t("histogram_theory.s7_title")}</h2>
          <p>{t("histogram_theory.s7_desc1")}</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>{t("histogram_theory.s7_mean")}</li>
            <li>{t("histogram_theory.s7_variance")}</li>
            <li>{t("histogram_theory.s7_stddev")}</li>
          </ul>
        </motion.section>

        <motion.section variants={itemFade} className="space-y-4 mt-12">
          <h2 className="text-xl font-bold">{t("histogram_theory.s8_title")}</h2>
          <p>{t("histogram_theory.s8_desc1")}</p>
          <ul className="list-disc ml-6">
            <li>{t("histogram_theory.s8_point1")}</li>
            <li>{t("histogram_theory.s8_point2")}</li>
          </ul>
          <p>{t("histogram_theory.s8_desc2")}</p>
        </motion.section>

        <motion.section variants={itemFade} className="space-y-4 mt-12 pb-12">
          <h2 className="text-xl font-bold">{t("histogram_theory.s9_title")}</h2>
          <p>{t("histogram_theory.s9_desc1")}</p>
          <ul className="list-disc ml-6">
            <li>{t("histogram_theory.s9_cp")}</li>
            <li>{t("histogram_theory.s9_cpk")}</li>
          </ul>
        </motion.section>
      </MotionSection>

    </div>
  )
}

export default HistogramTheoryPage
