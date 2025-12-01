import { useState } from "react";
import CheckSheetPage from "./CheckSheetPage";
import ParetoPage from "./ParetoPage";
import HistogramPage from "./HistogramPage";

const ToolsPage = () => {
  const [selectedTool, setSelectedTool] = useState<"checksheet" | "pareto" | "histogram">("checksheet");

  return (
    <div className="w-full pt-24 flex justify-center">
      <div className="w-full max-w-[1400px] px-6 md:px-10">

        <div className="flex mb-4 border-b border-border">
          <ToolTab
            active={selectedTool === "checksheet"}
            label="Check Sheet"
            onClick={() => setSelectedTool("checksheet")}
          />
          <ToolTab
            active={selectedTool === "pareto"}
            label="Pareto"
            onClick={() => setSelectedTool("pareto")}
          />
          <ToolTab
            active={selectedTool === "histogram"}
            label="Histogram"
            onClick={() => setSelectedTool("histogram")}
          />
        </div>

        <div className="pt-2">
          {selectedTool === "checksheet" && <CheckSheetPage />}
          {selectedTool === "pareto" && <ParetoPage />}
          {selectedTool === "histogram" && <HistogramPage />}
        </div>

      </div>
    </div>
  );
};

export default ToolsPage;

interface ToolTabProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

const ToolTab = ({ active, label, onClick }: ToolTabProps) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2.5 text-sm md:text-base text-center transition border-b-2 ${
      active
        ? "border-primary text-primary font-medium"
        : "border-transparent text-secondary hover:text-primary"
    }`}
  >
    {label}
  </button>
);
