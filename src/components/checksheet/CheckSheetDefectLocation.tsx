import { useEffect, useState } from "react";
import { useChecksheetStore } from "../../store/useChecksheetStore";

interface LocationMark {
  circ: string;
  rad: number;
  count: number;
  defect: string;
  severity: "Minor" | "Major" | "Critical";
  comment: string;
  timestamp: number;
}

interface HistoryItem {
  circ: string;
  rad: number;
  prev: number;
  now: number;
  time: number;
}

interface DefectLocationSnapshot {
  product: string;
  lot: string;
  model: string;
  supplier: string;
  shift: string;
  inspector: string;
  date: string;
  mapping: LocationMark[];
}

const CheckSheetDefectLocation = () => {
  const { setSnapshot, getSnapshot } = useChecksheetStore();

  const [circular, setCircular] = useState(["A","B","C","D","E","F","G","H"]);
  const [radial, setRadial] = useState([1,2,3,4,5,6,7,8,9,10]);
  const [marks, setMarks] = useState<LocationMark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [selectedCirc, setSelectedCirc] = useState<string | null>(null);
  const [selectedRad, setSelectedRad] = useState<number | null>(null);
  const [manual, setManual] = useState<number>(0);
  const [locked, setLocked] = useState(false);

  const [defectType, setDefectType] = useState("");
  const [comment, setComment] = useState("");
  const [severity, setSeverity] = useState<"Minor"|"Major"|"Critical">("Minor");

  const [product, setProduct] = useState("");
  const [lot, setLot] = useState("");
  const [model, setModel] = useState("");
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState("");
  const [shift, setShift] = useState("");
  const [inspector, setInspector] = useState("");

  const requireFilled =
    product && lot && date && shift && inspector;

  const getCell = (c: string, r: number) =>
    marks.find(m => m.circ === c && m.rad === r)?.count || 0;

  const setCellValue = (c: string, r: number, val: number) => {
    if (!defectType) return;
    setMarks(prev => {
      const exist = prev.find(m => m.circ===c && m.rad===r);

      setHistory(h=>[...h,{circ:c,rad:r,prev:(exist?.count||0),now:val,time:Date.now()}]);

      if (!exist) return [...prev, {
        circ:c,
        rad:r,
        count:val,
        defect:defectType,
        severity:severity,
        comment:comment,
        timestamp:Date.now()
      }];

      return prev.map(m => m===exist ? {
        ...exist,
        count:val,
        defect:defectType,
        severity:severity,
        comment:comment,
        timestamp:Date.now()
      } : m);
    });
  };

  const undo = () => {
    if (locked) return;
    const last = history[history.length-1];
    if (!last) return;
    setHistory(h=>h.slice(0,-1));
    setCellValue(last.circ,last.rad,last.prev);
  };

  const exportData = () => {
    if (!locked) return;
    setSnapshot("defect-location", {
      product,
      lot,
      model,
      supplier,
      shift,
      inspector,
      date,
      mapping: marks
    });
  };

  const increment = () => {
    if (!defectType || locked || !selectedCirc || !selectedRad) return;
    setCellValue(selectedCirc, selectedRad, getCell(selectedCirc,selectedRad)+1);
  };

  const decrement = () => {
    if (locked || !selectedCirc || !selectedRad) return;
    const curr = getCell(selectedCirc,selectedRad);
    if (curr===0) return;
    setCellValue(selectedCirc, selectedRad, curr-1);
  };

  const applyManual = () => {
    if (!defectType || locked || !selectedCirc || !selectedRad) return;
    if (manual<0) return;
    setCellValue(selectedCirc, selectedRad, manual);
    setManual(0);
  };

  const resetCell = () => {
    if (locked || !selectedCirc || !selectedRad) return;
    setCellValue(selectedCirc, selectedRad, 0);
  };

  const resetRow = () => {
    if (locked || !selectedCirc) return;
    setMarks(m => m.map(mm => mm.circ===selectedCirc ? {...mm,count:0} : mm));
  };

  const resetAll = () => {
    if (locked) return;
    setMarks([]);
    setSelectedCirc(null);
    setSelectedRad(null);
    setHistory([]);
  };

  const totalRow = (c: string) =>
    radial.reduce((s,r)=>s + getCell(c,r), 0);

  const totalCol = (r: number) =>
    circular.reduce((s,c)=>s + getCell(c,r), 0);

  const totalAll =
    marks.reduce((s,m)=>s+m.count, 0);

  const maxCount =
    Math.max(...marks.map(m=>m.count),1);

  useEffect(()=>{
    const snap = getSnapshot("defect-location");
    if(!snap) return;
    const d = snap.data as DefectLocationSnapshot;
    setProduct(d.product);
    setLot(d.lot);
    setModel(d.model);
    setSupplier(d.supplier);
    setShift(d.shift);
    setDate(d.date);
    setInspector(d.inspector);
    setMarks(d.mapping);
  },[]);

  return (
    <div className="text-[14px] space-y-4 select-none">

      <div className="flex justify-between px-3 py-2 border border-border rounded bg-card shadow-sm cursor-default">
        <div className="font-semibold">Defect Location Matrix</div>
        <div className={`px-2 py-1 rounded text-sm ${locked ? "bg-error/20 text-error" : "bg-success/20 text-success"}`}>
          {locked ? "Locked" : "Editing"}
        </div>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3 cursor-default">
        <div className="font-medium text-sm">Inspection Details</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input disabled={locked} value={product} onChange={e=>setProduct(e.target.value)} className="h-[32px] bg-bg border border-border rounded px-2 w-full" placeholder="Product"/>
          <input disabled={locked} value={model} onChange={e=>setModel(e.target.value)} className="h-[32px] bg-bg border border-border rounded px-2 w-full" placeholder="Model"/>
          <input disabled={locked} value={supplier} onChange={e=>setSupplier(e.target.value)} className="h-[32px] bg-bg border border-border rounded px-2 w-full" placeholder="Supplier"/>
          <input disabled={locked} value={lot} onChange={e=>setLot(e.target.value)} className="h-[32px] bg-bg border border-border rounded px-2 w-full" placeholder="Lot"/>
          <input disabled={locked} value={inspector} onChange={e=>setInspector(e.target.value)} className="h-[32px] bg-bg border border-border rounded px-2 w-full" placeholder="Inspector"/>
          <input disabled={locked} value={shift} onChange={e=>setShift(e.target.value)} className="h-[32px] bg-bg border border-border rounded px-2 w-full" placeholder="Shift"/>
          <input type="date" disabled={locked} value={date} onChange={e=>setDate(e.target.value)} className="h-[32px] bg-bg border border-border rounded px-2 w-full"/>
        </div>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3 cursor-default">
        <div className="font-medium text-sm">Defect Input</div>
        <div className="flex gap-2">
          <input disabled={locked} value={defectType} onChange={e=>setDefectType(e.target.value)} className="h-[32px] bg-bg border border-border rounded px-2" placeholder="Defect type"/>
          <select disabled={locked} value={severity} onChange={e=>setSeverity(e.target.value as any)} className="h-[32px] bg-bg border border-border rounded px-2">
            <option>Minor</option>
            <option>Major</option>
            <option>Critical</option>
          </select>
          <input disabled={locked} value={comment} onChange={e=>setComment(e.target.value)} className="h-[32px] flex-1 bg-bg border border-border rounded px-2" placeholder="Comment"/>
        </div>
      </div>

      {!defectType && !locked && (
        <div className="text-error text-[13px]">Isi defect type terlebih dahulu</div>
      )}

      <div className="p-3 border border-border rounded bg-card shadow-sm cursor-default">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-bg text-secondary">
              <tr>
                <th className="border border-border px-2 py-2">Circular / Radial</th>
                {radial.map(r => <th key={r} className="border border-border px-1">{r}</th>)}
                <th className="border border-border px-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {circular.map(c => (
                <tr key={c}>
                  <td className="border border-border px-2 text-secondary">{c}</td>
                  {radial.map(r => {
                    const val = getCell(c,r);
                    const isSel = selectedCirc===c && selectedRad===r;
                    const ratio = val/maxCount;
                    return (
                      <td
                        key={r}
                        className={`border border-border text-center cursor-pointer ${isSel?"bg-primary/25":"bg-bg"} hover:bg-primary/10`}
                        onClick={()=>{if(!locked){ setSelectedCirc(c); setSelectedRad(r);} }}
                      >
                        <div className="w-full h-[20px]" style={{background:`rgba(0,200,255,${ratio})`}}>
                          {val}
                        </div>
                      </td>
                    );
                  })}
                  <td className="border border-border text-center font-mono bg-muted">{totalRow(c)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-bg font-semibold">
                <td className="border border-border text-center">TOTAL</td>
                {radial.map(r => (
                  <td key={r} className="border border-border text-center font-mono">{totalCol(r)}</td>
                ))}
                <td className="border border-border text-center font-mono bg-muted">{totalAll}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm flex gap-2 cursor-default">
        <button disabled={!selectedCirc || locked} onClick={decrement} className="h-[32px] w-[32px] bg-muted rounded">-</button>
        <button disabled={!selectedCirc || locked} onClick={increment} className="h-[32px] w-[32px] bg-muted rounded">+</button>
        <input disabled={!selectedCirc || locked} type="number" min={0} value={manual} onChange={e=>setManual(Number(e.target.value))} className="h-[32px] bg-bg border border-border rounded px-2 w-[80px] font-mono"/>
        <button disabled={!selectedCirc || locked} onClick={applyManual} className="h-[32px] px-3 rounded bg-primary/80 text-white">Set</button>
        <button disabled={!selectedCirc || locked} onClick={resetCell} className="h-[32px] px-3 rounded bg-error/60 text-white">Reset</button>
        <button disabled={!selectedCirc || locked} onClick={resetRow} className="h-[32px] px-3 rounded bg-warning/60 text-black">Reset Row</button>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm flex gap-2 cursor-default">
        <button disabled={locked} onClick={resetAll} className="h-[32px] px-3 rounded bg-error/50 text-white">Clear All</button>
        <button disabled={locked} onClick={undo} className="h-[32px] px-3 rounded bg-secondary/50 text-white">Undo</button>
        <button disabled={!requireFilled} onClick={()=>setLocked(!locked)} className={`h-[32px] px-3 rounded ${locked?"bg-success/70 text-white":"bg-warning/70 text-black"}`}>{locked ? "Unlock" : "Lock"}</button>
        <button disabled={!locked} onClick={exportData} className="h-[32px] px-3 rounded bg-primary/70 text-white">Export</button>
      </div>

      <div className="font-mono text-secondary">Total defect: {totalAll}</div>

    </div>
  );
};

export default CheckSheetDefectLocation;
