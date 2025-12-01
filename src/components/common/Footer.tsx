import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
<footer className="bg-primary text-white pt-16 pb-10 mt-20 relative overflow-hidden">
  <img 
    src="/img/icon.png" 
    className="absolute left-[-20px] bottom-[-20px] h-60 rotate-50 opacity-[0.18]"
  />

  <img 
    src="/img/icon.png" 
    className="absolute right-[-20px] top-[-20px] h-60 rotate-230 opacity-[0.18]"
  />
  <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6">

    <div>
      <img src="/img/icon.png" className="h-14 mb-4" />
      <p className="text-sm leading-relaxed text-white/90 max-w-md">
        {t("footer.description")}
      </p>
    </div>

    <div className="flex flex-col gap-3 mt-4 md:mt-0">
      <h3 className="font-semibold text-white">{t("footer.qctools")}</h3>
      <a href="/tools" className="text-white hover:text-white/80">{t("footer.tools")}</a>
      <a href="/sample" className="text-white hover:text-white/80">{t("footer.sampledata")}</a>
    </div>

    <div className="flex flex-col gap-3 mt-4 md:mt-0">
      <h3 className="font-semibold text-white">{t("footer.support")}</h3>
      <a href="/contact" className="text-white hover:text-white/80">{t("footer.contact")}</a>
      <a href="/terms" className="text-white hover:text-white/80">{t("footer.terms")}</a>
      <a href="#" className="text-white hover:text-white/80">{t("footer.docs")}</a>
      <a href="#" className="text-white hover:text-white/80">{t("footer.api")}</a>
    </div>

  </div>

  <div className="mt-10 pt-5 flex flex-col md:flex-row justify-between px-6 max-w-7xl mx-auto text-sm text-white/90">
    <div>
      © {new Date().getFullYear()} QC Tools — {t("footer.rights")}
    </div>

    <div className="flex gap-3">
      <a href="/terms" className="hover:text-white">{t("footer.terms")}</a>
      <span>|</span>
      <a href="/privacy" className="hover:text-white">{t("footer.privacy")}</a>
    </div>
  </div>

</footer>


  );
};

export default Footer;
