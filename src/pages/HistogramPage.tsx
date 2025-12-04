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
import HistogramChart from "../components/charts/HistogramChart"
import { useHistogramLogic } from "./HistogramLogic"

const HistogramPage = () => {
  const l = useHistogramLogic()
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const importRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  return (
    <div className="text-[14px] space-y-4 select-none">

      <div className="flex justify-between items-center px-3 py-2 border border-border rounded bg-card shadow-sm">
        <div className="font-semibold">Histogram</div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(l.getShareLink())}
            className="h-[32px] px-3 flex items-center gap-2 bg-primary text-white rounded border hover:bg-primary/80"
          >
            <HiShare className="w-4 h-4" />
            <span>Share Link</span>
          </button>

          <div className="relative" ref={importRef}>
            <button
              onClick={() => setShowImport(v => !v)}
              className="h-[32px] px-3 flex items-center gap-2 bg-muted text-foreground rounded border hover:border-primary"
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
              className="h-[32px] px-3 flex items-center gap-2 bg-muted text-foreground rounded border hover:border-primary"
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
                <div onClick={() => { l.exportJSON(); setShowExport(false) }} className="px-3 py-2 cursor-pointer hover:bg-primary/20 flex items-center gap-2">
                  <HiDocumentText className="w-4 h-4" /> JSON
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
            <label className="flex flex-col text-xs">
              Data Source
              <select
                value={l.selectedSource}
                onChange={e => l.setSelectedSource(e.target.value as any)}
                className="h-[36px] bg-bg border border-border rounded px-2 mt-1"
              >
                <option value="manual">Manual Input</option>
                <option value="production-distribution">Production Distribution</option>
                <option value="defective-item">Defective Item</option>
                <option value="defect-location">Defect Location</option>
                <option value="defect-cause">Defect Cause</option>
              </select>
            </label>

            <label className="flex flex-col text-xs">
              Bins
              <input
                type="number"
                value={l.bins}
                min={1}
                max={20}
                onChange={e => l.setBins(Number(e.target.value))}
                className="h-[36px] bg-bg border border-border rounded px-2 mt-1"
              />
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={l.showNormalCurve}
                onChange={e => l.setShowNormalCurve(e.target.checked)}
              />
              Show Normal Curve
            </label>

            <div className="flex gap-2">
              <button onClick={() => l.setBins(l.freedmanDiaconisBins(l.data))} className="h-[32px] px-2 border rounded bg-muted">F-D</button>
              <button onClick={() => l.setBins(Math.max(1, Math.ceil(1 + Math.log2(l.data.length))))} className="h-[32px] px-2 border rounded bg-muted">Sturges</button>
            </div>

            <button
              onClick={() => l.reloadFromSource()}
              className="h-[36px] px-3 bg-primary text-white rounded border hover:bg-primary/80"
            >
              Reload
            </button>
          </div>

          <button
            onClick={() => l.clearAll()}
            className="absolute bottom-2 right-3 h-[32px] px-3 bg-error/60 text-white rounded border"
          >
            Hapus semua data
          </button>
        </div>

        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
          <div className="font-medium text-sm">Informasi Produksi</div>

          <div className="grid grid-cols-2 gap-2">
            <input value={l.metadata.product} onChange={e => l.setMetadata({ ...l.metadata, product: e.target.value })} placeholder="Product" className="h-[36px] bg-bg border border-border rounded px-2" />
            <input type="date" value={l.metadata.date} onChange={e => l.setMetadata({ ...l.metadata, date: e.target.value })} className="h-[36px] bg-bg border border-border rounded px-2" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {l.customFields.filter(f => f.toLowerCase() !== "product" && f.toLowerCase() !== "date").map(f => (
              <div key={f} className="flex items-center gap-1">
                <input className="h-[36px] bg-bg border border-border rounded px-2 w-full" value={l.metadata[f] ?? ""} placeholder={f} onChange={e => l.setMetadata({ ...l.metadata, [f]: e.target.value })} />
                <button onClick={() => l.removeField(f)} className="h-[32px] px-2 border border-border rounded text-xs text-red-500">X</button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input value={l.newField} onChange={e => l.setNewField(e.target.value)} placeholder="Tambah field custom..." className="h-[36px] bg-bg border border-border rounded px-2 flex-1" />
            <button onClick={l.addField} className="h-[36px] px-3 bg-muted text-foreground rounded border border-border">+</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
          <div className="font-medium text-sm">Capability (Cp / Cpk)</div>

          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="LSL" className="h-[36px] bg-bg border border-border rounded px-2" onChange={e => l.setMetadata({ ...l.metadata, lsl: e.target.value })} />
            <input type="number" placeholder="USL" className="h-[36px] bg-bg border border-border rounded px-2" onChange={e => l.setMetadata({ ...l.metadata, usl: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>Cp: {l.cp ?? "-"}</div>
            <div>Cpk: {l.cpk ?? "-"}</div>
          </div>
        </div>

        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
          <div className="font-medium text-sm">Outliers</div>

          <div>Z-Score: {l.outliersZ.length}</div>
          <div>Tukey: {l.outliersTukey.length}</div>
        </div>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
        <div className="font-medium text-sm">Input Data Manual</div>

        <textarea value={l.inputData} onChange={e => l.setInputData(e.target.value)} placeholder="Masukkan angka dipisahkan koma atau spasi" className="w-full h-[100px] bg-bg border border-border rounded p-2" />

        <button onClick={l.parseManualInput} className="h-[36px] px-3 bg-primary text-white rounded border hover:bg-primary/80">
          Gunakan Data
        </button>
      </div>

      <div className="qc-card mb-6 overflow-x-auto p-3">
        <h2 className="text-lg font-semibold mb-4">Data Histogram</h2>

        <table className="text-sm w-full border-collapse">
          <thead>
            <tr className="border-border border-b text-secondary">
              <th className="text-left py-2 px-2">No</th>
              <th className="text-center px-2">Bin / Category</th>
              <th className="text-center px-2">Count</th>
            </tr>
          </thead>

          <tbody>
            {l.tableRows.map((row, i) => (
              <tr key={i} className="border-b hover:bg-primary/5">
                <td className="px-2 py-2 text-center">{i + 1}</td>
                <td className="px-3 py-2">{row.category}</td>
                <td className="px-3 py-2 text-center font-mono">{row.count}</td>
              </tr>
            ))}

            {l.tableRows.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-6 text-secondary">Belum ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="qc-card mb-6">
        <h2 className="text-lg font-semibold mb-4">Histogram Chart</h2>

      <HistogramChart
  ref={l.chartRef}
  data={l.tableRows}
  normalCurve={l.normalCurvePoints}
  height={350}
/>
      </div>

      <div className="p-4 border border-border rounded bg-card shadow-sm space-y-2 text-sm">
        <div className="font-medium text-sm">Statistik</div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          <div>Mean (Raw): {l.mean.toFixed(3)}</div>
          <div>Mean (Grouped): {l.meanGrouped?.toFixed(3)}</div>

          <div>Median: {l.median.toFixed(3)}</div>

          <div>Mode (Raw): {l.mode}</div>
          <div>Mode (Grouped Class): {l.modeGrouped?.label ?? "-"}</div>

          <div>Std Dev (Raw): {l.stddev.toFixed(3)}</div>
          <div>Std Dev (Grouped): {l.stddevGrouped?.toFixed(3)}</div>

          <div>Variance (Raw): {l.variance.toFixed(3)}</div>
          <div>Variance (Grouped): {l.varianceGrouped?.toFixed(3)}</div>
        </div>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
        <div className="font-semibold flex items-center gap-2">Keterangan Histogram</div>

        <table className="w-full text-sm border border-border rounded overflow-hidden">
          <tbody className="[&_tr:nth-child(even)]:bg-muted/20">

            <tr className="border-b border-border">
              <td className="px-2 py-1 w-[160px]"><b>Data Numerik</b></td>
              <td className="px-2 py-1">
                Histogram digunakan untuk data kuantitatif. Jika kategori, data dihitung sebagai angka.
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1"><b>Bin / Kelas</b></td>
              <td className="px-2 py-1">
                Rentang nilai dibagi menjadi beberapa interval. Rumus class width: (Max - Min) / jumlah bin.
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1"><b>Lower - Upper</b></td>
              <td className="px-2 py-1">
                Batas bawah dan atas setiap kelas. Nilai Max masuk ke kelas terakhir.
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1"><b>Midpoint</b></td>
              <td className="px-2 py-1">
                Titik tengah kelas. Rumus: (Lower + Upper) / 2.
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1"><b>Frequency</b></td>
              <td className="px-2 py-1">
                Jumlah data dalam kelas. Rumus indeks bin: floor((x - Min) / classWidth).
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1"><b>Sturges</b></td>
              <td className="px-2 py-1">
                Penentuan jumlah bin: k = 1 + log2(N). Cocok untuk data mendekati normal.
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1"><b>Freedman-Diaconis</b></td>
              <td className="px-2 py-1">
                Bin width = 2 * IQR / N^(1/3). Jumlah bin = (Max - Min) / binWidth.
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1"><b>Mean (Raw)</b></td>
              <td className="px-2 py-1">
                Rata-rata data asli. Rumus: sum(x) / N.
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1"><b>Mean (Grouped)</b></td>
              <td className="px-2 py-1">
                Menggunakan midpoint kelas. Rumus: sum(f * m) / sum(f).
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1"><b>Variance (Raw)</b></td>
              <td className="px-2 py-1">
                Rumus sample: sum((x - mean)^2) / (N - 1).
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1"><b>Variance (Grouped)</b></td>
              <td className="px-2 py-1">
                Rumus: sum(f * (m - meanGrouped)^2) / (sum(f) - 1).
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1"><b>Std Dev</b></td>
              <td className="px-2 py-1">
                Akar dari variance. Mengukur penyebaran data.
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1"><b>Outlier (Z-Score)</b></td>
              <td className="px-2 py-1">
                Data dianggap outlier jika |Z| &gt; 3. Z = (x - mean) / sd.
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1"><b>Outlier (Tukey)</b></td>
              <td className="px-2 py-1">
                Outlier jika x &lt; Q1 - 1.5 * IQR atau x &gt; Q3 + 1.5 * IQR.
              </td>
            </tr>

            <tr>
              <td className="px-2 py-1"><b>Cp / Cpk</b></td>
              <td className="px-2 py-1">
                Dibutuhkan LSL dan USL. Rumus Cp = (USL - LSL) / (6 * sd). Cpk = min(Cpu, Cpl).
              </td>
            </tr>

          </tbody>
        </table>
      </div>


    </div>
  )
}

export default HistogramPage
