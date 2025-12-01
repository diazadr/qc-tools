import { useState } from "react";
import { useChecksheetStore } from "../store/useChecksheetStore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CombinedReportPage = () => {

  const store = useChecksheetStore();

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

    doc.text("QC GLOBAL REPORT", 14, 14);
    doc.setFontSize(10);
    doc.text(`PROJECT : ${project}`, 14, 24);
    doc.text(`COMPANY : ${company}`, 14, 30);
    doc.text(`LINE    : ${line}`, 14, 36);
    doc.text(`DATE    : ${date}`, 14, 42);
    doc.text(`CREATOR : ${creator}`, 14, 48);

    let cursor = 60;

    if (includeCheckSheet) {
      const s1 = store.getSnapshot("defective-item");
      const s2 = store.getSnapshot("production-distribution");
      const s3 = store.getSnapshot("defect-location");
      const s4 = store.getSnapshot("defect-cause");

      doc.setFontSize(12);
      doc.text("SECTION 1 — CHECK SHEET", 14, cursor);
      cursor += 8;

      if (s1 && s1.data) {
        autoTable(doc, {
          startY: cursor,
          head: [["Defect", "Total"]],
          body: s1.data.categories.map((c: any) => [
            c.name,
            Object.values(c.counts).reduce((a: any, b: any) => a + b, 0)
          ])
        });
        cursor = (doc as any).lastAutoTable.finalY + 14;
      }

      if (s2 && s2.data) {
        autoTable(doc, {
          startY: cursor,
          head: [["Deviation", "Count"]],
          body: s2.data.rows.map((r: any) => [
            r.deviation,
            r.count
          ])
        });
        cursor = (doc as any).lastAutoTable.finalY + 14;
      }

      if (s3 && s3.data) {
        autoTable(doc, {
          startY: cursor,
          head: [["Location", "Count"]],
          body: s3.data.marks.map((m: any) => [
            `${m.circ}-${m.rad}`,
            m.count
          ])
        });
        cursor = (doc as any).lastAutoTable.finalY + 14;
      }

      if (s4 && s4.data) {
        autoTable(doc, {
          startY: cursor,
          head: [["Cause", "Count"]],
          body: (() => {
            const map: Record<string, number> = {};
            s4.data.data.forEach((e: any) => {
              map[e.type] = (map[e.type] || 0) + 1;
            });
            return Object.entries(map).map(([k, v]) => [k, v]);
          })()
        });
        cursor = (doc as any).lastAutoTable.finalY + 14;
      }
    }

    if (includePareto) {
      doc.setFontSize(12);
      doc.text("SECTION 2 — PARETO SUMMARY", 14, cursor);
      cursor += 8;

      const s = store.getSnapshot("defective-item");

      if (s && s.data) {
        autoTable(doc, {
          startY: cursor,
          head: [["Defect", "Total", "%"]],
          body: (() => {
            const total = s.data.categories.reduce((sum: any, c: any) =>
              sum + Object.values(c.counts).reduce((a: any, b: any) => a + b, 0)
              , 0);

            return s.data.categories.map((c: any) => {
              const v = (Object.values(c.counts) as number[])
                .reduce((a, b) => a + b, 0);

              return [
                c.name,
                v,
                total > 0 ? ((v / total) * 100).toFixed(1) + "%" : "0%"
              ];
            });
          })()
        });
        cursor = (doc as any).lastAutoTable.finalY + 14;
      }
    }

    if (includeHistogram) {
      doc.setFontSize(12);
      doc.text("SECTION 3 — HISTOGRAM DATA", 14, cursor);
      cursor += 8;

      const s = store.getSnapshot("production-distribution");

      if (s && s.data) {
        autoTable(doc, {
          startY: cursor,
          head: [["Deviation", "Count"]],
          body: s.data.rows.map((r: any) => [r.deviation, r.count])
        });
      }
    }

    doc.save("QC_GLOBAL_REPORT.pdf");
  };

  return (
    <div className="w-full">

      <h1 className="text-3xl font-bold mb-6 text-text">
        Combined QC Report
      </h1>

      <div className="qc-card mb-6">
        <label className="flex items-center gap-3 text-text">
          <input type="checkbox" checked={includeCheckSheet} onChange={() => setIncludeCheckSheet(!includeCheckSheet)} />
          Include Check Sheet
        </label>

        <label className="flex items-center gap-3 text-text">
          <input type="checkbox" checked={includePareto} onChange={() => setIncludePareto(!includePareto)} />
          Include Pareto
        </label>

        <label className="flex items-center gap-3 text-text">
          <input type="checkbox" checked={includeHistogram} onChange={() => setIncludeHistogram(!includeHistogram)} />
          Include Histogram
        </label>
      </div>

      <div className="qc-card mb-6">
        <input className="border bg-card p-2 rounded text-text" placeholder="Project" value={project} onChange={(e) => setProject(e.target.value)} />
        <input className="border bg-card p-2 rounded text-text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
        <input className="border bg-card p-2 rounded text-text" placeholder="Line" value={line} onChange={(e) => setLine(e.target.value)} />
        <input className="border bg-card p-2 rounded text-text" placeholder="Date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="border bg-card p-2 rounded text-text" placeholder="Creator" value={creator} onChange={(e) => setCreator(e.target.value)} />
      </div>

      <button className="qc-btn text-lg px-6 py-3" onClick={generatePDF}>
        Generate PDF
      </button>

    </div>
  );
};

export default CombinedReportPage;
