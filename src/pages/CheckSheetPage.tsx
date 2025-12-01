import { useState } from "react";
import CheckSheetSelector from "../components/checksheet/CheckSheetSelector";
import CheckSheetDefectiveItem from "../components/checksheet/CheckSheetDefectiveItem";
import CheckSheetProductionDistribution from "../components/checksheet/CheckSheetProductionDistribution";
import CheckSheetDefectLocation from "../components/checksheet/CheckSheetDefectLocation";
import CheckSheetDefectCause from "../components/checksheet/CheckSheetDefectCause";

const CheckSheetPage = () => {
  const [template, setTemplate] = useState("");
  return (
    <div className="w-full font-inter text-[15px]">
      <CheckSheetSelector template={template} setTemplate={setTemplate} />
      {template === "defective-item" && <CheckSheetDefectiveItem />}
      {template === "production-distribution" && <CheckSheetProductionDistribution />}
      {template === "defect-location" && <CheckSheetDefectLocation />}
      {template === "defect-cause" && <CheckSheetDefectCause />}
    </div>
  );
};

export default CheckSheetPage;
