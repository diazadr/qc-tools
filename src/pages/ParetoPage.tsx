import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import type { ParetoChartHandle } from "../components/charts/ParetoChart";
import ParetoChart from "../components/charts/ParetoChart";

interface Row {
  category: string;
  count: number;
  percentage: number;
  cumulativePercentage: number;
  operator?: string;
  shift?: string;
  line?: string;
  date?: string;
}

const ParetoPage = () => {
  const { t } = useTranslation();
  const chartRef = useRef<ParetoChartHandle | null>(null);

  // ===================== STATE =========================
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState("");
  const [count, setCount] = useState("");

  const [operator, setOperator] = useState("");
  const [shift, setShift] = useState("");
  const [line, setLine] = useState("");

  const [normalize, setNormalize] = useState(false);

  // Autosave
  useEffect(() => {
    localStorage.setItem("pareto_data", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const saved = localStorage.getItem("pareto_data");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  // ===================== DATA COMPUTATION =========================
  const totalCount = items.reduce((sum, it) => sum + it.count, 0);

  let sorted = [...items].sort((a, b) => b.count - a.count);

  let smallGroups = sorted.filter(item => (item.count / totalCount) * 100 < 3);
  let bigGroups = sorted.filter(item => (item.count / totalCount) * 100 >= 3);

  if (smallGroups.length > 0) {
    const sumSmall = smallGroups.reduce((sum, i) => sum + i.count, 0);
    bigGroups.push({
      category: "Others (<3%)",
      count: sumSmall,
      date: new Date().toLocaleString()
    });
  }

  sorted = bigGroups;

  let cumulative = 0;
  const tableRows: Row[] = sorted.map((it) => {
    cumulative += it.count;
    let percentage = totalCount === 0 ? 0 : (it.count / totalCount) * 100;
    let cumulativePercentage =
      totalCount === 0 ? 0 : (cumulative / totalCount) * 100;

    if (normalize) {
      percentage = Number(((it.count / totalCount) * 1000).toFixed(1));
    }

    return {
      ...it,
      percentage: Number(percentage.toFixed(1)),
      cumulativePercentage: Number(cumulativePercentage.toFixed(1)),
    };
  });

  // ===================== INTERPRETASI =========================
  const getCriticalCategories = () => {
    return tableRows
      .filter(r => r.cumulativePercentage <= 80)
      .map(r => r.category);
  };
  const summary = getCriticalCategories().join(", ");

  // ===================== CRUD =========================
  const addItem = () => {
    if (!category.trim()) return;
    const num = Number(count);
    if (isNaN(num) || num < 0) return;

    setItems([
      ...items,
      {
        category,
        count: num,
        operator,
        shift,
        line,
        date: new Date().toLocaleString(),
      },
    ]);

    setCategory("");
    setCount("");
  };

  const increment = (index: number) => {
    const updated = [...items];
    updated[index].count++;
    setItems(updated);
  };

  const decrement = (index: number) => {
    const updated = [...items];
    if (updated[index].count > 0) updated[index].count--;
    setItems(updated);
  };

  const reset = (index: number) => {
    const updated = [...items];
    updated[index].count = 0;
    setItems(updated);
  };

  const clearAll = () => {
    if (confirm("Hapus semua data?")) setItems([]);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  // =====================================================
  // EXPORT FUNCTIONS — semua tetap ADA
  // =====================================================

  const exportCSV = () => {
    const csvData = Papa.unparse(
      tableRows.map((r) => ({
        Category: r.category,
        Count: r.count,
        Percent: r.percentage + (normalize ? "" : "%"),
        CumPercent: r.cumulativePercentage + "%",
        Operator: r.operator,
        Shift: r.shift,
        Line: r.line,
        Date: r.date,
      }))
    );

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pareto.csv";
    a.click();
  };

  const exportExcel = () => {
    const dataToExport = tableRows.map((r) => ({
      Category: r.category,
      Count: r.count,
      Percentage: r.percentage + (normalize ? "" : "%"),
      CumulativePercentage: r.cumulativePercentage + "%",
      Operator: r.operator,
      Shift: r.shift,
      Line: r.line,
      Date: r.date,
    }));

    const sheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Pareto");
    XLSX.writeFile(wb, "pareto.xlsx");
  };

  const exportChartImage = () => {
    if (!chartRef.current) return;
    const png = chartRef.current.getImageDataUrl();
    if (!png) return;

    const a = document.createElement("a");
    a.href = png;
    a.download = "pareto-chart.png";
    a.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("QC — Pareto Report", 14, 14);

    autoTable(doc, {
      startY: 20,
      head: [["Kategori", "Jumlah", "%", "Kumulatif%", "Operator", "Shift", "Line", "Tanggal"]],
 body: tableRows.map(r => [
  r.category || "",
  r.count || 0,
  r.percentage + (normalize ? "" : "%") || "",
  r.cumulativePercentage + "%" || "",
  r.operator || "",
  r.shift || "",
  r.line || "",
  r.date || "",
]),


    });

    doc.text("Kesimpulan:", 12, doc.lastAutoTable.finalY + 10);
    doc.text(`Kategori utama penyebab defect (>80%):`, 12, doc.lastAutoTable.finalY + 18);
    doc.text(summary || "-", 12, doc.lastAutoTable.finalY + 26);

    doc.save("pareto.pdf");
  };

  // ===================== UI =========================
  return (
    <div className="w-full">

      <h1 className="text-3xl font-bold text-text mb-6">
        Pareto Chart
      </h1>

      {/* Normalisasi */}
      <div className="flex items-center mb-4 gap-2">
        <input type="checkbox" checked={normalize} onChange={() => setNormalize(!normalize)} />
        <label className="text-sm text-text">Normalisasi per 1000 unit produksi</label>
      </div>

      {/* Interpretasi */}
      <div className="qc-card mb-6 p-4">
        <p className="text-secondary text-sm">Kategori dominan (≤80%):</p>
        <p className="text-text font-semibold">{summary || "Belum ada data"}</p>
      </div>

      {/* INPUT INFO */}
      <div className="qc-card mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">Informasi Input</h2>
        <div className="flex gap-3 flex-wrap">
          <input type="text" placeholder="Operator" value={operator} onChange={(e) => setOperator(e.target.value)} className="border border-border px-3 py-2 rounded w-full md:w-48" />
          <input type="text" placeholder="Shift" value={shift} onChange={(e) => setShift(e.target.value)} className="border border-border px-3 py-2 rounded w-full md:w-48" />
          <input type="text" placeholder="Line / Machine" value={line} onChange={(e) => setLine(e.target.value)} className="border border-border px-3 py-2 rounded w-full md:w-48" />
        </div>
      </div>

      {/* INPUT BAR */}
      <div className="qc-card mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nama Kategori"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-border bg-card px-3 py-2 rounded w-full"
          />
          <input
            type="number"
            placeholder="Jumlah"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="border border-border bg-card px-3 py-2 rounded w-32"
          />
          <button className="qc-btn px-4 py-2" onClick={addItem}>
            Tambah
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="qc-card mb-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-text mb-4">Data Pareto</h2>

        <table className="text-sm w-full border-collapse">
          <thead>
            <tr className="border-border border-b text-secondary">
              <th className="text-left py-2">Kategori</th>
              <th className="text-center">Jumlah</th>
              <th className="text-center">%</th>
              <th className="text-center">Cum %</th>
              <th className="text-center">+ / −</th>
              <th className="text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, index) => (
              <tr key={index} className="border-border border-b">

                <td className="py-2">{row.category}</td>

                <td className="py-2 text-center">{row.count}</td>

                <td className="py-2 text-center">{row.percentage}{normalize ? "" : "%"}</td>

                <td className="py-2 text-center">{row.cumulativePercentage}%</td>

                <td className="py-2 text-center">
                  <button className="px-2 py-1 qc-btn" onClick={() => decrement(index)}>−1</button>
                  <button className="px-2 py-1 qc-btn ml-1" onClick={() => increment(index)}>+1</button>
                </td>

                <td className="py-2 text-center">
                  <button className="text-error font-bold" onClick={() => removeItem(index)}>Delete</button>
                  <button className="ml-3 text-secondary" onClick={() => reset(index)}>Reset</button>
                </td>

              </tr>
            ))}

            {tableRows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-secondary">
                  Belum ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CHART */}
      <div className="qc-card mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">Pareto Chart – Defect Category / Grafik Pareto – Kategori Defect
</h2>
        <ParetoChart
          ref={chartRef}
          data={sorted}
          show80Line={true}
          yLeftLabel="Count"
          yRightLabel="Cumulative %"
        />
      </div>

      {/* EXPORT */}
      <div className="qc-card mb-10">
        <h2 className="text-lg font-semibold text-text mb-4">Export</h2>

        <div className="flex flex-wrap gap-3">
          <button className="qc-btn px-4 py-2" onClick={exportPDF}>Export PDF</button>
          <button className="qc-btn px-4 py-2" onClick={exportExcel}>Export Excel</button>
          <button className="qc-btn px-4 py-2" onClick={exportCSV}>Export CSV</button>
          <button className="qc-btn px-4 py-2" onClick={exportChartImage}>Export Grafik</button>
          <button className="text-error font-bold ml-2" onClick={clearAll}>Hapus semua data</button>
        </div>
      </div>

    </div>
  );
};

export default ParetoPage;
