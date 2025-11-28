import { useState } from "react";
import CheckSheetPage from "./CheckSheetPage";
import ParetoPage from "./ParetoPage";
import HistogramPage from "./HistogramPage";

const ToolsPage = () => {
  const [selectedTool, setSelectedTool] = useState("checksheet");

  return (
    <div className="w-full pt-24 page flex justify-center">

      <div className="w-full max-w-[1400px] px-10">

        {/* TOOL SELECTOR BUTTONS */}
        <div className="flex mb-6 border-b border-border">

          <button
            className={`flex-1 py-3 text-center font-semibold transition ${
              selectedTool === "checksheet"
                ? "text-primary border-b-2 border-primary"
                : "text-secondary hover:text-primary"
            }`}
            onClick={() => setSelectedTool("checksheet")}
          >
            Check Sheet
          </button>

          <button
            className={`flex-1 py-3 text-center font-semibold transition ${
              selectedTool === "pareto"
                ? "text-primary border-b-2 border-primary"
                : "text-secondary hover:text-primary"
            }`}
            onClick={() => setSelectedTool("pareto")}
          >
            Pareto
          </button>

          <button
            className={`flex-1 py-3 text-center font-semibold transition ${
              selectedTool === "histogram"
                ? "text-primary border-b-2 border-primary"
                : "text-secondary hover:text-primary"
            }`}
            onClick={() => setSelectedTool("histogram")}
          >
            Histogram
          </button>

        </div>

        {/* RENDER CONTENT */}
        <div className="mt-4">
          {selectedTool === "checksheet" && <CheckSheetPage />}
          {selectedTool === "pareto" && <ParetoPage />}
          {selectedTool === "histogram" && <HistogramPage />}
        </div>

      </div>
    </div>
  );
};

export default ToolsPage;
