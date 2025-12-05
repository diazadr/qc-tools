import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import LandingPage from "./pages/LandingPage";
import CheckSheetPage from "./pages/tools/CheckSheetPage";
import ParetoPage from "./pages/tools/ParetoPage";
import HistogramPage from "./pages/tools/HistogramPage";

import TheoryHubPage from "./pages/theory/TheoryHubPage";
import ChecksheetTheoryPage from "./pages/theory/ChecksheetTheoryPage";
import ParetoTheoryPage from "./pages/theory/ParetoTheoryPage";
import HistogramTheoryPage from "./pages/theory/HistogramTheoryPage";

const App = () => {
  return (
    <MainLayout>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Tools */}
        <Route path="/checksheet/*" element={<CheckSheetPage />} />
        <Route path="/pareto" element={<ParetoPage />} />
        <Route path="/histogram" element={<HistogramPage />} />

        {/* Theory Hub + Subpages */}
        <Route path="/theory" element={<TheoryHubPage />} />
        <Route path="/theory/checksheet" element={<ChecksheetTheoryPage />} />
        <Route path="/theory/pareto" element={<ParetoTheoryPage />} />
        <Route path="/theory/histogram" element={<HistogramTheoryPage />} />

      </Routes>
    </MainLayout>
  );
};

export default App;
