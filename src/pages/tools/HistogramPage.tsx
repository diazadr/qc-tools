import { useState, useRef } from "react"
import {
  HiChevronDown,
  HiDocumentArrowUp,
  HiDocumentArrowDown,
  HiDocumentText,
  HiDocumentDuplicate,
  HiDocumentCheck,
  HiShare
} from "react-icons/hi2"
import HistogramChart from "../../components/charts/HistogramChart"
import { useHistogramLogic } from "./HistogramLogic"
import ToolsQuickNav from "../../components/common/ToolsQuickNav"

const HistogramPage = () => {
  const l = useHistogramLogic()
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const importRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  return (
    <div className="text-[14px] space-y-4 select-none">
      <ToolsQuickNav />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-3 py-2 border border-border rounded bg-card shadow-sm">
        <div className="font-semibold">Histogram</div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(l.getShareLink())}
            className="h-[32px] px-3 flex items-center gap-2 bg-primary text-white rounded border hover:bg-primary/80 cursor-pointer"
          >
            <HiShare className="w-4 h-4" />
            <span>Share Link</span>
          </button>

          <div className="relative" ref={importRef}>
            <button
              onClick={() => setShowImport(v => !v)}
              className="h-[32px] px-3 flex items-center gap-2 bg-muted text-foreground rounded border hover:border-primary cursor-pointer"
            >
              <HiDocumentArrowUp className="w-4 h-4" />
              <span>Import</span>
              <HiChevronDown className={`w-4 h-4 transition-transform ${showImport ? "rotate-180" : ""}`} />
            </button>

            {showImport && (
              <div className="absolute right-0 mt-1 w-[200px] bg-card border border-border rounded shadow text-sm z-50">
                <label htmlFor="importCSV" className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20">
                  <HiDocumentDuplicate className="w-4 h-4" />
                  CSV (.csv)
                </label>
                <input
                  id="importCSV"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    l.importFromCSV(file)
                    setShowImport(false)
                  }}
                />

                <label htmlFor="importExcel" className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20">
                  <HiDocumentCheck className="w-4 h-4" />
                  Excel (.xlsx)
                </label>
                <input
                  id="importExcel"
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    l.importFromExcel(file)
                    setShowImport(false)
                  }}
                />
              </div>
            )}
          </div>

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExport(v => !v)}
              className="h-[32px] px-3 flex items-center gap-2 bg-muted text-foreground rounded border hover:border-primary cursor-pointer"
            >
              <HiDocumentArrowDown className="w-4 h-4" />
              <span>Export</span>
              <HiChevronDown className={`w-4 h-4 transition-transform ${showExport ? "rotate-180" : ""}`} />
            </button>

            {showExport && (
              <div className="absolute right-0 mt-1 w-[220px] bg-card border border-border rounded shadow text-sm z-50">
                <div onClick={() => { l.exportPDF(); setShowExport(false) }} className="px-3 py-2 cursor-pointer hover:bg-primary/20 flex items-center gap-2">
                  <HiDocumentText className="w-4 h-4" /> PDF
                </div>
                <div onClick={() => { l.exportExcel(); setShowExport(false) }} className="px-3 py-2 cursor-pointer hover:bg-primary/20 flex items-center gap-2">
                  <HiDocumentCheck className="w-4 h-4" /> Excel
                </div>
                <div onClick={() => { l.exportCSV(); setShowExport(false) }} className="px-3 py-2 cursor-pointer hover:bg-primary/20 flex items-center gap-2">
                  <HiDocumentDuplicate className="w-4 h-4" /> CSV
                </div>
                <div onClick={() => { l.exportChartImage(); setShowExport(false) }} className="px-3 py-2 cursor-pointer hover:bg-primary/20 flex items-center gap-2">
                  <HiDocumentText className="w-4 h-4" /> Chart Image
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="relative p-3 border border-border rounded bg-card shadow-sm space-y-4">

          <div className="font-medium text-sm">Konfigurasi Histogram</div>

          <div className="space-y-3">
            {/* MODE INPUT */}
            <label className="flex flex-col text-xs mt-1">
              Mode Input
              <select
                value={l.inputMode}
                onChange={e => {
                  const mode = e.target.value as "single" | "grouped"

                  l.setInputMode(mode)

                  if (mode === "grouped") {
                    l.setSelectedSource("manual")
                    l.setCategoryList([])
                    l.setSelectedCategory(null)
                    l.setInputData("")
                  }

                  if (mode === "single") {
                    l.setGroupedData([])
                  }
                }}

                className="h-[36px] bg-bg border border-border rounded px-2 mt-1"
              >
                <option value="single">Data Tunggal</option>
                <option value="grouped">Data Kelompok (Interval + Frekuensi)</option>
              </select>
            </label>

            {/* INPUT DATA KELOMPOK */}
            {l.inputMode === "grouped" && (
              <div className="space-y-2 border border-border rounded p-2 bg-muted/10 mt-2">

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Lower"
                    className="h-[32px] bg-bg border border-border rounded px-2"
                    value={l.gLower}
                    onChange={e => l.setGLower(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Upper"
                    className="h-[32px] bg-bg border border-border rounded px-2"
                    value={l.gUpper}
                    onChange={e => l.setGUpper(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Freq"
                    className="h-[32px] bg-bg border border-border rounded px-2"
                    value={l.gFreq}
                    onChange={e => l.setGFreq(e.target.value)}
                  />
                </div>

                <button
                  onClick={l.addGroupedRow}
                  className="h-[32px] w-full bg-primary text-white rounded border cursor-pointer"
                >
                  Tambahkan Interval
                </button>

                <table className="w-full text-xs border border-border mt-2">
                  <tbody>
                    {l.groupedData.map((g, i) => (
                      <tr key={i}>
                        <td className="border px-2 py-1">{g.lower}</td>
                        <td className="border px-2 py-1">{g.upper}</td>
                        <td className="border px-2 py-1">{g.freq}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            )}

            <div className="flex items-end justify-between">
              <label className="flex flex-col text-xs flex-1">
                Data Source
                <select
                  disabled={l.inputMode === "grouped"}
                  value={l.selectedSource}
                  onChange={e => l.setSelectedSource(e.target.value as any)}
                  className={`h-[36px] bg-bg border border-border rounded px-2 mt-1
    ${l.inputMode === "grouped" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="manual">Manual Input</option>
                  <option value="production-distribution">Production Distribution</option>
                  <option value="defective-item">Defective Item</option>
                  <option value="defect-location">Defect Location</option>
                  <option value="defect-cause">Defect Cause</option>
                </select>
              </label>

              <button
                onClick={() => l.reloadFromSource()}
                className="h-[36px] px-3 ml-3 bg-primary text-white rounded border hover:bg-primary/80 cursor-pointer"
              >
                Reload
              </button>
            </div>

            {/* DROPDOWN KATEGORI MASUK DI SINI */}
            {l.categoryList.length > 0 && (
              <label className="flex flex-col text-xs mt-1">
                Pilih Kategori
                <select
                  disabled={l.inputMode === "grouped"}
                  value={l.selectedCategory ?? ""}
                  onChange={e => l.loadSelectedCategory(e.target.value)}
                  className={`h-[36px] bg-bg border border-border rounded px-2 mt-1
    ${l.inputMode === "grouped" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">-- Pilih kategori --</option>
                  {l.categoryList.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {l.selectedCategory && (
              <label className="flex flex-col text-xs mt-3">
                Measurement
                <textarea
                  value={l.inputData}
                  onChange={e => l.setInputData(e.target.value)}
                  placeholder="Masukkan measurement dipisahkan koma/spasi"
                  className="w-full h-[80px] bg-bg border border-border rounded p-2 mt-1"
                />

                <button
                  onClick={l.parseManualInput}
                  className="h-[32px] px-3 bg-primary text-white rounded border hover:bg-primary/80 cursor-pointer mt-2"
                >
                  Gunakan Measurement
                </button>
              </label>
            )}


      <div className="flex items-end gap-2">
  <label className="flex flex-col text-xs flex-1">
    Bins
    <div className="mt-1">
      <input
        type="number"
        value={l.bins}
        min={1}
        max={20}
        onChange={e => l.setBins(Number(e.target.value))}
        className="h-[36px] w-full bg-bg border border-border rounded px-2"
      />
    </div>
  </label>

  <button
    onClick={() => l.setBins(l.freedmanDiaconisBins(l.data))}
    className="h-[36px] px-3 border rounded bg-muted whitespace-nowrap cursor-pointer hover:border-primary"
  >
    F-D
  </button>

  <button
    onClick={() => l.setBins(l.sturgesBins(l.data.length))}
    className="h-[36px] px-3 border rounded bg-muted whitespace-nowrap cursor-pointer hover:border-primary"
  >
    Sturges
  </button>
</div>


            <label className="flex items-center gap-2 text-xs mt-1">
              <input
                type="checkbox"
                checked={l.showNormalCurve}
                onChange={e => l.setShowNormalCurve(e.target.checked)}
              />
              Show Normal Curve
            </label>
            <label className="flex items-center gap-2 text-xs mt-1">
              <input
                type="checkbox"
                checked={l.showComparisonLine}
                onChange={e => l.setShowComparisonLine(e.target.checked)}
              />
              Show Shape Line
            </label>

            <label className="flex items-center gap-2 text-xs mt-1">
              <input
                type="checkbox"
                checked={l.showMeanLine}
                onChange={e => l.setShowMeanLine(e.target.checked)}
              />
              Show Mean Line
            </label>

          </div>




          <button
            onClick={() => l.clearAll()}
            className="absolute bottom-2 right-3 h-[32px] px-3 bg-error/60 text-white rounded border cursor-pointer hover:border-error"
          >
            Hapus semua data
          </button>

        </div>
        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-4">
          <div className="font-medium text-sm">Capability (Cp / Cpk)</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="LSL"
              value={l.metadata?.lsl ?? ""}
              className="h-[36px] bg-bg border border-border rounded px-2"
              onChange={e =>
                l.setMetadata({
                  ...l.metadata,
                  lsl: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              placeholder="USL"
              value={l.metadata?.usl ?? ""}
              className="h-[36px] bg-bg border border-border rounded px-2"
              onChange={e =>
                l.setMetadata({
                  ...l.metadata,
                  usl: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>Cp: {l.cp ?? "-"}</div>
            <div>Cpk: {l.cpk ?? "-"}</div>
          </div>

          <hr className="border-border" />

          <div className="grid grid-cols-2 gap-2">
          </div>
        </div>

      </div>

      {l.inputMode === "single" && !l.selectedCategory && (
        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
          <div className="font-medium text-sm">Input Data Manual</div>

          <textarea
            value={l.inputData}
            onChange={e => l.setInputData(e.target.value)}
            placeholder="Masukkan angka dipisahkan koma atau spasi"
            className="w-full h-[100px] bg-bg border border-border rounded p-2"
          />

          <button
            onClick={l.parseManualInput}
            className="h-[36px] px-3 bg-primary text-white rounded border hover:bg-primary/80 cursor-pointer"
          >
            Gunakan Data
          </button>
        </div>
      )}


      <div className="qc-card mb-6 overflow-x-auto p-3">
        <h2 className="text-lg font-semibold mb-4">Data Histogram</h2>
        <table className="w-full min-w-[500px] text-sm border border-border border-collapse">
          <thead>
            <tr className="bg-muted/30 text-secondary">
              <th className="py-2 px-2 text-center w-[40px]">No</th>
              <th className="px-2 text-left">
                {l.items.length > 0 ? "Category" : "Bin Interval"}
              </th>
              <th className="px-2 text-center w-[80px]">Count</th>
            </tr>
          </thead>

          <tbody>
            {l.tableRows.map((row, i) => (
              <tr key={i} className="hover:bg-primary/5">
                <td className="px-2 py-2 text-center border border-border">{i + 1}</td>
                <td className="px-2 py-2 border border-border">{row.category}</td>
                <td className="px-2 py-2 text-center font-mono border border-border">
                  {row.count}
                </td>
              </tr>
            ))}

            {l.tableRows.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-6 text-center text-secondary border border-border"
                >
                  Belum ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="qc-card mb-6">
        <h2 className="text-lg font-semibold mb-4">Histogram Chart</h2>

        <HistogramChart
          ref={l.chartRef}
          data={l.histogramBase.map(b => ({
            category: b.label,
            count: b.count,
            lower: b.lower,
            upper: b.upper,
            midpoint: b.midpoint
          }))}
          mode="measurement"
          normalCurve={l.normalCurvePoints}
          comparisonLine={l.comparisonLine}
          showComparisonLine={l.showComparisonLine}
          height={350}
          meanValue={l.mean}
          showMean={l.showMeanLine}
        />


      </div>

      {/* Statistik — card terpisah */}
      <div className="p-4 border border-border rounded bg-card shadow-sm space-y-3 text-sm">

        <div className="flex items-center justify-between">
          <div className="font-medium text-sm">Statistik</div>
          <div className="text-xs text-secondary">Updated: {new Date().toLocaleString()}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">

          {/* Mean */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="text-xs text-secondary">Mean</div>
            <div className="mt-1 text-lg font-medium text-foreground">
              {l.mean.toFixed(3)}
            </div>
          </div>

          {/* Median */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="text-xs text-secondary">Median</div>
            <div className="mt-1 text-lg font-medium text-foreground">
              {l.median.toFixed(3)}
            </div>
          </div>

          {/* Mode */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="text-xs text-secondary">Mode</div>
            <div className="mt-1 text-lg font-medium text-foreground">
              {l.modeCountUnique ? "-" : l.mode}
            </div>
          </div>

          {/* Std Dev */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="text-xs text-secondary">Std Dev</div>
            <div className="mt-1 text-lg font-medium text-foreground">
              {l.stddev.toFixed(4)}
            </div>
          </div>

          {/* Variance */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="text-xs text-secondary">Variance</div>
            <div className="mt-1 text-lg font-medium text-foreground">
              {l.variance.toFixed(6)}
            </div>
          </div>

          {/* Grouped Stats (jika frequency table) */}
          {l.items.length > 0 && (
            <>
              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="text-xs text-secondary">Mean (Grouped)</div>
                <div className="mt-1 text-lg font-medium text-foreground">
                  {l.meanGrouped?.toFixed(3)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="text-xs text-secondary">Mode (Grouped)</div>
                <div className="mt-1 text-lg font-medium text-foreground">
                  {l.modeGrouped?.label ?? "-"}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="text-xs text-secondary">Std Dev (Grouped)</div>
                <div className="mt-1 text-lg font-medium text-foreground">
                  {l.stddevGrouped?.toFixed(3)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border">
                <div className="text-xs text-secondary">Variance (Grouped)</div>
                <div className="mt-1 text-lg font-medium text-foreground">
                  {l.varianceGrouped?.toFixed(3)}
                </div>
              </div>
            </>
          )}

        </div>
      </div>



      {/* Keterangan Histogram — card terpisah */}
      <div className="p-4 border border-border rounded bg-card shadow-sm mt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-sm">Keterangan Histogram</div>
          <div className="text-xs text-secondary">Petunjuk & rumus singkat</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm rounded border border-border">
            <thead className="bg-muted/20">
              <tr className="text-left text-secondary">
                <th className="py-2 px-3 w-[200px] font-medium">Item</th>
                <th className="py-2 px-3 font-medium">Deskripsi</th>
                <th className="py-2 px-3 w-[180px] text-center font-medium">
                  Formula / Catatan
                </th>
              </tr>
            </thead>

            <tbody>
              {[
                {
                  k: "Data Numerik",
                  d: "Histogram dipakai untuk melihat distribusi data measurement pada proses QC.",
                  f: "-"
                },
                {
                  k: "Bin / Kelas",
                  d: "Rentang data dibagi menjadi beberapa interval (bin).",
                  f: "classWidth = (Max - Min) / k"
                },
                {
                  k: "Lower – Upper",
                  d: "Batas bawah dan atas dari tiap interval bin.",
                  f: "-"
                },
                {
                  k: "Midpoint",
                  d: "Titik tengah tiap bin.",
                  f: "mid = (L + U) / 2"
                },
                {
                  k: "Frequency",
                  d: "Jumlah data yang jatuh pada tiap bin.",
                  f: "-"
                },
                {
                  k: "Sturges Rule",
                  d: "Aturan umum menentukan jumlah bin untuk data normal.",
                  f: "k = 1 + log2(N)"
                },
                {
                  k: "Freedman-Diaconis",
                  d: "Aturan robust untuk menentukan lebar bin.",
                  f: "binWidth = 2·IQR / N^(1/3)"
                },
                {
                  k: "Mean",
                  d: "Rata-rata measurement.",
                  f: "mean = Σx / N"
                },
                {
                  k: "Median",
                  d: "Nilai tengah dari data yang diurutkan.",
                  f: "-"
                },
                {
                  k: "Mode",
                  d: "Nilai yang paling sering muncul.",
                  f: "-"
                },
                {
                  k: "Standard Deviation",
                  d: "Mengukur penyebaran data terhadap mean.",
                  f: "sd = √Σ(x–mean)² / (N–1)"
                },
                {
                  k: "Variance",
                  d: "Ukuran penyebaran kuadrat.",
                  f: "var = sd²"
                },
                {
                  k: "Cp / Cpk",
                  d: "Mengukur capability proses terhadap batas spesifikasi.",
                  f: "Cp=(USL-LSL)/(6·sd)"
                }
              ].map((r, idx) => (
                <tr
                  key={r.k}
                  className={
                    idx % 2 === 0
                      ? "bg-card"
                      : "bg-muted/10"
                  }
                >
                  <td className="px-3 py-3 align-top font-medium">{r.k}</td>
                  <td className="px-3 py-3 align-top text-secondary">{r.d}</td>
                  <td className="px-3 py-3 align-top text-center font-mono text-xs">
                    {r.f}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 border border-primary rounded bg-primary/5 shadow-md space-y-4 text-sm">
        <div className="text-[15px] font-bold text-primary uppercase tracking-wide">
          Tipe Histogram
        </div>

        {l.histogramBase.length === 0 ? (
          <div className="text-sm text-secondary italic">
            Masukkan data terlebih dahulu untuk melihat bentuk histogram.
          </div>
        ) : (
          <div className="space-y-4 text-sm">

            {/* Bentuk distribusi */}
            <div className="p-3 border-l-4 border-primary bg-primary/10 rounded">
              <div className="text-[13px] font-semibold text-primary">
                Bentuk Distribusi
              </div>
              <div className="text-[13px] font-medium">
                {l.histogramShape || "-"}
              </div>
            </div>

            {/* Informasi tambahan — contoh analisis sederhana */}
            <div className="p-3 border-l-4 border-success bg-success/10 rounded">
              <div className="text-[13px] font-semibold text-success">
                Kesimpulan Singkat
              </div>

              {(() => {
                const shape = l.histogramShape

                if (!shape) return <div className="text-[13px]">-</div>

                if (shape === "Normal")
                  return <div className="text-[13px] font-medium">Distribusi mendekati normal — proses terlihat stabil.</div>

                if (shape.includes("Skew"))
                  return (
                    <div className="text-[13px] font-medium">
                      Distribusi tidak simetris — terdapat kecenderungan penyimpangan yang perlu dianalisis.
                    </div>
                  )

                if (shape === "Twin-peak")
                  return (
                    <div className="text-[13px] font-medium">
                      Pola dua puncak — kemungkinan berasal dari dua sumber proses berbeda.
                    </div>
                  )

                return <div className="text-[13px] font-medium">Distribusi umum tanpa pola khusus.</div>
              })()}
            </div>

          </div>
        )}
      </div>



    </div>
  )
}

export default HistogramPage