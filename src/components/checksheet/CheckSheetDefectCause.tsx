import { useDefectCauseLogic } from "./CheckSheetDefectCauseLogic"
import { useState, useRef } from "react"
import { HiChevronDown, HiDocumentArrowDown, HiDocumentText, HiDocumentCheck, HiDocumentDuplicate, HiShare } from "react-icons/hi2"

const CheckSheetDefectCause = () => {
  const l = useDefectCauseLogic()
  const [showExport, setShowExport] = useState(false)
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
                  className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 w-full ${l.isLocked ? "cursor-not-allowed" : "cursor-text"
                    }`}
                  value={l.metadata[f] || ""}
                  placeholder={f}
                  onChange={e => l.setMetadata({ ...l.metadata, [f]: e.target.value })}
                  onKeyDown={e => e.stopPropagation()}
                />

                {!l.isLocked && (
                  <button
                    onClick={() => l.setCustomFields(l.customFields.filter(c => c !== f))}
                    className="text-red-500 text-xs hover:border-red-500 border-[0.5px] rounded px-[4px] cursor-pointer"
                  >
                    X
                  </button>
                )}
              </div>
            ))}

            {/* DATE FIELD – identical to Location style */}
            <div className="relative w-full">
              <input
                disabled={l.isLocked}
                type="text"
                placeholder="YYYY-MM-DD"
                className={`h-[32px] bg-bg text-foreground border-[0.5px] border-border rounded pl-2 pr-7 w-full
          placeholder:text-muted
          focus:outline-none focus:outline-[2px] focus:outline-primary
          ${l.isLocked ? "cursor-not-allowed opacity-60" : "cursor-text hover:border-primary"}
        `}
                value={l.metadata.date}
                onChange={e => l.setMetadata({ ...l.metadata, date: e.target.value })}
                onFocus={e => {
                  e.target.type = "date"
                  e.target.showPicker?.()
                }}
                onBlur={e => {
                  if (!e.target.value) e.target.type = "text"
                }}
              />

              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                📅
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              disabled={l.isLocked}
              className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 flex-1 ${l.isLocked ? "cursor-not-allowed" : "cursor-text"
                }`}
              placeholder="Field Baru ..."
              value={l.newField}
              onChange={e => l.setNewField(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
            />

            <button
              disabled={l.isLocked}
              onClick={l.addField}
              className={`h-[32px] px-3 bg-muted text-foreground rounded border-[0.5px] ${l.isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary"
                }`}
            >
              +
            </button>
          </div>
        </div>




        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">

          <div className="flex border-b border-border text-sm">
            <button
              onClick={() => l.setActiveTabWD("worker")}
              className={`flex-1 py-1 cursor-pointer ${l.activeTabWD === "worker"
                  ? "border-b-2 border-primary text-primary"
                  : "opacity-50 hover:border-primary hover:border-b"
                }`}
            >
              Worker
            </button>

            <button
              onClick={() => l.setActiveTabWD("defect")}
              className={`flex-1 py-1 cursor-pointer ${l.activeTabWD === "defect"
                  ? "border-b-2 border-primary text-primary"
                  : "opacity-50 hover:border-primary hover:border-b"
                }`}
            >
              Defect
            </button>
          </div>
{l.activeTabWD === "worker" && (
  <>
    {/* INPUT TAMBAH WORKER - sekarang di atas */}
    <div className="flex gap-2">
      <input
        disabled={l.isLocked}
        className="h-[32px] bg-bg border-[0.5px] border-border rounded px-2 flex-1"
        placeholder="Tambah Worker"
        value={l.newWorker}
        onChange={e => l.setNewWorker(e.target.value)}
        onKeyDown={e => e.stopPropagation()}
      />

      <button
        disabled={l.isLocked}
        onClick={() => {
          const v = l.newWorker.trim()
          if (v) l.addWorker(v)
          l.setNewWorker("")
        }}
        className={`h-[32px] px-3 bg-muted text-foreground rounded border-[0.5px] ${
          l.isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary"
        }`}
      >
        +
      </button>
    </div>

    {/* BUBBLE LIST - dipindah ke bawah */}
    <div className="flex flex-wrap gap-1 pt-2">
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
            <button
              onClick={() => l.setWorkers(l.workers.filter(x => x !== w))}
              className="text-red-500 text-xs hover:border-red-500 border-[0.5px] rounded px-[4px] cursor-pointer"
            >
              X
            </button>
          )}
        </div>
      ))}
    </div>
  </>
)}


    {l.activeTabWD === "defect" && (
  <>
    {/* INPUT TAMBAH SYMBOL → di atas */}
    <div className="flex gap-2">
      <input
        disabled={l.isLocked}
        className="h-[32px] bg-bg border-[0.5px] border-border rounded px-2 flex-1"
        placeholder="Tambah Symbol"
        onKeyDown={e => {
          if (e.key === "Enter") {
            const v = e.currentTarget.value.trim()
            if (v) l.addDefectSymbol(v)
            e.currentTarget.value = ""
          }
          e.stopPropagation()
        }}
      />
    </div>

    {/* BUBBLE LIST → pindah ke bawah */}
    <div className="flex flex-wrap gap-1 pt-2">
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
            <button
              onClick={() => l.setDefectType(l.defectType.filter(x => x !== t))}
              className="text-red-500 text-xs hover:border-red-500 border-[0.5px] rounded px-[4px] cursor-pointer"
            >
              X
            </button>
          )}
        </div>
      ))}
    </div>
  </>
)}


        </div>

      </div>


      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
        <div className="overflow-auto max-h-[480px] scroll-m-0">
          <table className="w-full text-sm border-separate border-spacing-0 border border-border">
            <thead className="bg-primary text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left border border-primary">Worker</th>

                {l.days.map(d => (
                  <th
                    key={d}
                    colSpan={l.shift.length}
                    className="px-3 py-2 text-center font-mono border border-primary"
                  >
                    {d}
                  </th>
                ))}

                <th className="px-3 py-2 text-center font-mono border border-primary">Total</th>
              </tr>

              <tr>
                <th className="border border-primary"></th>

                {l.days.map(d =>
                  l.shift.map(s => (
                    <th
                      key={d + s}
                      className="px-3 py-1 text-center font-mono border border-primary"
                    >
                      {s}
                    </th>
                  ))
                )}

                <th className="border border-primary"></th>
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
 <div className="p-4 border border-primary rounded bg-primary/5 shadow-md space-y-4">
  <div className="text-[15px] font-bold text-primary uppercase tracking-wide">
    Kesimpulan
  </div>

  {l.totalAll === 0 ? (
    <div className="text-sm text-secondary italic">
      Masukkan data defect terlebih dahulu untuk memunculkan rekomendasi.
    </div>
  ) : (
    <div className="space-y-4 text-sm">

      <div className="p-3 border-l-4 border-primary bg-primary/10 rounded">
        <div className="text-[13px] font-semibold text-primary">
          Defect paling dominan
        </div>

        {(() => {
          const list = l.defectType
            .map(t => ({ type: t, total: l.totalType(t) }))
            .sort((a, b) => b.total - a.total)

          const top = list[0]

          return (
            <div className="text-[13px] font-medium">
              {top.total === 0
                ? "Belum ada defect yang menonjol."
                : `${top.type} memiliki jumlah tertinggi (${top.total})`}
            </div>
          )
        })()}
      </div>

      <div className="p-3 border-l-4 border-error bg-error/10 rounded">
        <div className="text-[13px] font-semibold text-error">
          Hari/shift paling bermasalah
        </div>

        {(() => {
          const combos: { d: string; s: string; total: number }[] = []

          l.days.forEach(d => {
            l.shift.forEach(s => {
              const total = l.dataset.filter(e => e.day === d && e.shift === s).length
              combos.push({ d, s, total })
            })
          })

          combos.sort((a, b) => b.total - a.total)
          const worst = combos[0]

          return (
            <div className="text-[13px] font-medium">
              {worst.total === 0
                ? "Belum ada hari atau shift yang dominan."
                : `${worst.d} (${worst.s}) memiliki jumlah defect tertinggi (${worst.total})`}
            </div>
          )
        })()}
      </div>

    </div>
  )}
