import { getColTotal } from "./CheckSheetDefectiveItemLogic";
import { useDefectiveItemLogic } from "./CheckSheetDefectiveItemLogic";
import { importExcelChecksheet } from "../../utils/dataio/excel/excel"
import { importCSVChecksheet } from "../../utils/dataio/csv/csv"
import { useState, useRef } from "react"
import { HiChevronDown, HiDocumentArrowUp, HiDocumentArrowDown, HiDocumentText, HiDocumentCheck, HiDocumentDuplicate, HiShare } from "react-icons/hi2"


const CheckSheetDefectiveItem = () => {
  const l = useDefectiveItemLogic();
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const exportAreaRef = useRef<HTMLDivElement>(null)
  const importRef = useRef<HTMLDivElement>(null)


  return (
    <div ref={exportAreaRef} id="checkshet-export-area">
      <div className="text-[14px] space-y-4 select-none">

    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-3 py-2 border border-border rounded bg-card shadow-sm">

          <div className="font-semibold">Defective Item Check Sheet</div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">

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
                <HiChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${showImport ? "rotate-180" : ""}`}
                />
              </button>

              {showImport && (
                <div className="absolute right-0 mt-1 w-[160px] bg-card border border-border rounded shadow text-sm z-50">

                  <label
                    htmlFor="importExcel"
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20"
                  >
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
                      importExcelChecksheet(file, (d) => {
                        l.setDays(d.days)
                        l.setCategories(d.categories)
                        l.setCustomFields(d.customFields)
                        l.setMetadata(d.metadata)
                      })
                      setShowImport(false)
                    }}
                  />

                  <label
                    htmlFor="importCSV"
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/20"
                  >
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
                      importCSVChecksheet(file, (d) => {
                        l.setDays(d.days)
                        l.setCategories(d.categories)
                        l.setCustomFields(d.customFields)
                        l.setMetadata(d.metadata)
                      })
                      setShowImport(false)
                    }}
                  />

                </div>
              )}
            </div>

            <div className="relative">
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
                    onClick={() => {
                     l.doExportPDF()
                      setShowExport(false);
                    }}
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
                  {!l.isLocked && f !== "date" && (
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
                  disabled={l.isLocked}
                  type="date"
                  className={`h-[32px] bg-bg text-foreground border-[0.5px] border-border rounded px-2 w-full 
      appearance-none 
      placeholder:text-muted
      focus:outline-none focus:outline-[2px] focus:outline-primary
      ${l.isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary"}
    `}
                  value={l.metadata.date}
                  onChange={e => l.setMetadata({ ...l.metadata, date: e.target.value })}
                />

                <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                  📅
                </span>
              </div>


            </div>

         <div className="flex flex-wrap gap-2 sm:justify-end">
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
                className={`h-[32px] px-3 bg-muted text-foreground rounded border-[0.5px] ${l.isLocked
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:border-primary"
                  }`}
              >
                +
              </button>
            </div>
          </div>

          <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">

            <div className="flex border-b border-border text-sm">
              <button
                onClick={() => l.setActiveTab("day")}
                className={`flex-1 py-1 cursor-pointer ${l.activeTab === "day"
                  ? "border-b-2 border-primary text-primary"
                  : "opacity-50 hover:border-primary hover:border-b"
                  }`}
              >
                Hari
              </button>
              <button
                onClick={() => l.setActiveTab("cat")}
                className={`flex-1 py-1 cursor-pointer ${l.activeTab === "cat"
                  ? "border-b-2 border-primary text-primary"
                  : "opacity-50 hover:border-primary hover:border-b"
                  }`}
              >
                Kategori
              </button>
            </div>

            {l.activeTab === "day" && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    disabled={l.isLocked}
                    className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 col-span-2 ${l.isLocked ? "cursor-not-allowed" : "cursor-text"
                      }`}
                    value={l.newDay}
                    placeholder="Hari Baru"
                    onChange={e => l.setNewDay(e.target.value)}
                    onKeyDown={e => e.stopPropagation()}
                  />

                  <button
                    disabled={l.isLocked}
                    onClick={l.addDay}
                    className={`h-[32px] px-3 bg-muted text-foreground rounded border-[0.5px] ${l.isLocked
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:border-primary"
                      }`}
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {l.days.map(d => (
                    <div key={d} className="flex items-center gap-1">
                      <input
                        disabled={l.isLocked}
                        className="px-2 py-1 border-[0.5px] border-border rounded text-xs bg-bg cursor-text w-[70px]"
                        defaultValue={d}
                        onBlur={e => l.renameDay(d, e.target.value)}
                        onKeyDown={e => e.stopPropagation()}
                      />

                      {!l.isLocked && (
                        <button
                          onClick={() => l.removeDay(d)}
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

            {l.activeTab === "cat" && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    disabled={l.isLocked}
                    className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 col-span-2 ${l.isLocked ? "cursor-not-allowed" : "cursor-text"
                      }`}
                    value={l.inputCat}
                    placeholder="Nama Kategori"
                    onChange={e => l.setInputCat(e.target.value)}
                    onKeyDown={e => e.stopPropagation()}
                  />

                  <button
                    disabled={l.isLocked}
                    onClick={l.addCategory}
                    className={`h-[32px] px-3 bg-muted text-foreground rounded border-[0.5px] ${l.isLocked
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:border-primary"
                      }`}
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {l.categories.map(c => (
                    <div key={c.id} className="flex items-center gap-1">
                      <input
                        disabled={l.isLocked}
                        className="px-2 py-1 border-[0.5px] border-border rounded text-xs bg-bg cursor-text w-[120px]"
                        value={c.name}
                        onChange={e => l.renameCategory(c.id, e.target.value)}
                        onKeyDown={e => e.stopPropagation()}
                      />

                      {!l.isLocked && (
                        <button
                          onClick={() => l.removeCategory(c.id)}
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
                  <th className="px-2 py-2 text-center border border-primary w-[40px]">
                    No
                  </th>

                  <th
                    className="px-3 py-3 text-left border border-primary cursor-pointer select-none hover:bg-primary-hover"
                    onClick={() => l.setSort("name")}
                  >
                    <span className="flex items-center gap-1">
                      Jenis Defect
                      {l.sortKey === "name" && (
                        <span className="text-xs">{l.sortAsc ? "▲" : "▼"}</span>
                      )}
                    </span>
                  </th>

                  {l.days.map(day => (
                    <th
                      key={day}
                      className="px-3 py-2 text-center font-mono border border-primary cursor-pointer select-none hover:bg-primary-hover"
                      onClick={() => l.setSort(day)}
                    >
                      <span className="flex items-center justify-center gap-1">
                        {day}
                        {l.sortKey === day && (
                          <span className="text-xs">{l.sortAsc ? "▲" : "▼"}</span>
                        )}
                      </span>
                    </th>
                  ))}

                  <th
                    className="px-3 py-2 text-center font-mono border border-primary cursor-pointer select-none hover:bg-primary-hover"
                    onClick={() => l.setSort("total")}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Total
                      {l.sortKey === "total" && (
                        <span className="text-xs">{l.sortAsc ? "▲" : "▼"}</span>
                      )}
                    </span>
                  </th>

                  <th
                    className="px-3 py-2 text-center font-mono border border-primary cursor-pointer select-none hover:bg-primary-hover"
                    onClick={() => l.setSort("pct")}
                  >
                    <span className="flex items-center justify-center gap-1">
                      %
                      {l.sortKey === "pct" && (
                        <span className="text-xs">{l.sortAsc ? "▲" : "▼"}</span>
                      )}
                    </span>
                  </th>

                  <th className="px-3 py-2 text-center font-mono border border-primary">
                    Cum %
                  </th>
                </tr>
              </thead>


              <tbody>
                {(() => {
                  let running = 0
                  return l.sortedCategories.map((c, rowIndex) => {
                    const total = l.getRowTotal(c)
                    const pct = l.allTotal > 0 ? (total / l.allTotal) * 100 : 0
                    running += pct

                    return (
                      <tr key={c.id} className="hover:bg-primary/5 transition-colors select-none">
                        <td className="px-2 py-2 text-center border border-border text-xs">
                          {rowIndex + 1}
                        </td>
                        <td className="px-3 py-2 text-sm border border-border">
                          {c.name}
                        </td>
                        {l.days.map((day) => (
                          <td
                            key={day}
                            tabIndex={0}
                            contentEditable={!l.isLocked && l.selectedCat === c.id && l.selectedDay === day}
                            suppressContentEditableWarning={true}
                            onFocus={() => {
                              l.setSelectedCat(c.id)
                              l.setSelectedDay(day)
                              l.setManualInput(c.counts[day])
                            }}
                            onClick={() => {
                              l.setSelectedCat(c.id)
                              l.setSelectedDay(day)
                            }}
                            onInput={e => {
                              const v = Number(e.currentTarget.innerText)
                              if (!isNaN(v)) l.setManualInput(v)
                            }}
                            onBlur={() => l.applyManualInput()}
                            className={`text-center font-mono border border-border px-3 py-2 focus:outline-none transition-colors
      ${l.selectedCat === c.id && l.selectedDay === day
                                ? "cursor-text bg-primary/20 text-primary font-bold"
                                : "cursor-pointer hover:bg-primary/10 hover:text-primary"
                              }
    `}
                          >
                            {c.counts[day]}
                          </td>
                        ))}



                        <td className="text-center font-bold font-mono border border-border px-3 py-2">
                          {total}
                        </td>

                        <td className="text-center font-mono border border-border px-3 py-2">
                          {pct.toFixed(1)}%
                        </td>

                        <td className="text-center font-mono border border-border px-3 py-2">
                          {running.toFixed(1)}%
                        </td>
                      </tr>
                    )
                  })
                })()}
              </tbody>


              <tfoot className="bg-bg font-semibold border-t border-border">
                <tr>
                  <td className="px-3 py-2 text-center border border-border text-secondary">

                  </td>

                  <td className="px-3 py-2 text-center border border-border">TOTAL</td>
                  {l.days.map(day => (
                    <td key={day} className="px-3 py-2 text-center font-mono border border-border">
                      {getColTotal(l.categories, day)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center font-bold font-mono border border-border">{l.allTotal}</td>
                  <td className="px-3 py-2 text-center text-secondary border border-border">100%</td>
                  <td className="px-3 py-2 text-center text-secondary border border-border">100%</td>
                </tr>
              </tfoot>

            </table>


          </div>
        </div>
        <div className="p-4 border border-primary rounded bg-primary/5 shadow-md space-y-4">
          <div className="text-[15px] font-bold text-primary uppercase tracking-wide">
            Kesimpulan
          </div>

          {l.allTotal === 0 ? (
            <div className="text-sm text-secondary italic">
              Masukkan data defect terlebih dahulu untuk memunculkan rekomendasi.
            </div>
          ) : (
            <div className="space-y-4 text-sm">

              <div className="p-3 border-l-4 border-primary bg-primary/10 rounded">
                <div className="text-[13px] font-semibold text-primary">
                  Defect dominan (Pareto ≤ 80%)
                </div>
                <div className="text-[13px] font-medium">
                  {l.focusDefects.length === 0
                    ? "Belum ada defect yang menonjol."
                    : `${l.focusDefects.map(x => x.name).join(", ")} mencakup sekitar ${l.focusCoverage.toFixed(1)}% dari total defect`}
                </div>
              </div>

              <div className="p-3 border-l-4 border-error bg-error/10 rounded">
                <div className="text-[13px] font-semibold text-error">
                  Hari/shift paling bermasalah
                </div>
                <div className="text-[13px] font-medium">
                  {l.worstDay.total === 0
                    ? "Belum ada hari yang dominan."
                    : `${l.worstDay.day} memiliki jumlah defect tertinggi (${l.worstDay.total})`}
                </div>
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
                <td className="px-2 py-1 w-[140px] flex items-center gap-2">
                  🔢 <b>No</b>
                </td>
                <td className="px-2 py-1">Urutan ranking defect berdasarkan total kejadian</td>
              </tr>

              <tr className="border-b border-border">
                <td className="px-2 py-1 flex items-center gap-2">
                  🏷️ <b>Jenis Defect</b>
                </td>
                <td className="px-2 py-1">Nama kategori defect yang diamati</td>
              </tr>

              <tr className="border-b border-border">
                <td className="px-2 py-1 flex items-center gap-2">
                  📆 <b>Kolom Hari</b>
                </td>
                <td className="px-2 py-1">Frekuensi defect per hari atau shift</td>
              </tr>

              <tr className="border-b border-border">
                <td className="px-2 py-1 flex items-center gap-2">
                  ➕ <b>Total</b>
                </td>
                <td className="px-2 py-1">Jumlah keseluruhan defect pada kategori tersebut</td>
              </tr>

              <tr className="border-b border-border">
                <td className="px-2 py-1 flex items-center gap-2">
                  📊 <b>%</b>
                </td>
                <td className="px-2 py-1">Persentase defect terhadap total keseluruhan</td>
              </tr>

              <tr className="border-b border-border">
                <td className="px-2 py-1 flex items-center gap-2">
                  🔴 <b>Cum %</b>
                </td>
                <td className="px-2 py-1">Persentase kumulatif untuk analisis Pareto</td>
              </tr>

              <tr>
                <td className="px-2 py-1 flex items-center gap-2">
                  🟦 <b>Cell biru</b>
                </td>
                <td className="px-2 py-1">Menandakan sel yang sedang dipilih / difokuskan</td>
              </tr>

            </tbody>
          </table>
        </div>

        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
          <div className="font-semibold flex items-center gap-2">
            Tahapan Selanjutnya
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span>📊</span>
            <span>Gunakan Pareto untuk melihat dominasi defect sampai cumulative 80%.</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span>📈</span>
            <span>Gunakan histogram jika ingin melihat pola distribusi defect antar hari/shift.</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span>🔍</span>
            <span>Jadikan hasil visual ini sebagai dasar analisa akar penyebab berikutnya.</span>
          </div>
        </div>




        <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">

         <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <h4>Kolom Jenis</h4>
            <span className="px-3 py-1 border-[0.5px] border-border rounded bg-bg text-xs">
              {l.selectedCat ? l.categories.find(c => c.id === l.selectedCat)?.name : "-"}
            </span>
            <h4>Kolom Hari</h4>
            <span className="px-3 py-1 border-[0.5px] border-border rounded bg-bg text-xs">
              {l.selectedDay || "-"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button
                disabled={!l.selectedCat || !l.selectedDay}
                onClick={l.decrement}
                className={`h-[32px] w-[32px] bg-muted rounded border-[0.5px] ${!l.selectedCat || !l.selectedDay
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:border-primary"
                  }`}
              >
                -
              </button>
              <button
                disabled={!l.selectedCat || !l.selectedDay}
                onClick={l.increment}
                className={`h-[32px] w-[32px] bg-muted rounded border-[0.5px] ${!l.selectedCat || !l.selectedDay
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:border-primary"
                  }`}
              >
                +
              </button>
              <input
                type="number"
                min={0}
                className={`h-[32px] bg-bg border-[0.5px] border-border rounded px-2 w-[120px] font-mono ${!l.selectedCat || !l.selectedDay ? "cursor-not-allowed" : "cursor-text"
                  }`}
                value={l.manualInput}
                onChange={e => l.setManualInput(Number(e.target.value))}
                disabled={!l.selectedCat || !l.selectedDay}
              />
              <button
                disabled={!l.selectedCat || !l.selectedDay}
                onClick={l.applyManualInput}
                className={`h-[32px] px-3 rounded border-[0.5px] ${!l.selectedCat || !l.selectedDay
                  ? "cursor-not-allowed opacity-50 bg-primary/40 text-white"
                  : "cursor-pointer bg-primary/80 text-white hover:border-primary"
                  }`}
              >
                Set
              </button>
              <button
                disabled={!l.selectedCat}
                onClick={l.resetRow}
                className={`h-[32px] px-3 rounded border-[0.5px] ${!l.selectedCat
                  ? "cursor-not-allowed opacity-50 bg-error/40 text-white"
                  : "cursor-pointer bg-error/80 text-white hover:border-error"
                  }`}
              >
                Reset
              </button>
            </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
              <button
                onClick={l.clearAll}
                className="h-[32px] px-3 bg-error/60 text-white rounded border-[0.5px] cursor-pointer hover:border-error"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckSheetDefectiveItem;
