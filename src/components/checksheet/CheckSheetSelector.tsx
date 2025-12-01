interface Props {
  template: string;
  setTemplate: (v: string) => void;
}

const CheckSheetSelector = ({ template, setTemplate }: Props) => {
  return (
    <div className="w-full border-b border-border mb-6">

      <div className="flex">
        <SelectorTab
          active={template === "defective-item"}
          label="Defective Item"
          onClick={() => setTemplate("defective-item")}
        />
        <SelectorTab
          active={template === "production-distribution"}
          label="Distribution"
          onClick={() => setTemplate("production-distribution")}
        />
        <SelectorTab
          active={template === "defect-location"}
          label="Location"
          onClick={() => setTemplate("defect-location")}
        />
        <SelectorTab
          active={template === "defect-cause"}
          label="Cause"
          onClick={() => setTemplate("defect-cause")}
        />
      </div>

    </div>
  );
};

export default CheckSheetSelector;

interface SelectorTabProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

const SelectorTab = ({ active, label, onClick }: SelectorTabProps) => (
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
