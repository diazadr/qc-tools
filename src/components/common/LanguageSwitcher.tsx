import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FaGlobe } from "react-icons/fa";
import ReactCountryFlag from "react-country-flag";

const LanguageSwitcher = ({ inHero }: { inHero: boolean }) => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  const setLang = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setOpen(false);
  };

  return (
    <div className="relative flex items-center">
      <button onClick={() => setOpen(!open)} className={`
        w-9 h-9 flex items-center justify-center
        rounded-full border 
        ${inHero ? "border-white/80 text-white" : "border-primary text-primary dark:text-primary"}
        hover:scale-110 active:scale-95 transition
        bg-white/10 dark:bg-white/20
      `}>
        <FaGlobe className="w-5 h-5" />
      </button>

      {open && (
        <div className={`
          absolute right-0 top-10 mt-1 
          backdrop-blur-md shadow-lg rounded-lg overflow-hidden border 
          ${inHero ? "bg-white/20 border-white/30" : "bg-card border-border"}
        `}>
          <button
            onClick={() => setLang("id")}
            className={`
    flex items-center gap-2 px-4 py-2 text-sm w-full
    ${i18n.language.startsWith("id")
                ? "font-bold text-primary"
                : inHero
                  ? "text-white"
                  : "text-[var(--text)]"
              }
  `}
          >
            <ReactCountryFlag countryCode="ID" svg className="w-5 h-5" />
            {t("lang_name_id")}
          </button>

          <button
            onClick={() => setLang("en")}
            className={`
    flex items-center gap-2 px-4 py-2 text-sm w-full
    ${i18n.language.startsWith("en")
                ? "font-bold text-primary"
                : inHero
                  ? "text-white"
                  : "text-[var(--text)]"
              }
  `}
          >
            <ReactCountryFlag countryCode="GB" svg className="w-5 h-5" />
            {t("lang_name_en")}
          </button>

        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
