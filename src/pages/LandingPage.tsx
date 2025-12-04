import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { HiChevronDown } from "react-icons/hi2";

import FlipFeatureCard from "../components/common/FlipFeatureCard";
import { MotionSection } from "../components/common/MotionSection";
import SectionTitle from "../components/common/SectionTitle";

import { heroImages, toolsImages, featureKeys, toolsKeys } from "../config/data";
import { sectionFade, staggerContainer, itemFade } from "../config/animations";

const LandingPage = () => {
  const { t } = useTranslation();
  const [activeTool, setActiveTool] = useState<number | null>(null);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full page">

      {/* HERO */}
      <section className="relative w-full min-h-screen flex flex-col md:flex-row justify-center md:justify-start overflow-hidden bg-[#0d1117]">

        <div className="w-full md:w-[50%] flex flex-col justify-center px-6 md:pl-16 md:pr-10 z-20">
          <h1 className="hero-title text-white font-extrabold leading-[1.15] text-[2rem] sm:text-[2.4rem] md:text-[3.6rem] max-w-[90%] md:max-w-xl">
            <span className="block min-h-[4.5rem] md:min-h-[6.5rem] leading-[1.15]">
              <Typewriter
                words={[
                  t("landing.hero_rot1"),
                  t("landing.hero_rot2"),
                  t("landing.hero_rot3"),
                  t("landing.hero_rot4"),
                ]}
                loop={true}
                cursor
                typeSpeed={60}
                deleteSpeed={50}
                delaySpeed={1400}
              />
            </span>
            <span className="block min-h-[3rem] md:min-h-[4rem] leading-[1.15]">
              {t("landing.hero3")}
            </span>
          </h1>

          <p className="mt-4 max-w-[95%] md:max-w-md text-white/70 text-sm sm:text-base md:text-lg">
            {t("landing.subtitle")}
          </p>

          <motion.button whileHover={{ scale: 1.05 }} className="hero-btn absolute bottom-10">
            {t("landing.use")}
          </motion.button>
        </div>

        <div className="hidden md:block relative w-[60%] h-full diagonal-wrapper md:absolute md:right-0 md:top-0">
          <div className="hero-img-diagonal"
            style={{ backgroundImage: `url(${heroImages[currentImage]})` }} />
        </div>
      </section>

      {/* FEATURES */}
      <MotionSection className="max-w-4xl mx-auto text-center py-14 px-4">
        <SectionTitle>{t("landing.features")}</SectionTitle>
        <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-text" variants={staggerContainer}>
          {featureKeys.map((key) => (
            <motion.div key={key} variants={itemFade} className="qc-card text-sm md:text-base">
              ✔ {t(`landing.${key}`)}
            </motion.div>
          ))}
        </motion.div>
      </MotionSection>

      {/* TOOLS */}
      <MotionSection data-id="tools" className="w-full max-w-none py-14 px-0 text-center">
        <SectionTitle>{t("landing.available")}</SectionTitle>
        <motion.div className="flex w-full h-[260px] md:h-[360px] overflow-hidden"
          variants={staggerContainer}>
          {toolsKeys.map((key, index) => (
            <motion.div
              key={key}
              className={`expand-img ${activeTool === index ? "active" : ""}`}
              style={{ backgroundImage: `url(${toolsImages[index]})` }}
              variants={itemFade}
              transition={{ duration: 0.5, delay: 0.05 * index }}
              whileHover={{ scale: 1 }}
              onClick={() => {
                if (window.matchMedia("(hover: none)").matches) {
                  setActiveTool(activeTool === index ? null : index);
                }
              }}
            >
              <div className="expand-overlay">
                <h2 className="expand-title">{t(`landing.${key}_title`)}</h2>
                <p className="expand-desc mt-3 not-tailwind">
                  {t(`landing.${key}_desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </MotionSection>

      {/* QC WORKFLOW */}
      <MotionSection className="qc-dark" variants={sectionFade}>
        <div className="qc-bg-left" style={{ backgroundImage: "url('/img/design.png')" }} />
        <div className="qc-bg-right" />

        <motion.div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12"
          variants={staggerContainer}>

          <motion.div className="flex flex-col justify-center" variants={itemFade}>
            <span className="text-3xl font-bold text-sm tracking-widest">QC WORKFLOW</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2">{t("workflow.title")}</h2>
            <p className="text-secondary mt-4 max-w-md">{t("workflow.subtitle")}</p>

            <motion.div className="qc-number-image mt-10"
              style={{ backgroundImage: "url('/img/3qcworkflow.webp')",  backgroundSize: "60%",backgroundPosition: "left", }}
              variants={itemFade}>
              3 QC
            </motion.div>
          </motion.div>

          <motion.div className="space-y-10 pl-6 border-l border-[rgba(255,255,255,0.12)]"
            variants={staggerContainer}>

            <motion.div variants={itemFade}>
              <h3 className="text-xl font-bold">{t("workflow.w1_title")}</h3>
              <p className="text-secondary">{t("workflow.w1_desc")}</p>
            </motion.div>

            <motion.div variants={itemFade}>
              <h3 className="text-xl font-bold">{t("workflow.w2_title")}</h3>
              <p className="text-secondary">{t("workflow.w2_desc")}</p>
            </motion.div>

            <motion.div variants={itemFade}>
              <h3 className="text-xl font-bold">{t("workflow.w3_title")}</h3>
              <p className="text-secondary">{t("workflow.w3_desc")}</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </MotionSection>

      {/* WHO */}
      <MotionSection className="w-full py-14 px-4 flex flex-col items-center">
        <SectionTitle>{t("landing.who")}</SectionTitle>

        <motion.div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 text-center"
          variants={staggerContainer}>
          <motion.div variants={itemFade}>
            <FlipFeatureCard
              frontImage="/img/who-industry.webp"
              titleFront={t("landing.who1_title")}
              titleBack={t("landing.who1_title")}
              descriptionBack={t("landing.who1_desc")}
            />
          </motion.div>

          <motion.div variants={itemFade}>
            <FlipFeatureCard
              frontImage="/img/who-mahasiswa.webp"
              titleFront={t("landing.who2_title")}
              titleBack={t("landing.who2_title")}
              descriptionBack={t("landing.who2_desc")}
            />
          </motion.div>

          <motion.div variants={itemFade}>
            <FlipFeatureCard
              frontImage="/img/who-department.webp"
              titleFront={t("landing.who3_title")}
              titleBack={t("landing.who3_title")}
              descriptionBack={t("landing.who3_desc")}
            />
          </motion.div>
        </motion.div>
      </MotionSection>

      {/* FAQ */}
      <MotionSection className="w-full py-14 px-4 flex flex-col items-center">
        <SectionTitle>{t("faq.title")}</SectionTitle>

        <motion.div
          className="max-w-4xl w-full mx-auto divide-y divide-[var(--border)] border border-border rounded-xl overflow-hidden bg-card shadow-sm"
          variants={staggerContainer}
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.details key={i} className="group" variants={itemFade}>
              <summary className="cursor-pointer p-4 font-semibold text-text text-lg flex justify-between items-center group-open:bg-[var(--border)] transition">
                <span>{t(`faq.q${i + 1}`)}</span>
                <HiChevronDown className="w-5 h-5 text-secondary transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="p-4 text-secondary leading-relaxed bg-card">
                {t(`faq.a${i + 1}`)}
              </div>
            </motion.details>
          ))}
        </motion.div>
      </MotionSection>

      {/* ABOUT */}
      <MotionSection className="w-full py-14 px-4 leading-relaxed flex flex-col items-center">
        <SectionTitle>{t("about.title")}</SectionTitle>

        <motion.article
          className="max-w-4xl text-left space-y-6 text-[1.05rem] text-secondary"
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
