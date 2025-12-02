import { useDistributionLogic } from "./CheckSheetProductionDistributionLogic"
import { importExcelChecksheet } from "../../utils/dataio/excel"
import { importCSVChecksheet } from "../../utils/dataio/csv"
import { useEffect, useRef, useState } from "react"
import {
  HiChevronDown,
  HiDocumentArrowUp,
  HiDocumentArrowDown,
  HiDocumentText,
  HiDocumentCheck,
  HiDocumentDuplicate,
  HiShare
} from "react-icons/hi2"

const CheckSheetDistribution = () => {
  const l = useDistributionLogic()
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const importRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (importRef.current && !importRef.current.contains(e.target as Node)) setShowImport(false)
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const totalCount = l.rows.reduce((s, r) => s + r.count, 0)
  const maxCount = Math.max(...l.rows.map(r => r.count), 1)

  const LSLActual = l.target + l.LSL * l.binSize
  const USLActual = l.target + l.USL * l.binSize

  let inSpec = 0
  let outSpec = 0
  l.rows.forEach(r => {
    const actual = l.target + r.deviation * l.binSize
    if (r.count <= 0) return
    if (actual < LSLActual || actual > USLActual) outSpec += r.count
    else inSpec += r.count
  })

  return (
    <div className="text-[14px] space-y-4 select-none">

      <div className="flex justify-between items-center px-3 py-2 border border-border rounded bg-card shadow-sm">
        <div className="font-semibold">Distribution Check Sheet</div>
        <div className="flex items-center gap-2">

          <button
            onClick={() => navigator.clipboard.writeText(l.getShareLink())}
            className="h-[32px] px-3 flex items-center gap-2 bg-primary text-white rounded border cursor-pointer hover:bg-primary/80"
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
              <div className="absolute right-0 mt-1 w-[160px] bg-card border border-border rounded shadow text-sm z-50">

                <label htmlFor="importExcelDist"
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20">
                  <HiDocumentCheck className="w-4 h-4" /> Excel (.xlsx)
                </label>
                <input
                  id="importExcelDist"
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    importExcelChecksheet(file, (d) => {
                      l.setRows(d.rows)
                    })
                    setShowImport(false)
                  }}
                />

                <label htmlFor="importCSVDist"
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20">
                  <HiDocumentDuplicate className="w-4 h-4" /> CSV (.csv)
                </label>

                <input
                  id="importCSVDist"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    importCSVChecksheet(file, (d) => {
                      l.setRows(d.rows)
                    })
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
              <div className="absolute right-0 mt-1 w-[160px] bg-card border border-border rounded shadow text-sm z-50">
                <div
                  onClick={() => { l.doExportPDF(); setShowExport(false) }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20">
                  <HiDocumentText className="w-4 h-4" /> PDF
                </div>

                <div
                  onClick={() => { l.doExportExcel(); setShowExport(false) }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20">
                  <HiDocumentCheck className="w-4 h-4" /> Excel
                </div>

                <div
                  onClick={() => { l.doExportCSV(); setShowExport(false) }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20">
                  <HiDocumentDuplicate className="w-4 h-4" /> CSV
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => l.setLocked(!l.locked)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm border cursor-pointer ${l.locked
              ? "bg-error/20 text-error border-error hover:border-error"
              : "bg-success/20 text-success border-success hover:border-success"
              }`}
          >
            <span>{l.locked ? "🔒" : "🔓"}</span>
            <span>{l.locked ? "Locked" : "Unlocked"}</span>
          </button>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">

          <div className="font-medium text-sm">Informasi Produksi</div>

          <div className="grid grid-cols-2 gap-2">
            {l.customFields.map(f => (
              <div key={f} className="flex items-center gap-1">
                <input
                  disabled={l.locked}
                  className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 w-full ${l.locked
                    ? "cursor-not-allowed"
                    : "cursor-text hover:border-primary"
                    }`}
                  value={l.metadata[f] || ""}
                  placeholder={f}
                  onChange={e => l.setMetadata({ ...l.metadata, [f]: e.target.value })}
                />
                {!l.locked && f !== "date" && (
                  <button
                    onClick={() => l.removeField(f)}
                    className="text-red-500 text-xs hover:border-red-500 border-[0.5px] rounded px-[4px] cursor-pointer"
                  >X</button>
                )}
              </div>
            ))}

            <div className="relative w-full">
              <input
                disabled={l.locked}
                type="date"
                className={`h-[32px] bg-bg text-foreground border-[0.5px] border-border rounded px-2 w-full 
                  appearance-none focus:outline-none focus:outline-[2px] focus:outline-primary
                  ${l.locked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary"}
                `}
                value={l.metadata.date}
                onChange={e => l.setMetadata({ ...l.metadata, date: e.target.value })}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                📅
              </span>
            </div>

          </div>

          <div className="flex gap-2">
            <input
              disabled={l.locked}
              className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 flex-1`}
              placeholder="Field Baru ..."
              value={l.newField}
              onChange={e => l.setNewField(e.target.value)}
            />

            <button
              disabled={l.locked}
              onClick={l.addField}
              className={`h-[32px] px-3 bg-muted text-foreground rounded border-[0.5px] ${l.locked
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-primary"
                }`}
            >
              +
            </button>
          </div>
        </div>

        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
          <div className="font-medium text-sm">Parameter</div>

          <div className="grid grid-cols-3 gap-2">

            <div className="flex flex-col text-xs">
              <span>Target</span>
              <input
                disabled={l.locked}
                type="number"
                className="h-[32px] bg-bg border border-border rounded px-2 font-mono"
                value={l.target}
                onChange={e => l.setTarget(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-col text-xs">
              <span>LSL</span>
              <input
                disabled={l.locked}
                type="number"
                className="h-[32px] bg-bg border border-border rounded px-2 font-mono"
                value={l.LSL}
                onChange={e => l.setLSL(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-col text-xs">
              <span>USL</span>
              <input
                disabled={l.locked}
                type="number"
                className="h-[32px] bg-bg border border-border rounded px-2 font-mono"
                value={l.USL}
                onChange={e => l.setUSL(Number(e.target.value))}
              />
            </div>

          </div>

          <div className="grid grid-cols-3 gap-2">

            <div className="flex flex-col text-xs">
              <span>Unit</span>
              <input
                disabled={l.locked}
                className="h-[32px] bg-bg border border-border rounded px-2 font-mono"
                value={l.unit}
                onChange={e => l.setUnit(e.target.value)}
              />
            </div>

            <div className="flex flex-col text-xs">
              <span>Bin Size</span>
              <input
                disabled={l.locked}
                type="number"
                step="0.0001"
                className="h-[32px] bg-bg border border-border rounded px-2 font-mono"
                value={l.binSize}
                onChange={e => l.setBinSize(Number(e.target.value))}
              />
            </div>

          </div>

        </div>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
        <div className="overflow-auto max-h-[380px]">
          <table className="w-full border border-border text-xs">
            <thead className="bg-card text-secondary sticky top-0">
              <tr>
                <th className="px-2 py-2 border border-border text-left">Deviation</th>
                <th className="px-2 py-2 border border-border text-left">Actual ({l.unit})</th>
                <th className="px-2 py-2 border border-border text-center">Count</th>
                <th className="px-2 py-2 border border-border text-left">Distribution</th>
                <th className="px-2 py-2 border border-border text-center">Freq</th>
              </tr>
            </thead>

            <tbody>
              {l.rows.map((r, rowIndex) => {
                const actual = l.target + r.deviation * l.binSize
                const out = actual < LSLActual || actual > USLActual
                return (
                  <tr
                    key={r.deviation}
                    className={`cursor-pointer ${l.selectedDev === rowIndex ? "bg-primary/20" : "hover:bg-primary/10"}`}
                    onClick={() => !l.locked && l.setSelectedDev(rowIndex)}

                  >
                    <td className={`px-2 py-1 border border-border font-mono ${out ? "text-error" : ""}`}>
                      {r.deviation}
                    </td>
                    <td className="px-2 py-1 border border-border font-mono">
                      {actual.toFixed(6)}
                    </td>
                    <td
                      tabIndex={0}
                      contentEditable={!l.locked}
                      suppressContentEditableWarning={true}
                      onFocus={() => {
                        l.setSelectedDev(rowIndex)
                        l.setManualInput(0)
                      }}
                      onKeyDown={e => {
                        if (e.key === "ArrowUp") l.increment()
                        if (e.key === "ArrowDown") l.decrement()
                        if (e.key === "Enter") {
                          e.preventDefault()
                          l.applyManualInput()
                          e.currentTarget.blur()
                        }
                      }}
                      onInput={e => {
                        const v = Number(e.currentTarget.innerText)
                        if (!isNaN(v)) l.setManualInput(v)
                      }}
                      className={`px-2 py-1 border border-border text-center font-mono focus:outline-none cursor-pointer
