import { getColTotal } from "./CheckSheetDefectiveItemLogic";
import { useDefectiveItemLogic } from "./CheckSheetDefectiveItemLogic";

const CheckSheetDefectiveItem = () => {
  const l = useDefectiveItemLogic();

  return (
    <div className="text-[14px] space-y-4 select-none">

      <div className="flex justify-between items-center px-3 py-2 border border-border rounded bg-card shadow-sm">

        <div className="font-semibold">Defective Item Check Sheet</div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(l.getShareLink())}
            className="h-[32px] px-4 bg-primary text-white rounded border-[0.5px] cursor-pointer hover:border-primary"
          >
            Share Link
          </button>


          <button
            onClick={l.doExportPDF}
            className="h-[32px] px-4 bg-secondary text-white rounded border-[0.5px] cursor-pointer hover:border-primary"
          >
            Export PDF
          </button>

          <button
            onClick={l.doExportExcel}
            className="h-[32px] px-4 bg-success text-white rounded border-[0.5px] cursor-pointer hover:border-primary"
          >
            Export Excel
          </button>

          <button
            onClick={l.doExportCSV}
            className="h-[32px] px-4 bg-muted text-foreground rounded border-[0.5px] cursor-pointer hover:border-primary"
          >
            Export CSV
          </button>

          <button
            onClick={() => l.setIsLocked(!l.isLocked)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm border-[0.5px] cursor-pointer ${l.isLocked
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
            <thead className="bg-card text-secondary sticky top-0 z-10">
              <tr>

                {/* SORT NAME */}
                <th
                  className="px-3 py-3 text-left border border-border cursor-pointer select-none hover:bg-primary/10"
                  onClick={() => l.setSort("name")}
                >
                  <span className="flex items-center gap-1">
                    Jenis Defect
                    {l.sortKey === "name" && (
                      <span className="text-xs">{l.sortAsc ? "▲" : "▼"}</span>
                    )}
                  </span>
                </th>

                {/* SORT PER DAY */}
                {l.days.map(day => (
                  <th
                    key={day}
                    className="px-3 py-2 text-center font-mono border border-border cursor-pointer select-none hover:bg-primary/10"
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

                {/* SORT TOTAL */}
                <th
                  className="px-3 py-2 text-center font-mono border border-border cursor-pointer select-none hover:bg-primary/10"
                  onClick={() => l.setSort("total")}
                >
                  <span className="flex items-center justify-center gap-1">
                    Total
                    {l.sortKey === "total" && (
                      <span className="text-xs">{l.sortAsc ? "▲" : "▼"}</span>
                    )}
                  </span>
                </th>

                {/* SORT PERCENT */}
                <th
                  className="px-3 py-2 text-center font-mono border border-border cursor-pointer select-none hover:bg-primary/10"
                  onClick={() => l.setSort("pct")}
                >
                  <span className="flex items-center justify-center gap-1">
                    %
                    {l.sortKey === "pct" && (
                      <span className="text-xs">{l.sortAsc ? "▲" : "▼"}</span>
                    )}
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {l.sortedCategories.map((c, rowIndex) => {
                const total = l.getRowTotal(c)
                const pct = l.allTotal > 0 ? (total / l.allTotal) * 100 : 0

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-primary/5 transition-colors select-none"
                  >
                    <td className="px-3 py-2 text-sm border border-border">
                      {c.name}
                    </td>

                    {l.days.map((day, colIndex) => (
                      <td
                        key={day}
                        ref={el => {
                          if (!l.cellRefs.current[rowIndex]) l.cellRefs.current[rowIndex] = []
                          l.cellRefs.current[rowIndex][colIndex] = el
                        }}
                        tabIndex={0}
                        onFocus={() => {
                          l.setSelectedCat(c.id)
                          l.setSelectedDay(day)
                          l.setCellBuffer("")
                        }}
                        onKeyDown={e => l.handleCellKeyDown(e, rowIndex, colIndex)}
                        onClick={() => {
                          l.setSelectedCat(c.id)
                          l.setSelectedDay(day)
                        }}
                        className={`text-center font-mono border border-border px-3 py-2 cursor-pointer transition-colors
                ${l.selectedCat === c.id && l.selectedDay === day
                            ? "bg-primary/20 border-primary text-primary font-bold"
                            : "hover:bg-primary/10 hover:text-primary hover:border-primary"
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
                  </tr>
                )
              })}
            </tbody>

            <tfoot className="bg-bg font-semibold border-t border-border">
              <tr>
                <td className="px-3 py-2 text-center border border-border">TOTAL</td>
                {l.days.map(day => (
                  <td key={day} className="px-3 py-2 text-center font-mono border border-border">
                    {getColTotal(l.categories, day)}
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-bold font-mono border border-border">{l.allTotal}</td>
                <td className="px-3 py-2 text-center text-secondary border border-border">100%</td>
              </tr>
            </tfoot>
          </table>


        </div>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">

        <div className="flex items-center gap-2">
          <h4>Kolom Jenis</h4>
          <span className="px-3 py-1 border-[0.5px] border-border rounded bg-bg text-xs">
            {l.selectedCat ? l.categories.find(c => c.id === l.selectedCat)?.name : "-"}
          </span>
          <h4>Kolom Hari</h4>
          <span className="px-3 py-1 border-[0.5px] border-border rounded bg-bg text-xs">
            {l.selectedDay || "-"}
          </span>
        </div>

        <div className="flex gap-2 justify-between">
          <div className="flex gap-2">
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

          <div className="flex gap-2">
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
  );
};

export default CheckSheetDefectiveItem;
