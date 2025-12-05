import { Link, useLocation } from "react-router-dom";

const CheckSheetSelector = () => {
  const location = useLocation();

  return (
    <div className="w-full border-b border-border mb-6">
      <div className="flex">
        <SelectorTab
          label="Defective Item"
          to="/checksheet/defective-item"
          active={location.pathname === "/checksheet/defective-item"}
        />
        <SelectorTab
          label="Distribution"
          to="/checksheet/production-distribution"
          active={location.pathname === "/checksheet/production-distribution"}
        />
        <SelectorTab
          label="Location"
          to="/checksheet/defect-location"
          active={location.pathname === "/checksheet/defect-location"}
        />
        <SelectorTab
          label="Cause"
          to="/checksheet/defect-cause"
          active={location.pathname === "/checksheet/defect-cause"}
        />
      </div>
    </div>
  );
};

export default CheckSheetSelector;

interface SelectorTabProps {
  active: boolean;
  label: string;
  to: string;
}

const SelectorTab = ({ active, label, to }: SelectorTabProps) => (
  <Link
    to={to}
    className={`flex-1 py-2.5 text-sm md:text-base text-center transition border-b-2 ${
      active
        ? "border-primary text-primary font-medium"
        : "border-transparent text-secondary hover:text-primary"
    }`}
  >
    {label}
  </Link>
);
