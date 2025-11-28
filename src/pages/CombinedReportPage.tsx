import { useState } from "react";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CombinedReportPage = () => {
  const { t } = useTranslation();

  const [includeCheckSheet, setIncludeCheckSheet] = useState(true);
  const [includePareto, setIncludePareto] = useState(true);
  const [includeHistogram, setIncludeHistogram] = useState(true);

  const [project, setProject] = useState("");
  const [company, setCompany] = useState("");
  const [line, setLine] = useState("");
  const [date, setDate] = useState("");
  const [creator, setCreator] = useState("");

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(t("report.title"), 14, 14);

    doc.setFontSize(10);
    doc.text(`${t("report.project")}: ${project}`, 14, 26);
    doc.text(`${t("report.company")}: ${company}`, 14, 32);
    doc.text(`${t("report.line")}: ${line}`, 14, 38);
    doc.text(`${t("report.date")}: ${date}`, 14, 44);
    doc.text(`${t("report.creator")}: ${creator}`, 14, 50);

    let yOffset = 65;

    if (includeCheckSheet) {
      doc.setFontSize(12);
      doc.text("Section 1: Check Sheet", 14, yOffset);
      yOffset += 6;

      autoTable(doc, {
        startY: yOffset,
        head: [["Category", "Count", "%"]],
        body: [["Example1", "12", "20%"], ["Example2", "48", "80%"]],
      });

      yOffset = (doc as any).lastAutoTable.finalY + 14;
    }

    if (includePareto) {
      doc.setFontSize(12);
      doc.text("Section 2: Pareto Chart", 14, yOffset);
      yOffset += 6;

      doc.text("<< Pareto Chart Screenshot Placeholder >>", 14, yOffset);
      yOffset += 12;
    }

    if (includeHistogram) {
      doc.setFontSize(12);
      doc.text("Section 3: Histogram", 14, yOffset);
      yOffset += 6;

      doc.text("<< Histogram Screenshot Placeholder >>", 14, yOffset);
      yOffset += 12;
    }

    doc.save("QC-Report.pdf");
  };

  return (
    <div className="w-full">

      <h1 className="text-3xl font-bold mb-6 text-text">
        {t("report.title")}
      </h1>

      {/* TOOL INCLUDE */}
      <div className="qc-card mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          {t("report.select")}
        </h2>

        <label className="flex items-center gap-3 text-text">
          <input
            type="checkbox"
            checked={includeCheckSheet}
            onChange={() => setIncludeCheckSheet(!includeCheckSheet)}
          />
          Check Sheet
        </label>

        <label className="flex items-center gap-3 text-text">
          <input
            type="checkbox"
            checked={includePareto}
            onChange={() => setIncludePareto(!includePareto)}
          />
          Pareto
        </label>

        <label className="flex items-center gap-3 text-text">
          <input
            type="checkbox"
            checked={includeHistogram}
            onChange={() => setIncludeHistogram(!includeHistogram)}
          />
          Histogram
        </label>
      </div>

      {/* METADATA */}
      <div className="qc-card mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          {t("report.meta")}
        </h2>

        <div className="flex flex-col gap-3">

          <input
            type="text"
            placeholder={t("report.project")}
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="border border-border bg-card p-2 rounded text-text"
          />

          <input
            type="text"
            placeholder={t("report.company")}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="border border-border bg-card p-2 rounded text-text"
          />

          <input
            type="text"
            placeholder={t("report.line")}
            value={line}
            onChange={(e) => setLine(e.target.value)}
            className="border border-border bg-card p-2 rounded text-text"
          />

          <input
            type="text"
            placeholder={t("report.date")}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-border bg-card p-2 rounded text-text"
          />

          <input
            type="text"
            placeholder={t("report.creator")}
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            className="border border-border bg-card p-2 rounded text-text"
          />

        </div>
      </div>

      {/* GENERATE */}
      <div className="mb-6">
        <button className="qc-btn text-lg px-6 py-3" onClick={generatePDF}>
          {t("report.generate")}
        </button>
      </div>
    </div>
  );
};

export default CombinedReportPage;
