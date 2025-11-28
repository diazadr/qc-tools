import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const SampleDataPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sampleCheckSheet = [
    { name: "Scratch", count: 12 },
    { name: "Crack", count: 7 },
    { name: "Dent", count: 21 },
    { name: "Rust", count: 9 },
    { name: "Paint Defect", count: 14 },
  ];

  const samplePareto = [
    { category: "Misalignment", count: 40 },
    { category: "Loose Part", count: 20 },
    { category: "Overheat", count: 15 },
    { category: "Lubrication", count: 10 },
    { category: "Wear", count: 6 },
    { category: "Other", count: 4 },
  ];

  const sampleHistogram = [
    10.2, 10.5, 10.4, 10.7, 10.3,
    10.1, 10.6, 10.8, 10.4, 10.2,
    9.9, 10.0, 10.2, 10.3, 10.6,
  ];

  const [previewType, setPreviewType] = useState<"none" | "cs" | "pareto" | "hist">("none");

  return (
    <div className="w-full">

      <h1 className="text-3xl font-bold text-text mb-8">
        {t("sample.title")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        {/* CHECK SHEET */}
        <div className="qc-card">
          <h3 className="text-xl font-semibold mb-2">{t("sample.cs")}</h3>
          <button className="qc-btn w-full mb-2" onClick={() => setPreviewType("cs")}>
            {t("sample.preview")}
          </button>
          <button
            className="qc-btn w-full"
            onClick={() => navigate("/checksheet", { state: { sampleData: sampleCheckSheet } })}
          >
            {t("sample.usedata")}
          </button>
        </div>

        {/* PARETO */}
        <div className="qc-card">
          <h3 className="text-xl font-semibold mb-2">{t("sample.pareto")}</h3>
          <button className="qc-btn w-full mb-2" onClick={() => setPreviewType("pareto")}>
            {t("sample.preview")}
          </button>
          <button
            className="qc-btn w-full"
            onClick={() => navigate("/pareto", { state: { sampleData: samplePareto } })}
          >
            {t("sample.usedata")}
          </button>
        </div>

        {/* HISTOGRAM */}
        <div className="qc-card">
          <h3 className="text-xl font-semibold mb-2">{t("sample.hist")}</h3>
          <button className="qc-btn w-full mb-2" onClick={() => setPreviewType("hist")}>
            {t("sample.preview")}
          </button>
          <button
            className="qc-btn w-full"
            onClick={() => navigate("/histogram", { state: { sampleData: sampleHistogram } })}
          >
            {t("sample.usedata")}
          </button>
        </div>
      </div>

      {/* PREVIEW BLOCK */}
      {previewType !== "none" && (
        <div className="qc-card">
          <h2 className="text-lg font-semibold mb-4">
            {t("sample.preview")}
          </h2>

          {previewType === "cs" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-secondary">
                  <th className="py-2">{t("checksheet.col_category")}</th>
                  <th className="py-2 text-center">{t("checksheet.col_count")}</th>
                </tr>
              </thead>
              <tbody>
                {sampleCheckSheet.map((row, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-2">{row.name}</td>
                    <td className="py-2 text-center">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {previewType === "pareto" && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-secondary">
                  <th className="py-2">{t("checksheet.col_category")}</th>
                  <th className="py-2 text-center">{t("checksheet.col_count")}</th>
                </tr>
              </thead>
              <tbody>
                {samplePareto.map((row, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-2">{row.category}</td>
                    <td className="py-2 text-center">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {previewType === "hist" && (
            <div className="text-text text-sm">
              {sampleHistogram.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SampleDataPage;
