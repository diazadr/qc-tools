import { useDefectCauseLogic } from "./CheckSheetDefectCauseLogic"
import { useState, useRef } from "react"
import { HiChevronDown, HiDocumentArrowUp, HiDocumentArrowDown, HiDocumentText, HiDocumentCheck, HiDocumentDuplicate, HiShare } from "react-icons/hi2"
import { importExcelChecksheet } from "../../utils/dataio/excel"
import { importCSVChecksheet } from "../../utils/dataio/csv"

const CheckSheetDefectCause = () => {
  const l = useDefectCauseLogic()
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const importRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  return (
    <div className="text-[14px] space-y-4 select-none">

      <div className="flex justify-between items-center px-3 py-2 border border-border rounded bg-card shadow-sm">
        <div className="font-semibold">Defect Cause Check Sheet</div>

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
              onClick={() => setShowImport((v: any) => !v)}
              className="h-[32px] px-3 flex items-center gap-2 bg-muted text-foreground rounded border cursor-pointer hover:border-primary"
            >
              <HiDocumentArrowUp className="w-4 h-4" />
              <span>Import</span>
              <HiChevronDown className={`w-4 h-4 transition-transform duration-300 ${showImport ? "rotate-180" : ""}`} />
            </button>

            {showImport && (
              <div className="absolute right-0 mt-1 w-[160px] bg-card border border-border rounded shadow text-sm z-50">
                <label htmlFor="importExcel" className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20">
                  <HiDocumentCheck className="w-4 h-4" /> Excel (.xlsx)
                </label>
                <input id="importExcel" type="file" accept=".xlsx" className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    importExcelChecksheet(file, (d) => {
                      l.setMetadata(d.metadata)
                      l.setCustomFields(d.customFields)
                      l.setWorkers(d.workers)
                      l.setDefectType(d.defectType)
                      l.setDataset(d.dataset)
                    })
                    setShowImport(false)
                  }}
                />
                <label htmlFor="importCSV" className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20">
                  <HiDocumentDuplicate className="w-4 h-4" /> CSV (.csv)
                </label>
                <input id="importCSV" type="file" accept=".csv" className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    importCSVChecksheet(file, (d) => {
                      l.setMetadata(d.metadata)
                      l.setCustomFields(d.customFields)
                      l.setWorkers(d.workers)
                      l.setDefectType(d.defectType)
                      l.setDataset(d.dataset)
                    })
                    setShowImport(false)
                  }}
                />
              </div>
            )}
          </div>

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExport((v: any) => !v)}
              className="h-[32px] px-3 flex items-center gap-2 bg-muted text-foreground rounded border cursor-pointer hover:border-primary"
            >
              <HiDocumentArrowDown className="w-4 h-4" />
              <span>Export</span>
              <HiChevronDown className={`w-4 h-4 transition-transform duration-300 ${showExport ? "rotate-180" : ""}`} />
            </button>

            {showExport && (
              <div className="absolute right-0 mt-1 w-[160px] bg-card border border-border rounded shadow text-sm z-50">
                <div onClick={() => { l.doExportPDF(); setShowExport(false); }} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20">
                  <HiDocumentText className="w-4 h-4" /> PDF
                </div>
                <div onClick={() => { l.doExportExcel(); setShowExport(false); }} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20">
                  <HiDocumentCheck className="w-4 h-4" /> Excel
                </div>
                <div onClick={() => { l.doExportCSV(); setShowExport(false); }} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20">
                  <HiDocumentDuplicate className="w-4 h-4" /> CSV
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => l.setIsLocked(!l.isLocked)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm border cursor-pointer ${l.isLocked
              ? "bg-error/20 text-error border-error hover:border-error"
              : "bg-success/20 text-success border-success hover:border-success"
              }`}
          >
            <span>{l.isLocked ? "🔒" : "🔓"}</span>
            <span>{l.isLocked ? "Locked" : "Unlocked"}</span>
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
                  disabled={l.isLocked}
                  className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 w-full ${l.isLocked ? "cursor-not-allowed" : "cursor-text"}`}
                  value={l.metadata[f] || ""}
                  placeholder={f}
                  onChange={e => l.setMetadata({ ...l.metadata, [f]: e.target.value })}
                  onKeyDown={e => e.stopPropagation()}
                />
                {!l.isLocked && f !== "date" && (
                  <button
                    onClick={() => l.setCustomFields(l.customFields.filter(c => c !== f))}
                    className="text-red-500 text-xs hover:border-red-500 border-[0.5px] rounded px-[4px] cursor-pointer"
                  >
                    X
                  </button>
                )}
              </div>
            ))}

            <div className="relative w-full">
              <input
                disabled={l.isLocked}
                type="date"
                className={`h-[32px] bg-bg text-foreground border-[0.5px] border-border rounded px-2 w-full
                  ${l.isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary"}
                `}
                value={l.metadata.date}
                onChange={e => l.setMetadata({ ...l.metadata, date: e.target.value })}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">📅</span>
            </div>

          </div>

          <div className="flex gap-2">
            <input
              disabled={l.isLocked}
              className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 flex-1`}
              placeholder="Field Baru ..."
              value={""}
              onChange={() => { }}
            />
            <button
              disabled={l.isLocked}
              className={`h-[32px] px-3 bg-muted text-foreground rounded border-[0.5px]`}
            >
              +
            </button>
          </div>
        </div>


        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
          <div className="font-medium text-sm">Worker & Defect Type</div>

          <div className="flex flex-col gap-3">

            <div className="flex flex-wrap gap-1">
              {l.workers.map(w => (
                <div key={w} className="flex items-center gap-1">
                  <input
                    disabled={l.isLocked}
                    className="px-2 py-1 border-[0.5px] border-border rounded text-xs bg-bg cursor-text w-[70px]"
                    defaultValue={w}
                    onBlur={e => l.renameWorker(w, e.target.value)}
                    onKeyDown={e => e.stopPropagation()}
                  />
                  {!l.isLocked && (
                    <button onClick={() => l.setWorkers(l.workers.filter(x => x !== w))}
                      className="text-red-500 text-xs hover:border-red-500 border-[0.5px] rounded px-[4px] cursor-pointer">X</button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                disabled={l.isLocked}
                className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 flex-1`}
                placeholder="Tambah Worker"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const v = e.currentTarget.value.trim()
                    if (v) l.addWorker(v)
                    e.currentTarget.value = ""
                  }
                }}
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {l.defectType.map(t => (
                <div key={t} className="flex items-center gap-1">
                  <input
                    disabled={l.isLocked}
                    className="px-2 py-1 border-[0.5px] border-border rounded text-xs bg-bg cursor-text w-[70px]"
                    defaultValue={t}
                    onBlur={e => l.renameDefectSymbol(t, e.target.value)}
                    onKeyDown={e => e.stopPropagation()}
                  />
                  {!l.isLocked && (
                    <button onClick={() => l.setDefectType(l.defectType.filter(x => x !== t))}
                      className="text-red-500 text-xs hover:border-red-500 border-[0.5px] rounded px-[4px] cursor-pointer">X</button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                disabled={l.isLocked}
                className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 flex-1`}
                placeholder="Tambah Symbol"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const v = e.currentTarget.value.trim()
                    if (v) l.addDefectSymbol(v)
                    e.currentTarget.value = ""
                  }
                }}
              />
            </div>

          </div>
        </div>
      </div>


      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
        <div className="overflow-auto max-h-[480px] scroll-m-0">
          <table className="w-full text-xs border-separate border-spacing-0 border border-border">
            <thead className="bg-card text-secondary sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left border border-border cursor-pointer">Worker</th>
                {l.days.map(d => (
                  <th key={d} colSpan={l.shift.length}
                    className="px-3 py-2 text-center font-mono border border-border cursor-pointer">{d}</th>
                ))}
                <th className="px-3 py-2 text-center font-mono border border-border cursor-pointer">Total</th>
              </tr>
            </thead>

            <tbody>
              {l.sortedWorkers.map(w => (
                <tr key={w} className="hover:bg-primary/5 transition-colors select-none">
                  <td className="px-3 py-2 text-sm border border-border">{w}</td>

                  {l.days.map(d => l.shift.map(s => (
                    <td
                      key={w + d + s}
                      ref={el => {
                        if (!l.cellRefs.current[w]) l.cellRefs.current[w] = {}
                        l.cellRefs.current[w][d] = el
                      }}
                      tabIndex={0}
                      onFocus={() => {
                        l.setSelectedWorker(w)
                        l.setSelectedDay(d)
                        l.setSelectedShift(s)
                        l.setCellBuffer("")
                      }}
                      className={`text-center border border-border px-2 py-1 cursor-pointer transition-colors
                      ${l.selectedWorker === w && l.selectedDay === d && l.selectedShift === s
                          ? "bg-primary/20 border-primary text-primary font-bold"
                          : "hover:bg-primary/10 hover:text-primary hover:border-primary"
                        }`}
                    >
                      <div className="flex flex-col gap-[1px]">
                        {l.defectType.map(t => (
                          <div key={t} className="flex justify-between items-center">
                            <span className="cursor-pointer text-[16px]"
                              onClick={() => { l.setSelectedType(t) }}>{t}</span>
                            <span className="cursor-pointer text-[13px]"
                              onClick={() => {
                                l.setSelectedType(t)
                                l.increment()
                              }}
                            >
                              {l.count(w, d, s, t)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  )))}

                  <td className="px-3 py-2 text-center font-mono border border-border">{l.totalWorker(w)}</td>
                </tr>
              ))}
            </tbody>

            <tfoot className="bg-bg font-semibold border-t border-border">
              <tr>
                <td className="px-3 py-2 text-center border border-border">TOTAL</td>
                {l.days.map(d => (
                  l.shift.map(s => (
                    <td key={d + s} className="px-3 py-2 text-center font-mono border border-border">
                      {l.dataset.filter(e => e.day === d && e.shift === s).length}
                    </td>
                  ))
                ))}
                <td className="px-3 py-2 text-center font-bold font-mono border border-border">{l.totalAll}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>


      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">

        <div className="flex items-center gap-2 text-sm">
          <span>Worker:</span>
          <span className="px-2 py-[2px] border border-border rounded bg-bg text-xs">{l.selectedWorker || "-"}</span>
          <span>Day:</span>
          <span className="px-2 py-[2px] border border-border rounded bg-bg text-xs">{l.selectedDay || "-"}</span>
          <span>Shift:</span>
          <span className="px-2 py-[2px] border border-border rounded bg-bg text-xs">{l.selectedShift || "-"}</span>
          <span>Type:</span>
          <span className="px-2 py-[2px] border border-border rounded bg-bg text-xs">{l.selectedType || "-"}</span>
        </div>

        <div className="flex gap-2 justify-between">
          <div className="flex gap-2">
            <button
              disabled={!l.selectedWorker || !l.selectedDay || !l.selectedShift || !l.selectedType}
              onClick={l.decrement}
              className={`h-[32px] w-[32px] bg-muted rounded border-[0.5px]`}
            >
              -
            </button>

            <button
              disabled={!l.selectedWorker || !l.selectedDay || !l.selectedShift || !l.selectedType}
              onClick={l.increment}
              className={`h-[32px] w-[32px] bg-muted rounded border-[0.5px]`}
            >
              +
            </button>

            <button
              disabled={!l.selectedWorker || !l.selectedDay || !l.selectedShift}
              onClick={l.resetCell}
              className={`h-[32px] px-3 bg-warning/70 text-black rounded border-[0.5px]`}
            >
              Reset Sel
            </button>
            <button
              disabled={!l.selectedWorker}
              onClick={l.resetWorker}
              className={`h-[32px] px-3 bg-warning/80 text-black rounded border-[0.5px]`}
            >
              Reset Worker
            </button>
          </div>

          <div className="flex gap-2">
            <button disabled={l.isLocked} onClick={l.resetAll} className="h-[32px] px-3 bg-error/60 text-white rounded border-[0.5px]">
              Reset ALL
            </button>

            <button disabled={l.isLocked} onClick={l.undo} className="h-[32px] px-3 bg-secondary/60 text-white rounded border-[0.5px]">
              Undo
            </button>
          </div>
        </div>
      </div>

      <div className="text-secondary font-mono text-[12px]">
        Total defects recorded: {l.totalAll}
      </div>

    </div>
  )
}

export default CheckSheetDefectCause
