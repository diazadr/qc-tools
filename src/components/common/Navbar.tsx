import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

import { useEffect, useState, useRef } from "react";

import {
  HiHome,
  HiWrenchScrewdriver,
  HiBookOpen
} from "react-icons/hi2";

const Navbar = ({ isLandingPage }: { isLandingPage: boolean }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    const active = location.pathname === path;
    const inHero = isLandingPage && !scrolled;
    return inHero
      ? active
        ? "text-white font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
        : "text-white/85 hover:text-white"
      : active
        ? "text-primary font-bold"
        : "text-text hover:text-primary";
  };

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-[60] py-4
        transition-[background-color,box-shadow,color] duration-500 ease-out
        ${
          isLandingPage
            ? scrolled
              ? "bg-card text-text shadow-md"
              : "bg-transparent text-white"
            : "bg-card text-text shadow-md"
        }
      `}
    >
      <div className="w-full px-6 flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          className={`
            text-xl font-extrabold tracking-wide select-none cursor-pointer flex items-center gap-2
            ${
              !isLandingPage || scrolled
                ? "text-primary"
                : "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            }
          `}
          onClick={() => setMenuOpen(false)}
        >
          <img src="/img/icon.webp" className="w-6 h-6 object-contain" />
          QC Tools
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={`flex items-center gap-2 ${isActive("/")}`}>
            <HiHome className="w-4 h-4" />
            {t("nav.home")}
          </Link>

          <Link to="/checksheet/defective-item" className={`flex items-center gap-2 ${isActive("/checksheet/defective-item")}`}>
            <HiWrenchScrewdriver className="w-4 h-4" />
            {t("nav.tools")}
          </Link>

          <Link to="/theory" className={`flex items-center gap-2 ${isActive("/theory")}`}>
            <HiBookOpen className="w-4 h-4" />
            {t("nav.theory")}
          </Link>
        </nav>

        {/* DESKTOP RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle inHero={isLandingPage && !scrolled} />
          <LanguageSwitcher inHero={isLandingPage && !scrolled} />
        </div>

        {/* MOBILE BURGER */}
        <button
          className={`
            md:hidden p-2 flex items-center justify-center z-[90] relative rounded-full
            ${menuOpen ? "bg-white/10 text-white" : ""}
          `}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        </div>
      )}

      {/* MOBILE DRAWER */}
      <div
        ref={menuRef}
        className={`
          fixed top-0 right-0 h-full w-[78%] max-w-[300px] z-50
          transition-transform duration-300 ease-out
          ${menuOpen ? "translate-x-0" : "translate-x-full"}
          ${
            isLandingPage && !scrolled
              ? "bg-[#0f1520] text-white"
              : "bg-card text-text shadow-xl"
          }
        `}
      >
        <div className="flex flex-col gap-5 p-6 mt-14 text-lg font-medium">

          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 ${isActive("/")}`}
          >
            <HiHome className="w-5 h-5" />
            {t("nav.home")}
          </Link>

          <Link
            to="/tools"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 ${isActive("/tools")}`}
          >
            <HiWrenchScrewdriver className="w-5 h-5" />
            {t("nav.tools")}
          </Link>

          <Link
            to="/theory"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 ${isActive("/theory")}`}
          >
            <HiBookOpen className="w-5 h-5" />
            {t("nav.theory")}
          </Link>

          <div className="border-t pt-4 mt-2 flex items-center gap-4">
            <ThemeToggle inHero={isLandingPage && !scrolled} />
            <LanguageSwitcher inHero={isLandingPage && !scrolled} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