${l.selectedDev === rowIndex ? "bg-primary/20 border-primary text-primary font-bold" : "hover:bg-primary/10"}`}
                    >
                      {r.count}
                    </td>


                    <td className="px-2 py-1 border border-border">
                      <div className={`${out ? "bg-error" : "bg-primary"} h-[10px]`}
                        style={{ width: `${(r.count / maxCount) * 100}%` }} />
                    </td>
                    <td className="px-2 py-1 border border-border text-center font-mono">
                      {r.count}
                    </td>
                  </tr>
                )
              })}
            </tbody>

            <tfoot className="bg-bg font-semibold">
              <tr>
                <td colSpan={4} className="px-2 py-1 border border-border text-center">TOTAL</td>
                <td className="px-2 py-1 border border-border text-center font-mono">{totalCount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
        <div className="font-semibold flex items-center gap-2">
          Keterangan Tabel
        </div>

        <table className="w-full text-sm border border-border rounded overflow-hidden">
          <tbody className="[&_tr:nth-child(even)]:bg-muted/20">

            <tr className="border-b border-border">
              <td className="px-2 py-1 w-[160px] flex items-center gap-2">
                📉 <b>Deviation</b>
              </td>
              <td className="px-2 py-1">Offset dari nilai target dengan step bin size</td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1 flex items-center gap-2">
                📏 <b>Actual</b>
              </td>
              <td className="px-2 py-1">Nilai aktual hasil pengukuran</td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1 flex items-center gap-2">
                🔢 <b>Count</b>
              </td>
              <td className="px-2 py-1">Jumlah data pada deviasi tersebut</td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1 flex items-center gap-2">
                📊 <b>Distribution</b>
              </td>
              <td className="px-2 py-1">Bar visual jumlah relatif terhadap maksimum</td>
            </tr>

            <tr>
              <td className="px-2 py-1 flex items-center gap-2">
                🟦 <b>Cell biru</b>
              </td>
              <td className="px-2 py-1">Sel aktif yang dapat diinput langsung via keyboard</td>
            </tr>

          </tbody>
        </table>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm">
        <div className="font-medium text-sm mb-2">Adjust Count</div>

        <div className="flex gap-2">
          <button
            disabled={l.selectedDev === null || l.locked}
            onClick={l.decrement}
            className={`h-[32px] w-[32px] bg-muted rounded border border-border ${l.selectedDev === null || l.locked
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:border-primary"
              }`}
          >-</button>

          <button
            disabled={l.selectedDev === null || l.locked}
            onClick={l.increment}
            className={`h-[32px] w-[32px] bg-muted rounded border border-border ${l.selectedDev === null || l.locked
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:border-primary"
              }`}
          >+</button>

          <input
            disabled={l.selectedDev === null || l.locked}
            type="number"
            className={`h-[32px] bg-bg border border-border rounded px-2 w-[120px] font-mono`}
            value={l.manualInput}
            onChange={e => l.setManualInput(Number(e.target.value))}
          />

          <button
            disabled={l.selectedDev === null || l.locked}
            onClick={l.applyManualInput}
            className={`h-[32px] px-3 rounded border border-border ${l.selectedDev === null || l.locked
              ? "cursor-not-allowed opacity-50 bg-primary/40"
              : "cursor-pointer bg-primary/80 text-white"
              }`}
          >Set</button>

          <button
            disabled={l.selectedDev === null || l.locked}
            onClick={l.clearSelected}
            className={`h-[32px] px-3 rounded border border-border ${l.selectedDev === null || l.locked
              ? "cursor-not-allowed opacity-50 bg-error/40"
              : "cursor-pointer bg-error/80 text-white"
              }`}
          >Reset</button>

          <button
            disabled={l.locked}
            onClick={l.clearAll}
            className="h-[32px] px-3 bg-error/60 text-white rounded border border-border cursor-pointer hover:border-error"
          >Clear All</button>

        </div>
      </div>

    </div>
  )
}

export default CheckSheetDistribution
