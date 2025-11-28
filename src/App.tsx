import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import LandingPage from "./pages/LandingPage";
import ToolSelectorPage from "./pages/ToolSelectorPage";
import CheckSheetPage from "./pages/CheckSheetPage";
import ParetoPage from "./pages/ParetoPage";
import HistogramPage from "./pages/HistogramPage";
import CombinedReportPage from "./pages/CombinedReportPage";
import SampleDataPage from "./pages/SampleDataPage";


const App = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tools" element={<ToolSelectorPage />} />
        <Route path="/checksheet" element={<CheckSheetPage />} />
        <Route path="/pareto" element={<ParetoPage />} />
        <Route path="/histogram" element={<HistogramPage />} />
        <Route path="/report" element={<CombinedReportPage />} />
        <Route path="/sample" element={<SampleDataPage />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
