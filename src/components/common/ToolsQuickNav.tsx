import { NavLink } from "react-router-dom";
import {
  HiClipboardDocumentList,
  HiChartBar,
  HiChartPie,
  HiDocumentText,
} from "react-icons/hi2";

const ToolsQuickNav = () => {
  return (
    <div className="flex justify-center gap-3 mb-6 text-sm md:text-base">

      <NavLink
        to="/checksheet"
        className={({ isActive }) =>
          "flex items-center gap-2 px-3 py-1.5 rounded-md border transition " +
          (isActive
            ? "border-primary bg-primary/10 text-primary font-medium"
            : "border-border text-secondary hover:bg-muted hover:text-primary")
        }
      >
        <HiClipboardDocumentList className="w-4 h-4" />
        <span>Check Sheet</span>
      </NavLink>

      <NavLink
        to="/pareto"
        className={({ isActive }) =>
          "flex items-center gap-2 px-3 py-1.5 rounded-md border transition " +
          (isActive
            ? "border-primary bg-primary/10 text-primary font-medium"
            : "border-border text-secondary hover:bg-muted hover:text-primary")
        }
      >
        <HiChartBar className="w-4 h-4" />
        <span>Pareto</span>
      </NavLink>

      <NavLink
        to="/histogram"
        className={({ isActive }) =>
          "flex items-center gap-2 px-3 py-1.5 rounded-md border transition " +
          (isActive
            ? "border-primary bg-primary/10 text-primary font-medium"
            : "border-border text-secondary hover:bg-muted hover:text-primary")
        }
      >
        <HiChartPie className="w-4 h-4" />
        <span>Histogram</span>
      </NavLink>

    </div>
  );
};

export default ToolsQuickNav;
