import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { MotionSection } from "../../components/common/MotionSection"
import SectionTitle from "../../components/common/SectionTitle"
import { itemFade } from "../../config/animations"

const ChecksheetTheoryPage = () => {
  const { t } = useTranslation()

  return (
    <div className="w-full page pt-[90px] pb-12 px-6 max-w-5xl mx-auto text-left leading-relaxed">

      <MotionSection>
        <SectionTitle>{t("checksheet_theory.title")}</SectionTitle>

        <motion.section variants={itemFade} className="space-y-4 mt-6">
          <h2 className="text-2xl font-bold">{t("checksheet_theory.section1_title")}</h2>

          <p>{t("checksheet_theory.section1_id")}</p>
          <p>{t("checksheet_theory.section1_en")}</p>
          <p>{t("checksheet_theory.section1_intro")}</p>

          <ul className="list-disc ml-6 space-y-1">
            <li>{t("checksheet_theory.section1_point1")}</li>
            <li>{t("checksheet_theory.section1_point2")}</li>
            <li>{t("checksheet_theory.section1_point3")}</li>
            <li>{t("checksheet_theory.section1_point4")}</li>
          </ul>

          <p>{t("checksheet_theory.section1_close")}</p>
        </motion.section>

        <motion.section variants={itemFade} className="space-y-6 mt-14">
          <h2 className="text-2xl font-bold">{t("checksheet_theory.section2_title")}</h2>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold">{t("checksheet_theory.A_title")}</h3>
            <p>{t("checksheet_theory.A_id")}</p>
            <p>{t("checksheet_theory.A_en")}</p>
            <p>{t("checksheet_theory.A_theory")}</p>

            <ul className="list-disc ml-6 space-y-1">
              <li>{t("checksheet_theory.A_imp1")}</li>
              <li>{t("checksheet_theory.A_imp2")}</li>
              <li>{t("checksheet_theory.A_imp3")}</li>
              <li>{t("checksheet_theory.A_imp4")}</li>
            </ul>

           <img src="/img/defective.png" className="max-w-[240px] mx-auto rounded-md" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold">{t("checksheet_theory.B_title")}</h3>
            <p>{t("checksheet_theory.B_id")}</p>
            <p>{t("checksheet_theory.B_en")}</p>
            <p>{t("checksheet_theory.B_theory")}</p>

            <ul className="list-disc ml-6 space-y-1">
              <li>{t("checksheet_theory.B_imp1")}</li>
              <li>{t("checksheet_theory.B_imp2")}</li>
              <li>{t("checksheet_theory.B_imp3")}</li>
              <li>{t("checksheet_theory.B_imp4")}</li>
            </ul>

            <img src="/img/location.png" className="max-w-[240px] mx-auto rounded-md" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold">{t("checksheet_theory.C_title")}</h3>
            <p>{t("checksheet_theory.C_id")}</p>
            <p>{t("checksheet_theory.C_en")}</p>
            <p>{t("checksheet_theory.C_theory")}</p>

            <ul className="list-disc ml-6 space-y-1">
              <li>{t("checksheet_theory.C_imp1")}</li>
              <li>{t("checksheet_theory.C_imp2")}</li>
              <li>{t("checksheet_theory.C_imp3")}</li>
              <li>{t("checksheet_theory.C_imp4")}</li>
            </ul>

            <img src="/img/cause.png" className="max-w-[240px] mx-auto rounded-md" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold">{t("checksheet_theory.D_title")}</h3>
            <p>{t("checksheet_theory.D_id")}</p>
            <p>{t("checksheet_theory.D_en")}</p>
            <p>{t("checksheet_theory.D_theory")}</p>

            <ul className="list-disc ml-6 space-y-1">
              <li>{t("checksheet_theory.D_imp1")}</li>
              <li>{t("checksheet_theory.D_imp2")}</li>
              <li>{t("checksheet_theory.D_imp3")}</li>
              <li>{t("checksheet_theory.D_imp4")}</li>
            </ul>

           <img src="/img/distribution.png" className="max-w-[240px] mx-auto rounded-md" />
          </div>
        </motion.section>

      </MotionSection>

    </div>
  )
}

export default ChecksheetTheoryPage
