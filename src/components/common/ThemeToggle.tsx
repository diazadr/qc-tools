  import { useEffect, useState } from "react";
  import { FaMoon, FaSun } from "react-icons/fa";

  const ThemeToggle = ({ inHero }: { inHero: boolean }) => {
    const [dark, setDark] = useState(() => {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
      if (dark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }, [dark]);

    return (
      <button
        onClick={() => setDark(!dark)}
        className={`
          w-9 h-9 flex items-center justify-center
          rounded-full border 
          ${inHero 
            ? "border-white/80 text-white" 
            : dark 
              ? "border-primary text-primary" 
              : "border-primary text-primary"
          }
          hover:scale-110 active:scale-95 transition
          bg-white/10 dark:bg-white/20
        `}
      >
        {dark ? <FaMoon className="w-5 h-5"/> : <FaSun className="w-5 h-5"/>}
      </button>
    );
  };

  export default ThemeToggle;
