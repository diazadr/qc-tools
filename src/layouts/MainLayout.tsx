import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar isLandingPage={isLandingPage} />

      {isLandingPage ? (
        <main className="flex-1 w-full">{children}</main>
      ) : (
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-20">{children}</main>
      )}

      <Footer />
    </div>
  );
};

export default MainLayout;
