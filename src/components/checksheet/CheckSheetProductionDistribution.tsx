import { useEffect, useState } from "react";
import { useChecksheetStore } from "../../store/useChecksheetStore";

interface DevRow {
  deviation: number;
  count: number;
}

interface SnapshotDistribution {
  target: number;
  LSL: number;
  USL: number;
  binSize: number;
  unit: string;

  date: string;
  shift: string;
  line: string;
  operator: string;
  product: string;
  characteristic: string;
  note: string;

  rows: DevRow[];
  locked: boolean;
}

const CheckSheetProductionDistribution = () => {
  const store = useChecksheetStore();

  const [target, setTarget] = useState<number>(8.3);
  const [LSL, setLSL] = useState<number>(-8);
  const [USL, setUSL] = useState<number>(8);
  const [binSize, setBinSize] = useState<number>(0.001);
  const [unit, setUnit] = useState<string>("mm");

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState<string>("");
  const [line, setLine] = useState<string>("");
  const [operator, setOperator] = useState<string>("");
  const [product, setProduct] = useState<string>("");
  const [characteristic, setCharacteristic] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [rows, setRows] = useState<DevRow[]>(
    Array.from({ length: 21 }, (_, i) => ({
      deviation: i - 10,
      count: 0
    }))
  );

  const [selectedDev, setSelectedDev] = useState<number | null>(null);
  const [manualInput, setManualInput] = useState<number>(0);
  const [locked, setLocked] = useState<boolean>(false);

  const saveSnapshot = () => {
    const data: SnapshotDistribution = {
      target,
      LSL,
      USL,
      binSize,
      unit,
      date,
      shift,
      line,
      operator,
      product,
      characteristic,
      note,
      rows,
      locked
    };
    store.setSnapshot("distribution", data);
  };

  useEffect(() => {
    const snap = store.getSnapshot("distribution");
    if (!snap) return;
    const data = snap.data as SnapshotDistribution;

    setTarget(data.target);
    setLSL(data.LSL);
    setUSL(data.USL);
    setBinSize(data.binSize);
    setUnit(data.unit);

    setDate(data.date);
    setShift(data.shift);
    setLine(data.line);
    setOperator(data.operator);
    setProduct(data.product);
    setCharacteristic(data.characteristic);
    setNote(data.note);

    setRows(data.rows);
    setLocked(data.locked);
  }, []);

  const increment = () => {
    if (selectedDev === null || locked) return;
    setRows(prev => {
      const updated = prev.map(r =>
        r.deviation === selectedDev ? { ...r, count: r.count + 1 } : r
      );
      return updated;
    });
    saveSnapshot();
  };

  const decrement = () => {
    if (selectedDev === null || locked) return;
    setRows(prev => {
      const updated = prev.map(r =>
        r.deviation === selectedDev && r.count > 0 ? { ...r, count: r.count - 1 } : r
      );
      return updated;
    });
    saveSnapshot();
  };

  const applyManualInput = () => {
    if (selectedDev === null || locked) return;
    if (manualInput < 0) return;
    setRows(prev => {
      const updated = prev.map(r =>
        r.deviation === selectedDev ? { ...r, count: manualInput } : r
      );
      return updated;
    });
    setManualInput(0);
    saveSnapshot();
  };

  const clearSelected = () => {
    if (selectedDev === null || locked) return;
    setRows(prev => {
      const updated = prev.map(r =>
        r.deviation === selectedDev ? { ...r, count: 0 } : r
      );
      return updated;
    });
    saveSnapshot();
  };

  const clearAll = () => {
    if (locked) return;
    setRows(prev => prev.map(r => ({ ...r, count: 0 })));
    setSelectedDev(null);
    setManualInput(0);
    saveSnapshot();
  };

  // const toggleLock = () => {
  //   setLocked(prev => !prev);
  //   saveSnapshot();
  // };

  const totalCount = rows.reduce((s, r) => s + r.count, 0);
  const maxCount = Math.max(...rows.map(r => r.count), 1);

  const values = rows.flatMap(r => {
    if (r.count <= 0) return [];
    const actual = target + r.deviation * binSize;
    return Array.from({ length: r.count }, () => actual);
  });

  let meanActual = 0;
  let meanDeviation = 0;
  let stdDev = 0;
  let minActual = 0;
  let maxActual = 0;

  if (values.length > 0) {
    const n = values.length;
    const sum = values.reduce((s, v) => s + v, 0);
    meanActual = sum / n;
    meanDeviation = meanActual - target;
    minActual = Math.min(...values);
    maxActual = Math.max(...values);
    if (n > 1) {
      const varSum = values.reduce((s, v) => s + (v - meanActual) * (v - meanActual), 0);
      stdDev = Math.sqrt(varSum / (n - 1));
    }
  }

  const LSLActual = target + LSL * binSize;
  const USLActual = target + USL * binSize;

  let inSpec = 0;
  let outSpec = 0;
  rows.forEach(r => {
    const actual = target + r.deviation * binSize;
    if (r.count <= 0) return;
    if (actual < LSLActual || actual > USLActual) outSpec += r.count;
    else inSpec += r.count;
  });

  const outSpecPercent = totalCount > 0 ? (outSpec / totalCount) * 100 : 0;

  let Cp = 0;
  let Cpk = 0;
  if (stdDev > 0 && totalCount > 1) {
    Cp = (USLActual - LSLActual) / (6 * stdDev);
    const Cpu = (USLActual - meanActual) / (3 * stdDev);
    const Cpl = (meanActual - LSLActual) / (3 * stdDev);
    Cpk = Math.min(Cpu, Cpl);
  }

  const exportCSV = () => {
    const header = ["Deviation", "ActualValue", "Count", "Unit"];
    const lines = rows.map(r => {
      const actual = target + r.deviation * binSize;
      return [r.deviation.toString(), actual.toFixed(6), r.count.toString(), unit].join(",");
    });
    const all = [header.join(","), ...lines].join("\n");
    const blob = new Blob([all], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "production_distribution_checksheet.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="text-[14px] space-y-4 select-none">

      <div className="flex justify-between items-center px-3 py-2 border border-border rounded bg-card shadow-sm cursor-default">
        <div className="font-semibold">Production Process Distribution Check Sheet</div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm cursor-default ${locked ? "bg-error/15 text-error" : "bg-success/15 text-success"}`}>
          <span>{locked ? "🔒" : "🔓"}</span>
          <span>{locked ? "Locked" : "Unlocked"}</span>
        </div>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3 cursor-default">
        <div className="font-medium text-sm">Informasi Produksi</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input type="date" disabled={locked} value={date} onChange={e => setDate(e.target.value)}
            className={`h-[32px] bg-bg border border-border rounded px-2 w-full ${locked ? "cursor-not-allowed" : "cursor-text"}`}
          />
          <input disabled={locked} value={shift} onChange={e => setShift(e.target.value)}
            className={`h-[32px] bg-bg border border-border rounded px-2 w-full ${locked ? "cursor-not-allowed" : "cursor-text"}`}
            placeholder="Shift"
          />
          <input disabled={locked} value={line} onChange={e => setLine(e.target.value)}
            className={`h-[32px] bg-bg border border-border rounded px-2 w-full ${locked ? "cursor-not-allowed" : "cursor-text"}`}
            placeholder="Line"
          />
          <input disabled={locked} value={operator} onChange={e => setOperator(e.target.value)}
            className={`h-[32px] bg-bg border border-border rounded px-2 w-full ${locked ? "cursor-not-allowed" : "cursor-text"}`}
            placeholder="Operator"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input disabled={locked} value={product} onChange={e => setProduct(e.target.value)}
            className={`h-[32px] bg-bg border border-border rounded px-2 w-full ${locked ? "cursor-not-allowed" : "cursor-text"}`}
            placeholder="Product"
          />
          <input disabled={locked} value={characteristic} onChange={e => setCharacteristic(e.target.value)}
            className={`h-[32px] bg-bg border border-border rounded px-2 w-full ${locked ? "cursor-not-allowed" : "cursor-text"}`}
            placeholder="Characteristic"
          />
          <input disabled={locked} value={unit} onChange={e => setUnit(e.target.value)}
            className={`h-[32px] bg-bg border border-border rounded px-2 w-full ${locked ? "cursor-not-allowed" : "cursor-text"}`}
            placeholder="Unit"
          />
          <input disabled={locked} type="number" step="0.0001" value={binSize} onChange={e => setBinSize(Number(e.target.value))}
            className={`h-[32px] bg-bg border border-border rounded px-2 w-full font-mono ${locked ? "cursor-not-allowed" : "cursor-text"}`}
            placeholder="Bin Size"
          />
        </div>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-2 cursor-default">

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="font-medium text-sm">Target</div>
            <input type="number" disabled={locked} value={target} onChange={e => setTarget(Number(e.target.value))}
              className={`h-[32px] bg-bg border border-border rounded px-2 w-[120px] font-mono ${locked ? "cursor-not-allowed" : "cursor-text"}`}
            />
          </div>
          <div className="space-y-1">
            <div className="font-medium text-sm">LSL</div>
            <input type="number" disabled={locked} value={LSL} onChange={e => setLSL(Number(e.target.value))}
              className={`h-[32px] bg-bg border border-border rounded px-2 w-[120px] font-mono ${locked ? "cursor-not-allowed" : "cursor-text"}`}
            />
          </div>
          <div className="space-y-1">
            <div className="font-medium text-sm">USL</div>
            <input type="number" disabled={locked} value={USL} onChange={e => setUSL(Number(e.target.value))}
              className={`h-[32px] bg-bg border border-border rounded px-2 w-[120px] font-mono ${locked ? "cursor-not-allowed" : "cursor-text"}`}
            />
          </div>
        </div>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-2 cursor-default">
        <div className="overflow-auto max-h-[380px] no-scrollbar">
          <table className="w-full border border-border text-xs">
            <thead className="bg-bg text-secondary sticky top-0 cursor-default">
              <tr>
                <th className="border border-border px-2 py-2 text-left cursor-default">Deviation</th>
                <th className="border border-border px-2 py-1 text-left font-mono cursor-default">Actual ({unit})</th>
                <th className="border border-border px-2 py-1 text-center cursor-default">Count</th>
                <th className="border border-border px-2 py-1 text-left cursor-default">Distribution</th>
                <th className="border border-border px-2 py-1 text-center cursor-default">Freq</th>
              </tr>
            </thead>

            <tbody>
              {rows.map(r => {
                const actual = target + r.deviation * binSize;
                const outSpec = actual < LSLActual || actual > USLActual;
                return (
                  <tr
                    key={r.deviation}
                    className={`border border-border cursor-pointer ${selectedDev === r.deviation ? "bg-primary/10" : "hover:bg-primary/10"
                      }`}
                    onClick={() => {
                      if (locked) return;
                      setSelectedDev(r.deviation);
                    }}
                  >
                    <td className={`border border-border px-2 font-mono ${outSpec ? "text-error" : ""}`}>
                      {r.deviation}
                    </td>
                    <td className="border border-border px-2 font-mono">
                      {actual.toFixed(6)}
                    </td>
                    <td className="border border-border text-center font-mono">
                      {r.count}
                    </td>
                    <td className="border border-border px-1">
                      <div
                        className={`${outSpec ? "bg-error" : "bg-primary"} h-[10px]`}
                        style={{ width: `${(r.count / maxCount) * 100}%` }}
                      />
                    </td>
                    <td className="border border-border text-center font-mono">
                      {r.count}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot className="bg-bg font-semibold cursor-default">
              <tr>
                <td colSpan={4} className="border border-border text-center">TOTAL</td>
                <td className="border border-border text-center font-mono">{totalCount}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
<div className="p-3 border border-border rounded bg-card shadow-sm cursor-default">
  <div className="font-medium text-sm mb-2">Data Statistik</div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">

    <div className="space-y-1">
      <div className="font-semibold text-secondary/80">Basic Stats</div>
      <div>Mean actual: <span className="font-mono">{totalCount > 0 ? meanActual.toFixed(6) : "-"}</span> {unit}</div>
      <div>Mean deviation: <span className="font-mono">{totalCount > 0 ? meanDeviation.toFixed(6) : "-"}</span></div>
      <div>Std dev: <span className="font-mono">{totalCount > 1 ? stdDev.toFixed(6) : "-"}</span></div>
      <div>Min / Max: <span className="font-mono">{totalCount > 0 ? `${minActual.toFixed(6)} / ${maxActual.toFixed(6)}` : "-"}</span> {unit}</div>
    </div>

    <div className="space-y-1">
      <div className="font-semibold text-secondary/80">Specification</div>
      <div>LSL actual: <span className="font-mono">{LSLActual.toFixed(6)}</span> {unit}</div>
      <div>USL actual: <span className="font-mono">{USLActual.toFixed(6)}</span> {unit}</div>
      <div>In spec: <span className="font-mono">{inSpec}</span></div>
      <div>Out of spec: <span className="font-mono">{outSpec}</span> ({totalCount > 0 ? outSpecPercent.toFixed(2) : "0.00"}%)</div>
    </div>

    <div className="space-y-1">
      <div className="font-semibold text-secondary/80">Capability</div>
      <div>Cp: <span className="font-mono">{Cp > 0 ? Cp.toFixed(3) : "-"}</span></div>
      <div>Cpk: <span className="font-mono">{Cpk > 0 ? Cpk.toFixed(3) : "-"}</span></div>
      <div>Total samples: <span className="font-mono">{totalCount}</span></div>
    </div>

  </div>
</div>



      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3 cursor-default">
        <div className="flex gap-2 items-center">
          <span className="px-3 py-1 border border-border rounded bg-bg text-xs cursor-default">
            {selectedDev !== null ? selectedDev : "-"}
          </span>
        </div>

        <div className="flex gap-2">
          <button disabled={selectedDev === null || locked} onClick={decrement}
            className={`h-[32px] w-[32px] bg-muted rounded ${selectedDev === null || locked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
            –
          </button>
          <button disabled={selectedDev === null || locked} onClick={increment}
            className={`h-[32px] w-[32px] bg-muted rounded ${selectedDev === null || locked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
            +
          </button>
          <input type="number" min={0} disabled={selectedDev === null || locked}
            value={manualInput} onChange={e => setManualInput(Number(e.target.value))}
            className={`h-[32px] bg-bg border border-border rounded px-2 w-[120px] font-mono ${selectedDev === null || locked ? "cursor-not-allowed" : "cursor-text"}`}
          />
          <button disabled={selectedDev === null || locked} onClick={applyManualInput}
            className={`h-[32px] px-3 rounded ${selectedDev === null || locked ? "cursor-not-allowed opacity-50 bg-primary/40 text-white" : "cursor-pointer bg-primary/80 text-white"}`}>
            Set
          </button>
          <button disabled={selectedDev === null || locked} onClick={clearSelected}
            className={`h-[32px] px-3 rounded ${selectedDev === null || locked ? "cursor-not-allowed opacity-50 bg-error/40 text-white" : "cursor-pointer bg-error/80 text-white"}`}>
            Reset
          </button>
          <button onClick={clearAll}
            disabled={locked}
            className="h-[32px] px-3 bg-error/60 text-white rounded cursor-pointer">
            Clear All
          </button>
          <button onClick={exportCSV}
            className="h-[32px] px-3 bg-secondary text-white rounded cursor-pointer">
            Export CSV
          </button>
        </div>
      </div>

    </div>
  );

};

export default CheckSheetProductionDistribution;
