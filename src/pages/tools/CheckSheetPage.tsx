import { Routes, Route, Navigate } from "react-router-dom";
import CheckSheetSelector from "../../components/checksheet/CheckSheetSelector";
import CheckSheetDefectiveItem from "../../components/checksheet/CheckSheetDefectiveItem";
import CheckSheetProductionDistribution from "../../components/checksheet/CheckSheetProductionDistribution";
import CheckSheetDefectLocation from "../../components/checksheet/CheckSheetDefectLocation";
import CheckSheetDefectCause from "../../components/checksheet/CheckSheetDefectCause";
import ToolsQuickNav from "../../components/common/ToolsQuickNav";

const CheckSheetPage = () => {
  return (
    <div className="w-full font-inter text-[15px]">
       <ToolsQuickNav />
      <CheckSheetSelector />

      <Routes>
        <Route path="/" element={<Navigate to="defective-item" replace />} />
        <Route path="defective-item" element={<CheckSheetDefectiveItem />} />
        <Route path="production-distribution" element={<CheckSheetProductionDistribution />} />
        <Route path="defect-location" element={<CheckSheetDefectLocation />} />
        <Route path="defect-cause" element={<CheckSheetDefectCause />} />
      </Routes>
    </div>
  );
};

export default CheckSheetPage;
