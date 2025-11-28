import { useState } from "react";
import { useTranslation } from "react-i18next";
import HistogramChart from "../components/charts/HistogramChart";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

const HistogramPage = () => {
  const { t } = useTranslation();

  const [inputData, setInputData] = useState("");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [bins, setBins] = useState(8);

  const [operator, setOperator] = useState("");
  const [shift, setShift] = useState("");
  const [line, setLine] = useState("");

  const parseData = () => {
    const values = inputData
      .split(/[\s,;]+/)
      .map((v) => parseFloat(v))
      .filter((v) => !isNaN(v));
    setNumbers(values);
  };

  // ======================================
  // ISO STATISTICS
  // ======================================

  const mean =
    numbers.length > 0
      ? numbers.reduce((a, b) => a + b, 0) / numbers.length
      : 0;

  const sorted = [...numbers].sort((a, b) => a - b);

  const median =
    sorted.length % 2 === 1
      ? sorted[Math.floor(sorted.length / 2)]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;

const mode = (() => {
  const freq: Record<number, number> = {};
  numbers.forEach((n) => {
    freq[n] = (freq[n] || 0) + 1;
  });

  return Number(
    Object.keys(freq)
      .map(Number)
      .reduce((a, b) => (freq[a] > freq[b] ? a : b), 0)
  );
})();


  const range = numbers.length > 0 ? sorted[sorted.length - 1] - sorted[0] : 0;

  const variance =
    numbers.length > 1
      ? numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (numbers.length - 1)
      : 0;

  const stddev = Math.sqrt(variance);

  // ======================================
  // DETECT DISTRIBUTION (ISO)
  // ======================================
  const distributionType = (() => {
    if (stddev === 0) return "Uniform / Single Value";

    const skewness =
      (3 * (mean - median)) / stddev;

    if (skewness > 0.5) return "Positively Skewed (miring kanan)";
    if (skewness < -0.5) return "Negatively Skewed (miring kiri)";
    return "Normal / Symmetrical";
  })();

  // ======================================
  // EXPORT
  // ======================================

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      numbers.map((val) => ({ Value: val }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HistogramData");
    XLSX.writeFile(wb, "histogram.xlsx");
  };

  const exportCSV = () => {
    const data = Papa.unparse(numbers.map((val) => ({ Value: val })));
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "histogram.csv";
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("QC TOOL - HISTOGRAM", 14, 16);

    doc.text(`Operator: ${operator}`, 14, 25);
    doc.text(`Shift: ${shift}`, 14, 32);
    doc.text(`Line: ${line}`, 14, 39);

    autoTable(doc, {
      startY: 50,
      head: [["Statistic", "Value"]],
      body: [
        ["Mean", mean.toFixed(4)],
        ["Median", String(median)],
        ["Mode", String(mode)],
        ["Range", String(range)],
        ["Std Deviation", stddev.toFixed(4)],
        ["Variance", variance.toFixed(4)],
        ["Distribution", distributionType],
      ],
    });

    doc.save("histogram.pdf");
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-text mb-6">Histogram</h1>

      {/* ======================================= 
            INPUT INFO (ISO)
      ======================================= */}
      <div className="qc-card mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          Informasi Proses
        </h2>

        <div className="flex gap-3 flex-wrap">
          <input type="text" placeholder="Operator" value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="border border-border px-3 py-2 rounded w-full md:w-40" />

          <input type="text" placeholder="Shift" value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="border border-border px-3 py-2 rounded w-full md:w-40" />

          <input type="text" placeholder="Line / Machine" value={line}
            onChange={(e) => setLine(e.target.value)}
            className="border border-border px-3 py-2 rounded w-full md:w-40" />
        </div>
      </div>

      {/* ======================================= 
            DATA INPUT
      ======================================= */}
      <div className="qc-card mb-6">
        <h2 className="text-lg font-semibold text-text mb-2">
          Input Data
        </h2>

        <textarea
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder="Masukkan data numerik dipisah spasi / koma..."
          className="border border-border bg-card p-3 rounded w-full h-32 text-text"
        />

        <div className="mt-4">
          <button className="qc-btn px-5 py-2" onClick={parseData}>
            Proses Data
          </button>
        </div>
      </div>

      {/* ======================================= 
            BINS SETTING
      ======================================= */}
      <div className="qc-card mb-6">
        <h2 className="text-lg font-semibold text-text mb-3">
          Pengaturan Histogram
        </h2>

        <div className="flex items-center gap-3">
          <span className="text-text font-medium">Bins:</span>

          <input
            type="number"
            value={bins}
            min={2}
            max={50}
            onChange={(e) => setBins(Number(e.target.value))}
            className="border border-border bg-card text-text px-3 py-2 rounded w-24"
          />
        </div>

        <div className="mt-4">
          <HistogramChart data={numbers} bins={bins} />
        </div>
      </div>

      {/* ======================================= 
            STATISTICS ISO
      ======================================= */}
      {numbers.length > 0 && (
        <div className="qc-card mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">
            Statistik (ISO 7QC)
          </h2>

          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b border-border text-text"><td className="py-2">Mean</td><td>{mean.toFixed(4)}</td></tr>
              <tr className="border-b border-border text-text"><td className="py-2">Median</td><td>{median}</td></tr>
              <tr className="border-b border-border text-text"><td className="py-2">Mode</td><td>{mode}</td></tr>
              <tr className="border-b border-border text-text"><td className="py-2">Range</td><td>{range}</td></tr>
              <tr className="border-b border-border text-text"><td className="py-2">Std Dev</td><td>{stddev.toFixed(4)}</td></tr>
              <tr className="border-b border-border text-text"><td className="py-2">Variance</td><td>{variance.toFixed(4)}</td></tr>
              <tr className="border-b border-border text-text"><td className="py-2">Distribusi</td><td>{distributionType}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================= 
            EXPORT
      ======================================= */}
      {numbers.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-12">
          <button className="qc-btn px-4 py-2" onClick={exportPDF}>Export PDF</button>
          <button className="qc-btn px-4 py-2" onClick={exportExcel}>Export Excel</button>
          <button className="qc-btn px-4 py-2" onClick={exportCSV}>Export CSV</button>
        </div>
      )}
    </div>
  );
};

export default HistogramPage;
