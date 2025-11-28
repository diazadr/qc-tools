  import { useState, useEffect } from "react";
  import { useTranslation } from "react-i18next";
  import * as XLSX from "xlsx";
  import jsPDF from "jspdf";
  import autoTable from "jspdf-autotable";
  import Papa from "papaparse";

  interface Category {
    id: string;
    name: string;
    count: number;
    operator?: string;
    shift?: string;
    line?: string;
    date?: string;
  }

  // ============================
  //   TALLY STYLE (45° miring)
  // ============================
  // contoh: ||||\ ||||\ ||
  const renderTally = (count: number) => {
    let output = "";
    for (let i = 1; i <= count; i++) {
      if (i % 5 === 0) output += "＼ ";  // 斜 garis miring
      else output += "|";
    }
    return output;
  };

  const CheckSheetPage = () => {
    const { t } = useTranslation();

    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [operator, setOperator] = useState("");
    const [shift, setShift] = useState("");
    const [line, setLine] = useState("");
    const [sortMode, setSortMode] = useState("original");

    // ==========================
    // AUTOSAVE
    // ==========================
    useEffect(() => {
      localStorage.setItem("checksheet_data", JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
      const saved = localStorage.getItem("checksheet_data");
      if (saved) setCategories(JSON.parse(saved));
    }, []);

    // ==========================
    // FUNCTIONS
    // ==========================

    const addCategory = () => {
      if (!newCategory.trim()) return;
      setCategories([
        ...categories,
        {
          id: crypto.randomUUID(),
          name: newCategory,
          count: 0,
          operator,
          shift,
          line,
          date: new Date().toLocaleString(),
        },
      ]);
      setNewCategory("");
    };

    const incrementCount = (index: number) => {
      const updated = [...categories];
      updated[index].count++;
      setCategories(updated);
    };

    const decrementCount = (index: number) => {
      const updated = [...categories];
      if (updated[index].count > 0) updated[index].count--;
      setCategories(updated);
    };

    const editCategoryName = (index: number, newName: string) => {
      const updated = [...categories];
      updated[index].name = newName;
      setCategories(updated);
    };

    const editCategoryCount = (index: number, newValue: number) => {
      if (newValue < 0) return;
      const updated = [...categories];
      updated[index].count = newValue;
      setCategories(updated);
    };

    const resetCount = (index: number) => {
      const updated = [...categories];
      updated[index].count = 0;
      setCategories(updated);
    };

    const clearAll = () => {
      if (confirm("Hapus semua data?")) setCategories([]);
    };

    const removeCategory = (index: number) => {
      const updated = categories.filter((_, i) => i !== index);
      setCategories(updated);
    };

    const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

    // ==========================
    // SORTING
    // ==========================
    const sortedCats = [...categories];
    if (sortMode === "az") sortedCats.sort((a, b) => a.name.localeCompare(b.name));
    if (sortMode === "count") sortedCats.sort((a, b) => b.count - a.count);

    // ==========================
    // EXPORT FUNCTIONS
    // ==========================
    const exportExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(categories.map(cat => ({
        Category: cat.name,
        Tally: renderTally(cat.count),
        Count: cat.count,
        Percent: totalCount === 0 ? "0%" : ((cat.count / totalCount) * 100).toFixed(1) + "%",
        Operator: cat.operator,
        Shift: cat.shift,
        Line: cat.line,
        Date: cat.date,
      })));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "CheckSheet");
      XLSX.writeFile(workbook, "checksheet.xlsx");
    };

    const exportCSV = () => {
      const csvData = Papa.unparse(
        categories.map(cat => ({
          Category: cat.name,
          Tally: renderTally(cat.count),
          Count: cat.count,
          Percent: totalCount === 0 ? "0%" : ((cat.count / totalCount) * 100).toFixed(1) + "%",
          Operator: cat.operator,
          Shift: cat.shift,
          Line: cat.line,
          Date: cat.date,
        }))
      );
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "checksheet.csv";
      link.click();
    };

    const exportPDF = () => {
      const doc = new jsPDF();
      doc.text("QC TOOLS - Check Sheet", 14, 16);
      autoTable(doc, {
        startY: 24,
        head: [["Kategori", "Tally", "Jumlah", "%", "Operator", "Shift", "Line", "Tanggal"]],
       body: categories.map(cat => [
  cat.name || "",
  renderTally(cat.count) || "",
  cat.count || 0,
  totalCount === 0 ? "0%" : ((cat.count / totalCount) * 100).toFixed(1) + "%",
  cat.operator || "",
  cat.shift || "",
  cat.line || "",
  cat.date || "",
]) as (string | number)[][],

      });
      doc.save("checksheet.pdf");
    };

    // ==========================
    // RENDER
    // ==========================
    return (
      <div className="w-full">

        <h1 className="text-3xl font-bold text-text mb-6">
          Check Sheet
        </h1>

        {/* ======================================================
            INFO INPUT
        ====================================================== */}
        <div className="qc-card mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Informasi Input</h2>
          <div className="flex gap-3 flex-wrap">
            <input type="text" placeholder="Operator" value={operator} onChange={(e) => setOperator(e.target.value)} className="border border-border px-3 py-2 rounded w-full md:w-48" />
            <input type="text" placeholder="Shift" value={shift} onChange={(e) => setShift(e.target.value)} className="border border-border px-3 py-2 rounded w-full md:w-48" />
            <input type="text" placeholder="Line / Machine" value={line} onChange={(e) => setLine(e.target.value)} className="border border-border px-3 py-2 rounded w-full md:w-48" />
          </div>
        </div>

        {/* INPUT + TAMBAH */}
        <div className="qc-card mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Masukkan kategori defect…"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              className="border border-border bg-card px-3 py-2 rounded w-full"
            />
            <button className="qc-btn px-4 py-2" onClick={addCategory}>Tambah</button>
          </div>
        </div>

        {/* SORT BUTTONS */}
        <div className="mb-4 flex gap-2">
          <button className={`qc-btn px-4 py-2 ${sortMode === "original" ? "bg-primary-hover" : ""}`} onClick={() => setSortMode("original")}>Default</button>
          <button className={`qc-btn px-4 py-2 ${sortMode === "az" ? "bg-primary-hover" : ""}`} onClick={() => setSortMode("az")}>A–Z</button>
          <button className={`qc-btn px-4 py-2 ${sortMode === "count" ? "bg-primary-hover" : ""}`} onClick={() => setSortMode("count")}>Berdasarkan jumlah</button>
        </div>

        {/* ======================================================
            TABLE
        ====================================================== */}
        <div className="qc-card mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Hasil Check Sheet</h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-secondary">
                <th className="py-2 text-left">{t("checksheet.col_category")}</th>
                <th className="py-2 text-center">Tally</th>
                <th className="py-2 text-center">Count</th>
                <th className="py-2 text-center">%</th>
                <th className="py-2 text-center">+ / −</th>
                <th className="py-2 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {sortedCats.map((cat, index) => (
                <tr key={cat.id} className="border-b border-border">

                  <td className="py-2">
                    <input value={cat.name} onChange={(e) => editCategoryName(index, e.target.value)} className="bg-transparent w-full" />
                  </td>

                  <td className="py-2 text-center font-mono whitespace-nowrap">
                    {renderTally(cat.count)}
                  </td>

                  <td className="py-2 text-center">
                    {cat.count}
                  </td>

                  <td className="py-2 text-center text-secondary">
                    {totalCount === 0 ? "0%" : ((cat.count / totalCount) * 100).toFixed(1) + "%"}
                  </td>

                  <td className="py-2 text-center">
                    <button className="px-2 py-1 qc-btn" onClick={() => decrementCount(index)}>−1</button>
                    <button className="px-2 py-1 qc-btn ml-1" onClick={() => incrementCount(index)}>+1</button>
                  </td>

                  <td className="py-2 text-center">
                    <button className="text-error font-bold" onClick={() => removeCategory(index)}>Delete</button>
                    <button className="ml-3 text-secondary" onClick={() => resetCount(index)}>Reset</button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BOTTOM TOTAL */}
        <div className="text-secondary mb-6">
          Total data: <span className="text-text font-semibold">{totalCount}</span>
        </div>

        {/* EXPORT */}
        <div className="flex flex-wrap gap-3">
          <button className="qc-btn px-4 py-2" onClick={exportPDF}>Export PDF</button>
          <button className="qc-btn px-4 py-2" onClick={exportExcel}>Export Excel</button>
          <button className="qc-btn px-4 py-2" onClick={exportCSV}>Export CSV</button>
          <button className="text-error font-bold ml-2" onClick={clearAll}>Hapus semua data</button>
        </div>

      </div>
    );
  };

  export default CheckSheetPage;
