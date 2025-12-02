import { useDefectLocationLogic } from "./CheckSheetDefectLocationLogic"
import { useRef, useState } from "react"
import { HiChevronDown, HiDocumentArrowDown, HiDocumentText, HiDocumentCheck, HiDocumentDuplicate, HiShare } from "react-icons/hi2"

const CheckSheetDefectLocation = () => {
  const l = useDefectLocationLogic()
  const [showExport, setShowExport] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  return (
    <div className="text-[14px] space-y-4 select-none">

      <div className="flex justify-between items-center px-3 py-2 border border-border rounded bg-card shadow-sm">
        <div className="font-semibold">Defect Location Matrix</div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(l.getShareLink())}
            className="h-[32px] px-3 flex items-center gap-2 bg-primary text-white rounded border cursor-pointer hover:bg-primary/80"
          >
            <HiShare className="w-4 h-4" />
            <span>Share Link</span>
          </button>

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExport(v => !v)}
              className="h-[32px] px-3 flex items-center gap-2 bg-muted text-foreground rounded border cursor-pointer hover:border-primary"
            >
              <HiDocumentArrowDown className="w-4 h-4" />
              <span>Export</span>
              <HiChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${showExport ? "rotate-180" : ""}`}
              />
            </button>

            {showExport && (
              <div className="absolute right-0 mt-1 w-[160px] bg-card border border-border rounded shadow text-sm z-50">

                <div
                  onClick={() => { l.doExportPDF(); setShowExport(false); }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20"
                >
                  <HiDocumentText className="w-4 h-4" />
                  PDF
                </div>

                <div
                  onClick={() => { l.doExportExcel(); setShowExport(false); }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20"
                >
                  <HiDocumentCheck className="w-4 h-4" />
                  Excel
                </div>

                <div
                  onClick={() => { l.doExportCSV(); setShowExport(false); }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20"
                >
                  <HiDocumentDuplicate className="w-4 h-4" />
                  CSV
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

        {/* LEFT — Informasi Produksi */}
        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
          <div className="font-medium text-sm">Informasi Produksi</div>
          <div className="grid grid-cols-2 gap-2">
            {l.customFields.map(f => (
              <div key={f} className="flex items-center gap-1">
                <input
                  disabled={l.locked}
                  className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 w-full ${l.locked ? "cursor-not-allowed" : "cursor-text"}`}
                  value={l.metadata[f] || ""}
                  placeholder={f}
                  onChange={e => l.setMetadata({ ...l.metadata, [f]: e.target.value })}
                  onKeyDown={e => e.stopPropagation()}
                />
                {!l.locked && f !== "date" && (
                  <button
                    onClick={() => l.removeField(f)}
                    className="text-red-500 text-xs hover:border-red-500 border-[0.5px] rounded px-[4px] cursor-pointer"
                  >
                    X
                  </button>
                )}
              </div>
            ))}

            <div className="relative w-full">
              <input
                disabled={l.locked}
                type="date"
                className={`h-[32px] bg-bg text-foreground border-[0.5px] border-border rounded px-2 w-full 
          appearance-none 
          placeholder:text-muted
          focus:outline-none focus:outline-[2px] focus:outline-primary
          ${l.locked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary"}`}
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
              className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 flex-1 ${l.locked ? "cursor-not-allowed" : "cursor-text"}`}
              placeholder="Field Baru ..."
              value={l.newField}
              onChange={e => l.setNewField(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
            />

            <button
              disabled={l.locked}
              onClick={l.addField}
              className={`h-[32px] px-3 bg-muted text-foreground rounded border-[0.5px] ${l.locked
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-primary"}`}
            >
              +
            </button>
          </div>
        </div>

        {/* RIGHT — Defect Input */}
        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
          <div className="font-medium text-sm">Defect Input</div>
          <div className="grid grid-cols-3 gap-2">
            <input
              disabled={l.locked}
              value={l.defectType}
              onChange={e => l.setDefectType(e.target.value)}
              className="h-[32px] bg-bg border border-border rounded px-2"
              placeholder="Defect type"
            />
            <select
              disabled={l.locked}
              value={l.severity}
              onChange={e => l.setSeverity(e.target.value as any)}
              className="h-[32px] bg-bg border border-border rounded px-2"
            >
              <option>Minor</option>
              <option>Major</option>
              <option>Critical</option>
            </select>
            <input
              disabled={l.locked}
              value={l.comment}
              onChange={e => l.setComment(e.target.value)}
              className="h-[32px] bg-bg border border-border rounded px-2"
              placeholder="Comment"
            />
          </div>
        </div>

      </div>



      <div className="p-3 border border-border rounded bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-bg text-secondary">
              <tr>
                <th className="border border-border px-2 py-2">Circular / Radial</th>
                {l.radial.map(r => <th key={r} className="border border-border px-1">{r}</th>)}
                <th className="border border-border px-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {l.circular.map(c => (
                <tr key={c}>
                  <td className="border border-border px-2 text-secondary">{c}</td>
                  {l.radial.map(r => {
                    const val = l.getCell(c, r)
                    const isSel = l.selectedCirc === c && l.selectedRad === r
                    const ratio = val / l.maxCount
                    return (
                      <td
                        key={r}
                        className={`border border-border text-center cursor-pointer transition-colors 
                        ${isSel ? "bg-primary/20" : "bg-bg hover:bg-primary/10"}
                        ${isSel ? "border-primary text-primary font-bold" : ""
                          }`}
                        onClick={() => { if (!l.locked) { l.setSelectedCirc(c); l.setSelectedRad(r); } }}
                      >
                        <div className="w-full h-[20px]" style={{ background: `rgba(0,200,255,${ratio})` }}>
                          {val}
                        </div>
                      </td>
                    )
                  })}
                  <td className="border border-border text-center font-mono bg-muted">{l.totalRow(c)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-bg font-semibold">
                <td className="border border-border text-center">TOTAL</td>
                {l.radial.map(r => (
                  <td key={r} className="border border-border text-center font-mono">{l.totalCol(r)}</td>
                ))}
                <td className="border border-border text-center font-mono bg-muted">{l.totalAll}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 border-[0.5px] border-border rounded bg-bg text-xs">
            Circ: {l.selectedCirc || "-"}
          </span>
          <span className="px-3 py-1 border-[0.5px] border-border rounded bg-bg text-xs">
            Rad: {l.selectedRad || "-"}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            disabled={!l.selectedCirc || !l.selectedRad}
            onClick={l.decrement}
            className={`h-[32px] w-[32px] bg-muted rounded border-[0.5px] ${!l.selectedCirc || !l.selectedRad
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-primary"
              }`}
          >
            -
          </button>

          <button
            disabled={!l.selectedCirc || !l.selectedRad}
            onClick={l.increment}
            className={`h-[32px] w-[32px] bg-muted rounded border-[0.5px] ${!l.selectedCirc || !l.selectedRad
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-primary"
              }`}
          >
            +
          </button>

          <input
            type="number"
            min={0}
            className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 w-[120px] font-mono ${!l.selectedCirc || !l.selectedRad ? "cursor-not-allowed" : "cursor-text"
              }`}
            value={l.manual}
            onChange={e => l.setManual(Number(e.target.value))}
            disabled={!l.selectedCirc || !l.selectedRad}
          />

          <button
            disabled={!l.selectedCirc || !l.selectedRad}
            onClick={l.applyManual}
            className={`h-[32px] px-3 rounded border-[0.5px] ${!l.selectedCirc || !l.selectedRad
                ? "cursor-not-allowed opacity-50 bg-primary/40 text-white"
                : "cursor-pointer bg-primary/80 text-white hover:border-primary"
              }`}
          >
            Set
          </button>

          <button
            disabled={!l.selectedCirc}
            onClick={l.resetRow}
            className={`h-[32px] px-3 rounded border-[0.5px] ${!l.selectedCirc
                ? "cursor-not-allowed opacity-50 bg-error/40 text-white"
                : "cursor-pointer bg-error/80 text-white hover:border-error"
              }`}
          >
            Reset
          </button>

          <button
            onClick={l.resetAll}
            className="h-[32px] px-3 bg-error/60 text-white rounded border-[0.5px] cursor-pointer hover:border-error"
          >
            Clear
          </button>

          <button
            onClick={l.undo}
            className="h-[32px] px-3 bg-secondary/60 text-white rounded border-[0.5px] cursor-pointer hover:border-secondary"
          >
            Undo
          </button>
        </div>

      </div>

    </div>
  )
}

export default CheckSheetDefectLocation
