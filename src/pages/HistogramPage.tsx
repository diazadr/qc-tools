import { useState, useMemo } from "react";
import HistogramChart from "../components/charts/HistogramChart";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { useChecksheetStore } from "../store/useChecksheetStore";

const HistogramPage = () => {
  const store = useChecksheetStore();

  const numbers = useMemo(() => {
    const snap1 = store.getSnapshot("production-distribution");
    const snap2 = store.getSnapshot("defective-item");
    const snap3 = store.getSnapshot("defect-location");
    const snap4 = store.getSnapshot("defect-cause");

    if (snap1?.data?.rows) {
      const arr: number[] = [];
      snap1.data.rows.forEach((r: { count: number; deviation: number }) => {
        for (let i = 0; i < r.count; i++) {
          arr.push(
            Number(snap1.data.target) +
              Number(r.deviation) * Number(snap1.data.binSize)
          );
        }
      });
      return arr;
    }

    if (snap2?.data?.categories) {
      const arr: number[] = [];
      snap2.data.categories.forEach((cat: { counts: Record<string, number> }) => {
        Object.values(cat.counts).forEach((v: number) => {
          arr.push(v);
        });
      });
      return arr;
    }

    if (snap3?.data?.marks) {
      return snap3.data.marks.map((m: { count: number }) => m.count);
    }

    if (snap4?.data?.dataset) {
      return snap4.data.dataset.map((_: unknown, i: number) => i);
    }

    return [];
  }, [
    store.snapshots["production-distribution"],
    store.snapshots["defective-item"],
    store.snapshots["defect-location"],
    store.snapshots["defect-cause"],
  ]);

  const [operator, setOperator] = useState("");
  const [shift, setShift] = useState("");
  const [line, setLine] = useState("");
  const [bins, setBins] = useState(8);
  const [inputData, setInputData] = useState("");
  const [numbersManual, setNumbersManual] = useState<number[] | null>(null);

  const manualParse = () => {
    const values = inputData
      .split(/[\s,;]+/)
      .map((v: string) => parseFloat(v))
      .filter((v: number) => !isNaN(v));
    if (values.length > 0) setNumbersManual(values);
  };

  const data = numbersManual ?? numbers;

  const mean =
    data.length > 0 ? data.reduce((a: number, b: number) => a + b, 0) / data.length : 0;

  const sorted = [...data].sort((a: number, b: number) => a - b);

  const median =
    sorted.length % 2 === 1
      ? sorted[Math.floor(sorted.length / 2)]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;

  const mode = (() => {
    const freq: Record<number, number> = {};
    data.forEach((n: number) => {
      freq[n] = (freq[n] || 0) + 1;
    });
    const keys = Object.keys(freq).map(Number);
    return keys.reduce((a: number, b: number) => (freq[a] > freq[b] ? a : b), keys[0]);
  })();

  const range = data.length > 0 ? sorted[sorted.length - 1] - sorted[0] : 0;
  const variance =
    data.length > 1
      ? data.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) /
        (data.length - 1)
      : 0;
  const stddev = Math.sqrt(variance);

  const distributionType = (() => {
    if (stddev === 0) return "Uniform / Single Value";
    const skewness = (3 * (mean - median)) / stddev;
    if (skewness > 0.5) return "Positively Skewed (miring kanan)";
    if (skewness < -0.5) return "Negatively Skewed (miring kiri)";
    return "Normal / Symmetrical";
  })();

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.map((val: number) => ({ Value: val })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HistogramData");
    XLSX.writeFile(wb, "histogram.xlsx");
  };

  const exportCSV = () => {
    const csv = Papa.unparse(data.map((val: number) => ({ Value: val })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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
        ["Std Dev", stddev.toFixed(4)],
        ["Variance", variance.toFixed(4)],
        ["Distribution", distributionType],
      ],
    });
    doc.save("histogram.pdf");
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-text mb-6">Histogram</h1>

      <div className="qc-card mb-6">
        <h2 className="text-lg font-semibold mb-4">Informasi Proses</h2>
        <div className="flex gap-3 flex-wrap">
          <input type="text" placeholder="Operator"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="border border-border px-3 py-2 rounded w-full md:w-40" />

          <input type="text" placeholder="Shift"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="border border-border px-3 py-2 rounded w-full md:w-40" />

          <input type="text" placeholder="Line / Machine"
            value={line}
            onChange={(e) => setLine(e.target.value)}
            className="border border-border px-3 py-2 rounded w-full md:w-40" />
        </div>
      </div>

      <div className="qc-card mb-6">
        <h2 className="text-lg font-semibold mb-2">Input Data Manual</h2>

        <textarea
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder="Masukkan data numerik..."
          className="border border-border bg-card p-3 rounded w-full h-32"
        />

        <div className="mt-4">
          <button className="qc-btn px-5 py-2" onClick={manualParse}>
            Gunakan Data Manual
          </button>
        </div>
      </div>

      <div className="qc-card mb-6">
        <h2 className="text-lg font-semibold mb-3">Pengaturan Histogram</h2>

        <div className="flex items-center gap-3">
          <span className="font-medium">Bins:</span>

          <input
            type="number"
            value={bins}
            min={2}
            max={50}
            onChange={(e) => setBins(Number(e.target.value))}
            className="border border-border bg-card px-3 py-2 rounded w-24"
          />
        </div>

        <div className="mt-4">
          <HistogramChart data={data} bins={bins} />
        </div>
      </div>

      {data.length > 0 && (
        <div className="qc-card mb-6">
          <h2 className="text-lg font-semibold mb-4">Statistik</h2>

          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr><td className="py-2">Mean</td><td>{mean.toFixed(4)}</td></tr>
              <tr><td className="py-2">Median</td><td>{median}</td></tr>
              <tr><td className="py-2">Mode</td><td>{mode}</td></tr>
              <tr><td className="py-2">Range</td><td>{range}</td></tr>
              <tr><td className="py-2">Std Dev</td><td>{stddev.toFixed(4)}</td></tr>
              <tr><td className="py-2">Variance</td><td>{variance.toFixed(4)}</td></tr>
              <tr><td className="py-2">Distribusi</td><td>{distributionType}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {data.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-10">
          <button className="qc-btn px-4 py-2" onClick={exportPDF}>Export PDF</button>
          <button className="qc-btn px-4 py-2" onClick={exportExcel}>Export Excel</button>
          <button className="qc-btn px-4 py-2" onClick={exportCSV}>Export CSV</button>
        </div>
      )}
    </div>
  );
};

export default HistogramPage;
