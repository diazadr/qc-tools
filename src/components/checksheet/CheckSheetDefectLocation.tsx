import { useDefectLocationLogic } from "./CheckSheetDefectLocationLogic"
import { useState, useRef } from "react"
import { HiChevronDown, HiDocumentArrowDown, HiDocumentText, HiDocumentCheck, HiDocumentDuplicate, HiShare } from "react-icons/hi2"

const CheckSheetDefectLocation = () => {
  const l = useDefectLocationLogic()
  const [showExport, setShowExport] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  return (
    <div className="text-[14px] space-y-4 select-none">

      <div className="flex justify-between items-center px-3 py-2 border border-border rounded bg-card shadow-sm">

        <div className="font-semibold">Defect Location Check Sheet</div>
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
        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
          <div className="font-medium text-sm">Informasi Produksi</div>
          <div className="grid grid-cols-2 gap-2">
            {l.customFields.map(f => (
              <div key={f} className="flex items-center gap-1">
                <input
                  disabled={l.locked}
                  className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 w-full ${l.locked ? "cursor-not-allowed" : "cursor-text"
                    }`}

                  value={l.metadata[f] || ""}
                  placeholder={f}
                  onChange={e => l.setMetadata({ ...l.metadata, [f]: e.target.value })}
                  onKeyDown={e => e.stopPropagation()}
                />
                {!l.locked && (
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
                type="text"
                placeholder="YYYY-MM-DD"
                className={`h-[32px] bg-bg text-foreground border-[0.5px] border-border rounded pl-2 pr-7 w-full 
      placeholder:text-muted
      focus:outline-none focus:outline-[2px] focus:outline-primary
      ${l.locked ? "cursor-not-allowed opacity-60" : "cursor-text hover:border-primary"}
    `}
                value={l.metadata.Date}
                onChange={e => l.setMetadata({ ...l.metadata, Date: e.target.value })}
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
              disabled={l.locked}
              className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 flex-1 ${l.locked ? "cursor-not-allowed" : "cursor-text"
                }`}
              placeholder="Field Baru ..."
              value={l.newField}
              onChange={e => l.setNewField(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
            />

            <button
              disabled={l.locked}
              onClick={l.addField}
              className={`h-[32px] px-3 bg-muted text-foreground rounded border-[0.5px] ${l.locked ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary"
                }`}
            >
              +
            </button>
          </div>
        </div>


        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">

          <div className="font-medium text-sm">Defect Input</div>

          <div className="grid grid-cols-2 gap-2">
            <input
              disabled={l.locked}
              value={l.defectType}
              onChange={e => l.setDefectType(e.target.value)}
              className="h-[32px] bg-bg border border-border rounded px-2"
              placeholder="Defect Type"
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
              className="h-[32px] bg-bg border border-border rounded px-2 col-span-2"
              placeholder="Comment"
            />
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-2">
          <div className="font-medium text-sm">Circular Config</div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {l.circular.map(c => (
              <div key={c} className="flex items-center gap-2">
                <input
                  className="h-[28px] border border-border bg-bg rounded px-2 w-[64px] text-center"
                  defaultValue={c}
                  onBlur={e => l.renameCircular(c, e.target.value)}
                  disabled={l.locked}
                />
                <button
                  onClick={() => l.deleteCircular(c)}
                  className="text-red-500 border px-2 rounded h-[28px]"
                  disabled={l.locked}
                >
                  X
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={l.addCircular}
            className="text-xs px-2 py-1 border rounded"
            disabled={l.locked}
          >
            + Add Circular
          </button>
        </div>


        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-2">
          <div className="font-medium text-sm">Radial Config</div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {l.radial.map(r => (
              <div key={r} className="flex items-center gap-2">
                <input
                  type="number"
                  className="h-[28px] border border-border bg-bg rounded px-2 w-[64px] text-center"
                  defaultValue={r}
                  onBlur={e => l.renameRadial(r, Number(e.target.value))}
                  disabled={l.locked}
                />
                <button
                  onClick={() => l.deleteRadial(r)}
                  className="text-red-500 border px-2 rounded h-[28px]"
                  disabled={l.locked}
                >
                  X
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={l.addRadial}
            className="text-xs px-2 py-1 border rounded"
            disabled={l.locked}
          >
            + Add Radial
          </button>
        </div>


      </div>



      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
        <div className="overflow-auto max-h-[480px] scroll-m-0">
          <table className="w-full text-sm border-separate border-spacing-0 border border-border">

            <thead className="bg-primary text-white sticky top-0 z-10">
              <tr>
                <th className="relative w-[80px] h-[50px] border border-primary overflow-hidden text-center">

                  {/* garis diagonal */}
                  <div className="absolute left-[-40px] bottom-1/2 w-[160px] h-[2px] bg-white rotate-[45deg]" />

                  {/* Circular (bawah kiri) */}
                  <span className="absolute bottom-[4px] left-[6px] text-[10px] font-semibold whitespace-nowrap">
                    Circular
                  </span>

                  {/* Radial (atas kanan) */}
                  <span className="absolute top-[4px] right-[6px] text-[10px] font-semibold whitespace-nowrap">
                    Radial
                  </span>

                </th>





                {l.radial.map(r => (
                  <th
                    key={r}
                    className="px-3 py-2 text-center font-mono border border-primary cursor-pointer select-none hover:bg-primary-hover"
                    onClick={() => { l.setSelectedRad(r); l.setSort("circ") }}
                  >
                    <span className="flex items-center justify-center gap-1">
                      {r}
                    </span>
                  </th>
                ))}

                <th className="px-3 py-2 text-center font-mono border border-primary cursor-pointer select-none hover:bg-primary-hover"
                  onClick={() => l.setSort("total")}
                >
                  <span className="flex items-center justify-center gap-1">
                    Total
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {l.circular.map(c => {
                return (
                  <tr key={c} className="hover:bg-primary/5 transition-colors select-none">

                    <td className="px-3 py-2 border border-border font-medium text-secondary cursor-pointer"
                      onClick={() => l.setSelectedCirc(c)}
                    >
                      {c}
                    </td>

                    {l.radial.map(r => {
                      const val = l.getCell(c, r)
                      const sel = l.selectedCirc === c && l.selectedRad === r
                      return (
                        <td
                          key={r}
                          className={`text-center font-mono border border-border px-3 py-2 focus:outline-none transition-colors
                          ${sel
                              ? "cursor-text bg-primary/20 text-primary font-bold"
                              : "cursor-pointer hover:bg-primary/10 hover:text-primary"
                            }
                          `}
                          onClick={() => {
                            l.setSelectedCirc(c)
                            l.setSelectedRad(r)
                          }}
                        >
                          <div className="flex flex-col items-center leading-none">
                            <span>{val}</span>

                            {val > 0 && (
                              <>
                                <span className="text-[9px] text-muted italic">
                                  {l.getCellDefect(c, r)}
                                </span>

                                <span
                                  className={`text-[8px] mt-[1px] px-1 rounded 
          ${l.getCellSeverity(c, r) === "Minor" ? "bg-yellow-200 text-yellow-900" : ""}
          ${l.getCellSeverity(c, r) === "Major" ? "bg-orange-200 text-orange-900" : ""}
          ${l.getCellSeverity(c, r) === "Critical" ? "bg-red-200 text-red-900" : ""}
        `}
                                >
                                  {l.getCellSeverity(c, r)}
                                </span>
                              </>
                            )}
                          </div>

                        </td>
                      )
                    })}

                    <td className="text-center font-bold font-mono border border-border px-3 py-2">
                      {l.totalRow(c)}
                    </td>

                  </tr>
                )
              })}
            </tbody>

            <tfoot className="bg-bg font-semibold border-t border-border">
              <tr>
                <td className="px-3 py-2 text-center border border-border">TOTAL</td>
                {l.radial.map(r => (
                  <td key={r} className="px-3 py-2 text-center font-mono border border-border">
                    {l.totalCol(r)}
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-bold font-mono border border-border">{l.totalAll}</td>
              </tr>
            </tfoot>

          </table>
        </div>
      </div>
      <div className="p-4 border border-primary rounded bg-primary/5 shadow-md space-y-4">
        <div className="text-[15px] font-bold text-primary uppercase tracking-wide">
          Kesimpulan Lokasi
        </div>

        {l.totalAll === 0 ? (
          <div className="text-sm text-secondary italic">
            Masukkan data defect terlebih dahulu untuk memunculkan analisa lokasi.
          </div>
        ) : (
          <div className="space-y-4 text-sm">

            <div className="p-3 border-l-4 border-primary bg-primary/10 rounded">
              <div className="text-[13px] font-semibold text-primary">
                Area dominan (Pareto ≤ 80%)
              </div>
              <div className="text-[13px] font-medium">
                {l.focusLocations.length === 0
                  ? "Tidak ada area dominan."
                  : `${l.focusLocations.map(x => x.circ).join(", ")} mencakup sekitar ${Math.min(100, l.focusLocations[l.focusLocations.length - 1].cumPct).toFixed(1)}% dari total defect`}
              </div>
            </div>

            <div className="p-3 border-l-4 border-error bg-error/10 rounded">
              <div className="text-[13px] font-semibold text-error">
                Lokasi paling bermasalah
              </div>
              <div className="text-[13px] font-medium">
                {l.worstLocation == null
                  ? "Belum ada lokasi bermasalah."
                  : `Lokasi ${l.worstLocation} memiliki jumlah defect tertinggi (${l.totalRow(l.worstLocation)})`}
              </div>
            </div>

          </div>
        )}
      </div>
      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
        <div className="font-semibold flex items-center gap-2">
          Keterangan Tabel (Defect Location)
        </div>

        <table className="w-full text-sm border border-border rounded overflow-hidden">
          <tbody className="[&_tr:nth-child(even)]:bg-muted/20">

            <tr className="border-b border-border">
              <td className="px-2 py-1 w-[140px] flex items-center gap-2">
                🟩 <b>Circular (baris)</b>
              </td>
              <td className="px-2 py-1">
                Posisi keliling (misalnya sektor A–H)
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1 flex items-center gap-2">
                🟥 <b>Radial (kolom)</b>
              </td>
              <td className="px-2 py-1">
                Posisi arah radius dari pusat ke luar (misalnya 1–10)
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1 flex items-center gap-2">
                🔢 <b>Nilai sel</b>
              </td>
              <td className="px-2 py-1">
                Jumlah defect pada titik lokasi tertentu (Circular & Radial)
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1 flex items-center gap-2">
                🏷️ <b>Jenis Defect</b>
              </td>
              <td className="px-2 py-1">
                Ditampilkan kecil di bawah nilai sel jika jumlah &gt; 0
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1 flex items-center gap-2">
                🔴 <b>Severity</b>
              </td>
              <td className="px-2 py-1">
                Menunjukkan tingkat keparahan (Minor, Major, Critical) dengan warna label
              </td>
            </tr>

            <tr className="border-b border-border">
              <td className="px-2 py-1 flex items-center gap-2">
                🟦 <b>Cell biru</b>
              </td>
              <td className="px-2 py-1">
                Menandakan sel yang sedang dipilih / difokuskan
              </td>
            </tr>

            <tr>
              <td className="px-2 py-1 flex items-center gap-2">
                ➕ <b>Total</b>
              </td>
              <td className="px-2 py-1">
                Jumlah keseluruhan defect per Circular maupun total keseluruhan
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">

        <div className="flex items-center gap-2">
          <h4>Kolom Circular</h4>
          <span className="px-3 py-1 border-[0.5px] border-border rounded bg-bg text-xs">
            {l.selectedCirc || "-"}
          </span>
          <h4>Kolom Radial</h4>
          <span className="px-3 py-1 border-[0.5px] border-border rounded bg-bg text-xs">
            {l.selectedRad || "-"}
          </span>
        </div>

        <div className="flex gap-2 justify-between">
     <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3 relative">

  <div className="flex gap-2">
    <button
      disabled={!l.selectedCirc || !l.selectedRad || !l.defectType}
      onClick={l.decrement}
      className={`h-[32px] w-[32px] bg-muted rounded border-[0.5px] ${!l.selectedCirc || !l.selectedRad
        ? "cursor-not-allowed opacity-50"
        : "cursor-pointer hover:border-primary"
        }`}
    >
      -
    </button>

    <button
      disabled={!l.selectedCirc || !l.selectedRad || !l.defectType}
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
      disabled={!l.selectedCirc || !l.selectedRad || !l.defectType}
    />

    <button
      disabled={!l.selectedCirc || !l.selectedRad || !l.defectType}
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
      onClick={() => l.setCellValue(l.selectedCirc!, l.selectedRad!, 0)}
      className={`h-[32px] px-3 rounded border-[0.5px] ${!l.selectedCirc
        ? "cursor-not-allowed opacity-50 bg-error/40 text-white"
        : "cursor-pointer bg-error/80 text-white hover:border-error"
        }`}
    >
      Reset
    </button>
  </div>

  {!l.defectType && (
    <div className="absolute bottom-1 left-1 text-error text-xs italic">
      Isi defect type terlebih dahulu
    </div>
  )}

</div>



          <div className="flex gap-2">
            <button
              onClick={() => {
                l.circular.forEach(c => {
                  l.radial.forEach(r => l.setCellValue(c, r, 0))
                })
              }}
              className="h-[32px] px-3 bg-error/60 text-white rounded border-[0.5px] cursor-pointer hover:border-error"
            >
              Clear
            </button>
          </div>
        </div>
      </div>


    </div>
  )
}

export default CheckSheetDefectLocation
