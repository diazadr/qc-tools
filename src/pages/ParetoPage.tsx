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
import ParetoChart from "../components/charts/ParetoChart"
import { useParetoLogic } from "./ParetoLogic"

const ParetoPage = () => {
  const l = useParetoLogic()
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showTopNExport, setShowTopNExport] = useState(false)
  const importRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  type NormalizationMode = "none" | "per100" | "per1000" | "per10000" | "custom"

  return (
    <div className="text-[14px] space-y-4 select-none">

      <div className="flex justify-between items-center px-3 py-2 border border-border rounded bg-card shadow-sm">
        <div className="font-semibold">Pareto Chart</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(l.getShareLink())}
            className="h-[32px] px-3 flex items-center gap-2 bg-primary text-white rounded border cursor-pointer hover:bg-primary/80"
            title="Copy share link"
          >
            <HiShare className="w-4 h-4" />
            <span>Share Link</span>
          </button>

          <div className="relative" ref={importRef}>
            <button
              onClick={() => setShowImport(v => !v)}
              className="h-[32px] px-3 flex items-center gap-2 bg-muted text-foreground rounded border cursor-pointer hover:border-primary"
            >
              <HiDocumentArrowUp className="w-4 h-4" />
              <span>Import</span>
              <HiChevronDown className={`w-4 h-4 transition-transform duration-300 ${showImport ? "rotate-180" : ""}`} />
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
              className="h-[32px] px-3 flex items-center gap-2 bg-muted text-foreground rounded border cursor-pointer hover:border-primary"
            >
              <HiDocumentArrowDown className="w-4 h-4" />
              <span>Export</span>
              <HiChevronDown className={`w-4 h-4 transition-transform duration-300 ${showExport ? "rotate-180" : ""}`} />
            </button>

            {showExport && (
              <div className="absolute right-0 mt-1 w-[220px] bg-card border border-border rounded shadow text-sm z-50">
                <div
                  onClick={() => { l.exportPDF(); setShowExport(false) }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20"
                >
                  <HiDocumentText className="w-4 h-4" />
                  PDF
                </div>

                <div
                  onClick={() => { l.exportExcel(); setShowExport(false) }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20"
                >
                  <HiDocumentCheck className="w-4 h-4" />
                  Excel
                </div>

                <div
                  onClick={() => { l.exportCSV(); setShowExport(false) }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20"
                >
                  <HiDocumentDuplicate className="w-4 h-4" />
                  CSV
                </div>

                <div
                  onClick={() => { l.exportJSON(); setShowExport(false) }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20"
                >
                  <HiDocumentText className="w-4 h-4" />
                  JSON
                </div>

                <div
                  onClick={() => { l.exportChartImage(); setShowExport(false) }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20"
                >
                  <HiDocumentText className="w-4 h-4" />
                  Chart Image
                </div>

                <div
                  onClick={() => { setShowTopNExport(v => !v) }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20"
                >
                  <HiDocumentDuplicate className="w-4 h-4" />
                  Export Top-N
                </div>

                {showTopNExport && (
                  <div className="px-3 py-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { l.exportTopNToCSV(3); setShowExport(false); setShowTopNExport(false) }} className="qc-btn px-3 py-1">Top 3</button>
                      <button onClick={() => { l.exportTopNToCSV(5); setShowExport(false); setShowTopNExport(false) }} className="qc-btn px-3 py-1">Top 5</button>
                      <button onClick={() => { l.exportTopNToCSV(10); setShowExport(false); setShowTopNExport(false) }} className="qc-btn px-3 py-1">Top 10</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

  {/* CARD 1 — Konfigurasi Pareto */}
  <div className="relative p-3 border border-border rounded bg-card shadow-sm space-y-4">
    <div className="font-medium text-sm">Konfigurasi Pareto</div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="flex items-end gap-2">
          <label className="flex flex-col text-xs w-full">
            Data Source
            <select
              value={l.selectedSource}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                l.setSelectedSource(e.target.value as any)
              }}
              className="h-[36px] bg-bg border border-border rounded px-2 mt-1"
            >
              <option value="defective-item">Defective Item</option>
              <option value="defect-cause">Defect Cause</option>
              <option value="defect-location">Defect Location</option>
            </select>
          </label>

          <button
            onClick={() => l.reloadFromSource()}
            className="h-[36px] px-3 bg-primary text-white rounded border hover:bg-primary/80"
            type="button"
          >
            Reload
          </button>
        </div>

        <label className="flex flex-col text-xs">
          Normalization
          <select
            value={l.normalizationMode}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              l.setNormalizationMode(e.target.value as NormalizationMode)
            }
            className="h-[36px] bg-bg border border-border rounded px-2 mt-1"
          >
            <option value="none">None</option>
            <option value="per100">Per 100</option>
            <option value="per1000">Per 1000</option>
            <option value="per10000">Per 10000</option>
            <option value="custom">Custom</option>
          </select>
        </label>

        {l.normalizationMode === "custom" && (
          <label className="flex flex-col text-xs">
            Custom base
            <input
              type="number"
              value={l.customNormalizationBase}
              onChange={e => l.setCustomNormalizationBase(Number(e.target.value))}
              className="h-[36px] bg-bg border border-border rounded px-2 mt-1"
            />
          </label>
        )}
      </div>

      <div className="space-y-3">
        <label className="flex flex-col text-xs">
          Small-group threshold (%)
          <input
            type="number"
            value={l.smallGroupThreshold}
            onChange={e => l.setSmallGroupThreshold(Number(e.target.value))}
            min={0}
            max={100}
            className="h-[36px] bg-bg border border-border rounded px-2 mt-1"
          />
        </label>
      </div>
    </div>

    <button
      onClick={() => l.clearAll()}
      className="absolute bottom-2 right-3 h-[32px] px-3 bg-error/60 text-white rounded border-[0.5px] cursor-pointer hover:border-error"
      type="button"
    >
      Hapus semua data
    </button>
  </div>

  {/* CARD 2 — Kategori */}
  <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
    <div className="font-medium text-sm">Kategori</div>

    <div className="flex gap-2 items-center">
      <input
        className="h-[32px] bg-bg border border-border rounded px-2 flex-1"
        value={l.category}
        placeholder="Nama Kategori"
        onChange={e => l.setCategory(e.target.value)}
      />

      <input
        type="number"
        placeholder="Jumlah"
        value={l.count}
        onChange={e => l.setCount(e.target.value)}
        className="h-[32px] bg-bg border border-border rounded px-2 w-[120px]"
      />

      <button
        onClick={l.addItem}
        className="h-[32px] px-3 bg-muted text-foreground rounded border-[0.5px] cursor-pointer hover:border-primary"
      >
        +
      </button>
    </div>

    <div className="flex flex-wrap gap-1 pt-2">
      {l.items.map((c, i) => (
        <div key={i} className="flex items-center gap-1">
          <input
            className="px-2 py-1 border border-border rounded text-xs bg-bg cursor-text w-[120px]"
            value={c.category}
            onChange={e => l.renameCategory(i, e.target.value)}
          />

          <button
            onClick={() => l.removeItem(i)}
            className="text-red-500 text-xs hover:border-red-500 border-[0.5px] rounded px-[4px] cursor-pointer"
          >
            X
          </button>
        </div>
      ))}
    </div>
  </div>

</div>




      <div className="qc-card mb-6 overflow-x-auto p-3">
        <h2 className="text-lg font-semibold text-text mb-4">Data Pareto</h2>

        <table className="text-sm w-full border-collapse">
          <thead>
            <tr className="border-border border-b text-secondary">
              <th className="text-left py-2">No</th>
              <th className="text-left py-2 cursor-pointer" onClick={() => l.setSort("category")}>
                <div className="flex items-center gap-1">
                  Kategori
                  {l.sortKey === "category" && <span className="text-xs">{l.sortAsc ? "▲" : "▼"}</span>}
                </div>
              </th>
              <th className="text-center">Jumlah</th>
              <th className="text-center">Nilai</th>
              <th className="text-center">Cum %</th>
            </tr>
          </thead>

          <tbody>
            {l.tableRows.map((row, index) => (
              <tr key={index} className="border-b hover:bg-primary/5 transition-colors">
                <td className="px-2 py-2 text-center">{index + 1}</td>
                <td className="px-3 py-2">
                  <div>{row.category}</div>
                </td>

                <td className="px-3 py-2 text-center font-mono">{row.count}</td>

                <td className="px-3 py-2 text-center">{l.normalizationMode === "none" ? `${row.percentage}%` : `${row.percentage}`}</td>

                <td className="px-3 py-2 text-center">{row.cumulativePercentage}%</td>
              </tr>
            ))}

            {l.tableRows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-secondary">Belum ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="qc-card mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">Pareto Chart</h2>
        <ParetoChart
          ref={l.chartRef}
          data={l.sorted}
          show80Line={true}
          yLeftLabel="Count"
          yRightLabel="Cumulative %"
          date={l.date}
        />
      </div>

      <div className="p-4 border border-primary rounded bg-primary/5 shadow-md space-y-4">
        <div className="text-[15px] font-bold text-primary uppercase tracking-wide">Kesimpulan</div>

        {l.totalCount === 0 ? (
          <div className="text-sm text-secondary italic">Masukkan data kategori terlebih dahulu untuk memunculkan rekomendasi.</div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="p-3 border-l-4 border-primary bg-primary/10 rounded">
              <div className="text-[13px] font-semibold text-primary">Defect dominan (Pareto ≤ 80%)</div>
              <div className="text-[13px] font-medium">{l.focusDefects.length === 0 ? "Belum ada defect yang menonjol." : `${l.focusDefects.map(x => x.category).join(", ")} mencakup sekitar ${l.focusCoverage.toFixed(1)}% dari total`}</div>
            </div>
            {/* Top-loss Recommendation */}
            <div className="p-3 border-l-4 border-warning bg-warning/10 rounded">
              <div className="text-[13px] font-semibold text-warning">Top-loss Highlight</div>
              <div className="text-[13px] font-medium">
                {l.topLossRecommendation || "Belum ada data top-loss."}
              </div>
            </div>

            <div className="p-3 border-l-4 border-secondary bg-secondary/10 rounded">
              <div className="text-[13px] font-semibold text-secondary">Analitik tambahan</div>
              <div className="text-[13px]">
                <div>Dominant: {l.dominantCategory ? `${l.dominantCategory.category} (${((l.dominantCategory.count / l.totalCount) * 100).toFixed(1)}%)` : "-"}</div>
                <div>Dominant ratio: {l.dominantRatio.toFixed(3)}</div>
                <div>Imbalance score: {l.imbalanceScore.toFixed(3)}</div>
                <div>Flags: {l.isSkewed ? "Skewed" : l.isBalanced ? "Balanced" : "Normal"}</div>
              </div>
            </div>

            <div className="p-3 border-l-4 border-error bg-error/10 rounded">
              <div className="text-[13px] font-semibold text-error">Saran Tindakan</div>
              <div className="text-[13px]">Fokuskan perbaikan pada kategori yang masuk ke coverage ≤ 80%, lalu lakukan root cause analysis untuk masing-masing kategori utama.</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
        <div className="font-semibold flex items-center gap-2">Keterangan Tabel</div>

        <table className="w-full text-sm border border-border rounded overflow-hidden">
          <tbody className="[&_tr:nth-child(even)]:bg-muted/20">
            <tr className="border-b border-border">
              <td className="px-2 py-1 w-[140px] flex items-center gap-2">🔢 <b>No</b></td>
              <td className="px-2 py-1">Urutan ranking category berdasarkan jumlah kejadian</td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1 flex items-center gap-2">🏷️ <b>Jenis</b></td>
              <td className="px-2 py-1">Nama kategori defect yang diamati</td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1 flex items-center gap-2">➕ <b>Total</b></td>
              <td className="px-2 py-1">Jumlah keseluruhan defect pada kategori tersebut</td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1 flex items-center gap-2">📊 <b>% / Value</b></td>
              <td className="px-2 py-1">Persentase atau nilai normalisasi sesuai konfigurasi</td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1 flex items-center gap-2">🔴 <b>Cum %</b></td>
              <td className="px-2 py-1">Persentase kumulatif untuk analisis Pareto</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default ParetoPage