</div>


<div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
  <div className="font-semibold flex items-center gap-2">
    Keterangan Tabel
  </div>

  <table className="w-full text-sm border border-border rounded overflow-hidden">
    <tbody className="[&_tr:nth-child(even)]:bg-muted/20">

      <tr className="border-b border-border">
        <td className="px-2 py-1 w-[160px] flex items-center gap-2">
          👤 <b>Worker</b>
        </td>
        <td className="px-2 py-1">Operator yang melakukan proses pada hari/shift tertentu</td>
      </tr>

      <tr className="border-b border-border">
        <td className="px-2 py-1 flex items-center gap-2">
          📆 <b>Kolom Hari</b>
        </td>
        <td className="px-2 py-1">Menunjukkan hari produksi (Mon–Sat) yang dipantau</td>
      </tr>

      <tr className="border-b border-border">
        <td className="px-2 py-1 flex items-center gap-2">
          🕒 <b>Shift</b>
        </td>
        <td className="px-2 py-1">Pembagian waktu kerja (AM/PM) untuk setiap hari</td>
      </tr>

      <tr className="border-b border-border">
        <td className="px-2 py-1 flex items-center gap-2">
          🎯 <b>Defect Type</b>
        </td>
        <td className="px-2 py-1">
          Jenis defect yang dicatat dalam setiap sel (⭕ 🔴 ❌ ⚠️ 🟦, dll)
        </td>
      </tr>

      <tr className="border-b border-border">
        <td className="px-2 py-1 flex items-center gap-2">
          🔢 <b>Count</b>
        </td>
        <td className="px-2 py-1">
          Jumlah kejadian defect pada worker–hari–shift untuk jenis defect tertentu
        </td>
      </tr>

      <tr className="border-b border-border">
        <td className="px-2 py-1 flex items-center gap-2">
          ➕ <b>Total</b>
        </td>
        <td className="px-2 py-1">Jumlah seluruh defect milik 1 worker</td>
      </tr>

      <tr>
        <td className="px-2 py-1 flex items-center gap-2">
          🟦 <b>Cell Biru</b>
        </td>
        <td className="px-2 py-1">
          Menandakan sel yang sedang dipilih sebagai target input / edit
        </td>
      </tr>

    </tbody>
  </table>
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
              className={`h-[32px] w-[32px] bg-muted rounded border-[0.5px] ${!l.selectedWorker || !l.selectedDay || !l.selectedShift || !l.selectedType
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-primary"
                }`}
            >
              -
            </button>

            <button
              disabled={!l.selectedWorker || !l.selectedDay || !l.selectedShift || !l.selectedType}
              onClick={l.increment}
              className={`h-[32px] w-[32px] bg-muted rounded border-[0.5px] ${!l.selectedWorker || !l.selectedDay || !l.selectedShift || !l.selectedType
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-primary"
                }`}
            >
              +
            </button>
            <input
              type="number"
              min={0}
              className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 w-[80px] font-mono
    ${!l.selectedWorker || !l.selectedDay || !l.selectedShift || !l.selectedType
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-text"
                }`}
              value={l.manualInput}
              onChange={e => l.setManualInput(Number(e.target.value))}
              disabled={!l.selectedWorker || !l.selectedDay || !l.selectedShift || !l.selectedType}
            />

            <button
              disabled={!l.selectedWorker || !l.selectedDay || !l.selectedShift || !l.selectedType}
              onClick={l.applyManualInput}
              className={`h-[32px] px-3 rounded border-[0.5px]
    ${!l.selectedWorker || !l.selectedDay || !l.selectedShift || !l.selectedType
                  ? "cursor-not-allowed opacity-50 bg-primary/40 text-white"
                  : "cursor-pointer bg-primary/80 text-white hover:border-primary"
                }`}
            >
              Set
            </button>

            <button
              disabled={!l.selectedWorker || !l.selectedDay || !l.selectedShift}
              onClick={l.resetCell}
              className={`h-[32px] px-3 bg-error/80 text-white rounded border-[0.5px] ${!l.selectedWorker || !l.selectedDay || !l.selectedShift
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-error"
                }`}
            >
              Reset Sel
            </button>
            <button
              disabled={!l.selectedWorker}
              onClick={l.resetWorker}
              className={`h-[32px] px-3 bg-error/80 text-white rounded border-[0.5px] ${!l.selectedWorker
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-error"
                }`}
            >
              Reset Worker
            </button>
          </div>

          <div className="flex gap-2">
            <button
              disabled={l.isLocked}
              onClick={l.clearAll}
              className={`h-[32px] px-3 bg-error/80 text-white rounded border-[0.5px] ${l.isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-error"
                }`}
            >
              Clear ALL
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckSheetDefectCause
