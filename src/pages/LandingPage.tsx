import { useTranslation } from "react-i18next";
import FlipFeatureCard from "../components/common/FlipFeatureCard";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { HiChevronDown } from "react-icons/hi2";


// === Variants reusable ===
const sectionFade = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const sectionFadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

const sectionFadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemFade = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

// Wrapper untuk section supaya nggak ulang-ulang
const MotionSection = ({
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

const LandingPage = () => {
  const { t } = useTranslation();

  const featureKeys = ["f1", "f2", "f3", "f4", "f5", "f6"];
  const toolsKeys = ["t1", "t2", "t3"];

  return (
    <div className="w-full page">

      {/* HERO ================================================== */}
     <section
        className="relative h-[100vh] w-full flex items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: "url('/img/factory1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-black/75"></div>

        <motion.div
          className="relative z-10 px-4"
          initial={{ opacity: 0, y: 40 }}
          animate ={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        >
          <motion.h1
            className="text-white font-extrabold leading-[1.05] drop-shadow-2xl text-[2.4rem] md:text-[4.1rem]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.1 }}
          >
            {t("landing.hero1")}{" "}
            <span className="word-underline">{t("landing.hero2")}</span>
            <br />
            {t("landing.hero3")}
          </motion.h1>

          <motion.p
            className="mt-5 max-w-2xl mx-auto text-secondary text-lg md:text-xl text-white/80"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
          >
            {t("landing.subtitle")}
          </motion.p>

          <motion.button
           whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.93 }}
  transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="mt-10 text-white text-lg md:text-xl border border-white/70 bg-white/10 backdrop-blur-md rounded-full px-8 py-3 flex items-center gap-3 mx-auto hover:bg-white/20"
          >
            {t("landing.use")}
          </motion.button>
        </motion.div>

      </section>


      <div className="absolute bottom-0 left-0 w-full h-[200px] bg-gradient-to-b from-transparent to-[var(--bg)]"></div>
      {/* FEATURES =============================================== */}
      <MotionSection className="max-w-4xl mx-auto text-center py-14 px-4">
        <motion.h3
          className="text-xl md:text-2xl font-bold text-primary mb-6"
          variants={itemFade}
        >
          {t("landing.features")}
        </motion.h3>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-4 text-text"
          variants={staggerContainer}
        >
          {featureKeys.map((key) => (
            <motion.div
              key={key}
              variants={itemFade}
              className="qc-card text-sm md:text-base"
            >
              ✔ {t(`landing.${key}`)}
            </motion.div>
          ))}
        </motion.div>
      </MotionSection>

      {/* TOOLS AVAILABLE (EXPAND IMAGES) ======================== */}
      <MotionSection className="w-full py-14 px-4" variants={sectionFade}>
        <motion.h3
          className="text-center text-3xl font-bold text-primary mb-8"
          variants={itemFade}
        >
          {t("landing.available")}
        </motion.h3>

        <motion.div
          className="flex w-full h-[260px] md:h-[360px]"
          variants={staggerContainer}
        >
          {toolsKeys.map((key, index) => (
            <motion.div
              key={key}
              className="expand-img"
              style={{ backgroundImage: "url('/img/factory1.jpg')" }}
              variants={itemFade}
              transition={{ duration: 0.5, delay: 0.05 * index }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="expand-overlay">
                <h2 className="text-3xl md:text-4xl font-extrabold">
                  {t(`landing.${key}_title`)}
                </h2>
                <p className="text-lg md:text-2xl font-medium mt-3">
                  {t(`landing.${key}_desc`)}
                </p>
              </div>

            </motion.div>
          ))}

        </motion.div>
      </MotionSection>

      {/* QC DARK WORKFLOW ======================================= */}
      {/* QC WORKFLOW ======================================= */}
      <MotionSection className="qc-dark" variants={sectionFade}>
        <div
          className="qc-bg-left"
          style={{ backgroundImage: "url('/img/factory1.jpg')" }}
        ></div>
        <div
          className="qc-bg-right"
          style={{ backgroundImage: "url('/img/robot.jpg')" }}
        ></div>

        <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* LEFT SIDE ================================== */}
          <motion.div
            className="flex flex-col justify-center"
            variants={sectionFadeLeft}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="text-3xl font-bold text-sm tracking-widest">
              QC WORKFLOW
            </span>

            <h2 className="text-3xl md:text-4xl font-extrabold mt-2">
              {t("workflow.title")}
            </h2>

            <p className="text-secondary mt-4 max-w-md">
              {t("workflow.subtitle")}
            </p>

            <motion.div
              className="qc-number-image mt-10"
              style={{ backgroundImage: "url('/img/factory1.jpg')" }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 0.9, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              3 QC
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE ================================= */}
          <motion.div
            className="space-y-10 pl-6 border-l border-[rgba(255,255,255,0.12)]"
            variants={sectionFadeRight}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div variants={itemFade}>
              <h3 className="text-xl font-bold">{t("workflow.w1_title")}</h3>
              <p className="text-secondary">
                {t("workflow.w1_desc")}
              </p>
            </motion.div>

            <motion.div variants={itemFade}>
              <h3 className="text-xl font-bold">{t("workflow.w2_title")}</h3>
              <p className="text-secondary">
                {t("workflow.w2_desc")}
              </p>
            </motion.div>

            <motion.div variants={itemFade}>
              <h3 className="text-xl font-bold">{t("workflow.w3_title")}</h3>
              <p className="text-secondary">
                {t("workflow.w3_desc")}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </MotionSection>

      {/* WHO SECTION ============================================ */}
      <MotionSection className="max-w-6xl mx-auto py-14 px-4" variants={sectionFade}>
        <motion.h3
          className="text-center text-3xl font-bold text-primary mb-8"
          variants={itemFade}
        >
          {t("landing.who")}
        </motion.h3>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center"
          variants={staggerContainer}
        >
          <motion.div variants={itemFade}>
            <FlipFeatureCard
              frontImage="/img/factory1.jpg"
              titleFront={t("landing.who1_title")}
              titleBack={t("landing.who1_title")}
              descriptionBack={t("landing.who1_desc")}
            />

          </motion.div>
          <motion.div variants={itemFade}>
            <FlipFeatureCard
              frontImage="/img/factory1.jpg"
              titleFront={t("landing.who2_title")}
              titleBack={t("landing.who2_title")}
              descriptionBack={t("landing.who2_desc")}
            />

          </motion.div>
          <motion.div variants={itemFade}>
            <FlipFeatureCard
              frontImage="/img/factory1.jpg"
              titleFront={t("landing.who3_title")}
              titleBack={t("landing.who3_title")}
              descriptionBack={t("landing.who3_desc")}
            />

          </motion.div>
        </motion.div>
      </MotionSection>

      {/* FAQ ===================================================== */}
      <MotionSection className="max-w-4xl mx-auto py-14 px-4" variants={sectionFade}>
        <motion.h2
          className="text-3xl font-extrabold mb-6 text-center text-primary"
          variants={itemFade}
        >
          {t("faq.title")}
        </motion.h2>

        <motion.div
          className="divide-y divide-[var(--border)] border border-border rounded-xl overflow-hidden bg-card shadow-sm"
          variants={staggerContainer}
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.details key={i} className="group" variants={itemFade}>
              <summary className="cursor-pointer p-4 font-semibold text-text text-lg flex justify-between items-center group-open:bg-[var(--border)] transition">
                <span>{t(`faq.q${i + 1}`)}</span>
                <HiChevronDown
                  className="w-5 h-5 text-secondary transition-transform duration-300 group-open:rotate-180"
                />
              </summary>
              <div className="p-4 text-secondary leading-relaxed bg-card">
                {t(`faq.a${i + 1}`)}
              </div>
            </motion.details>

          ))}
        </motion.div>
      </MotionSection>

      {/* ABOUT =================================================== */}
      <MotionSection className="max-w-4xl mx-auto py-14 px-4 leading-relaxed" variants={sectionFade}>
        <motion.h2
          className="text-3xl font-extrabold mb-8 text-center text-primary"
          variants={itemFade}
        >
          {t("about.title")}
        </motion.h2>

        <motion.article
          className="space-y-6 text-[1.05rem] text-secondary"
          variants={staggerContainer}
        >
          <motion.p variants={itemFade}>{t("about.purpose_desc")}</motion.p>
          <motion.p variants={itemFade}>{t("about.background_desc")}</motion.p>
          <motion.p variants={itemFade}>{t("about.design_desc")}</motion.p>
          <motion.p variants={itemFade}>{t("about.credit_desc")}</motion.p>
        </motion.article>
      </MotionSection>
    </div>


  );
};

export default LandingPage;
