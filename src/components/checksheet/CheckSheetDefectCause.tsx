import { useEffect, useState } from "react";
import { useChecksheetStore } from "../../store/useChecksheetStore";

interface Entry {
  worker: string;
  day: string;
  shift: string;
  type: string;
}

interface History {
  prev: Entry[];
  now: Entry[];
  time: number;
}

interface DefectCauseSnapshot {
  product: string;
  lot: string;
  date: string;
  inspector: string;
  dataset: Entry[];
}

const CheckSheetDefectCause = () => {
  const { setSnapshot, getSnapshot } = useChecksheetStore();

  const [workers, setWorkers] = useState(["A","B","C","D"]);
  const [day] = useState(["Mon","Tue","Wed","Thu","Fri","Sat"]);
  const [shift] = useState(["AM","PM"]);
  const [defectType, setDefectType] = useState(["⭕","🔴","❌","⚠️","🟦"]);

  const [data, setData] = useState<Entry[]>([]);
  const [history, setHistory] = useState<History[]>([]);

  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [locked, setLocked] = useState(false);

  const [product, setProduct] = useState("");
  const [lot, setLot] = useState("");
  const [date, setDate] = useState("");
  const [inspector, setInspector] = useState("");

  const requireFilled =
    product && lot && date && inspector;

  const count = (worker: string, day: string, shift: string, type: string) =>
    data.filter(e => e.worker===worker && e.day===day && e.shift===shift && e.type===type).length;

  const totalWorker = (worker: string) =>
    data.filter(e => e.worker===worker).length;

  const totalAll = data.length;

  const saveSnapshot = (newData: Entry[]) => {
    setHistory(h => [...h, { prev: data, now: newData, time: Date.now() }]);
    setData(newData);
  };

  const increment = () => {
    if (locked || !selectedWorker || !selectedDay || !selectedShift || !selectedType) return;
    saveSnapshot([...data, {
      worker:selectedWorker, day:selectedDay, shift:selectedShift, type:selectedType
    }]);
  };

  const decrement = () => {
    if (locked || !selectedWorker || !selectedDay || !selectedShift || !selectedType) return;
    const idx = data.findIndex(e =>
      e.worker===selectedWorker && e.day===selectedDay && e.shift===selectedShift && e.type===selectedType
    );
    if (idx === -1) return;
    const newData = [...data];
    newData.splice(idx,1);
    saveSnapshot(newData);
  };

  const undo = () => {
    if (locked) return;
    const last = history[history.length-1];
    if (!last) return;
    setHistory(h=>h.slice(0,-1));
    setData(last.prev);
  };

  const resetCell = () => {
    if (locked || !selectedWorker || !selectedDay || !selectedShift) return;
    saveSnapshot(data.filter(e=>!(e.worker===selectedWorker && e.day===selectedDay && e.shift===selectedShift)));
  };

  const resetRowWorker = () => {
    if (locked || !selectedWorker) return;
    saveSnapshot(data.filter(e=>e.worker!==selectedWorker));
  };

  const resetAll = () => {
    if (locked) return;
    saveSnapshot([]);
    setSelectedWorker(null);
    setSelectedDay(null);
    setSelectedShift(null);
    setSelectedType(null);
  };

  const exportData = () => {
    if (!locked) return;
    setSnapshot("defect-cause", {
      product,
      lot,
      date,
      inspector,
      dataset: data
    });
  };

  useEffect(()=>{
    const snap = getSnapshot("defect-cause");
    if(!snap) return;

    const d = snap.data as DefectCauseSnapshot;
    setProduct(d.product);
    setLot(d.lot);
    setDate(d.date);
    setInspector(d.inspector);
    setData(d.dataset);
  },[]);
  
  return (
    <div className="text-[14px] space-y-4 select-none">

      <div className="flex justify-between px-3 py-2 border border-border rounded bg-card shadow-sm cursor-default">
        <div className="font-semibold">Defect Cause Checksheet</div>
        <div className={`px-2 py-1 rounded text-sm ${locked ? "bg-error/20 text-error" : "bg-success/20 text-success"}`}>
          {locked ? "Locked" : "Editing"}
        </div>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input disabled={locked} value={product} onChange={e=>setProduct(e.target.value)} className="h-[32px] bg-bg border border-border rounded px-2" placeholder="Product"/>
          <input disabled={locked} value={lot} onChange={e=>setLot(e.target.value)} className="h-[32px] bg-bg border border-border rounded px-2" placeholder="Lot / Batch"/>
          <input disabled={locked} type="date" value={date} onChange={e=>setDate(e.target.value)} className="h-[32px] bg-bg border border-border rounded px-2"/>
          <input disabled={locked} value={inspector} onChange={e=>setInspector(e.target.value)} className="h-[32px] bg-bg border border-border rounded px-2" placeholder="Inspector"/>
        </div>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm space-y-2 cursor-default">
        <div className="font-medium text-sm">Defect Symbols & Workers</div>
        <div className="flex gap-2">
          <input disabled={locked}
            onKeyDown={e=>{
              if(e.key==="Enter"){
                const v=e.currentTarget.value.trim();
                if(v && !workers.includes(v)) setWorkers([...workers,v]);
                e.currentTarget.value="";
              }
            }}
            className="h-[32px] bg-bg border border-border rounded px-2"
            placeholder="Add worker"
          />

          <input disabled={locked}
            onKeyDown={e=>{
              if(e.key==="Enter"){
                const v=e.currentTarget.value.trim();
                if(v && !defectType.includes(v)) setDefectType([...defectType,v]);
                e.currentTarget.value="";
              }
            }}
            className="h-[32px] bg-bg border border-border rounded px-2"
            placeholder="Add defect symbol"
          />
        </div>
      </div>

      {!selectedType && selectedWorker && !locked && (
        <div className="text-error text-[13px]">Klik simbol terlebih dahulu untuk pilih type</div>
      )}

      <div className="p-3 border border-border rounded bg-card shadow-sm overflow-auto">
        <table className="w-full min-w-max text-[12px]">
          <thead className="bg-bg text-secondary">
            <tr>
              <th className="border border-border px-2 py-2">Worker</th>
              {day.map(d => <th key={d} colSpan={2} className="px-2 text-center">{d}</th>)}
              <th className="px-2 text-center">Total</th>
            </tr>
          </thead>

          <tbody>
            {workers.map(w => (
              <tr key={w} className="border-b border-border">
                <td className="px-2 py-1 text-secondary bg-muted">{w}</td>

                {day.map(d => shift.map(s => (
                  <td
                    key={w+d+s}
                    className={`border border-border cursor-pointer ${selectedWorker===w && selectedDay===d && selectedShift===s ? "bg-primary/20" : "bg-bg"}`}
                    onClick={()=>{ if(!locked){ 
                      setSelectedWorker(w); 
                      setSelectedDay(d); 
                      setSelectedShift(s); 
                      setSelectedType(null);
                    }}}
                  >
                    <div className="px-1 py-1 space-y-[2px]">
                      {defectType.map(t => {
                        const c = count(w,d,s,t);
                        return (
                          <div 
                            key={t} 
                            className="flex justify-between items-center"
                          >
                            <span 
                              className={`cursor-pointer text-[19px] px-1 rounded transition
                              ${selectedType===t ? "bg-primary/40" : "bg-muted/50"}
                              `}
                              onClick={(e)=>{e.stopPropagation(); if(!locked){ setSelectedType(t);} }}
                            >
                              {t}
                            </span>

                            <span
                              onClick={(e)=>{e.stopPropagation(); if(!locked){ 
                                setSelectedType(t);
                                increment(); 
                              }}}
                              className="cursor-pointer select-none font-mono text-[13px]"
                            >
                              {c}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </td>
                )))}

                <td className="text-center font-mono bg-muted px-2">{totalWorker(w)}</td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="bg-bg font-semibold border-t border-border">
              <td className="text-center">TOTAL</td>
              {day.map(d=>(
                <>
                  <td key={d+"am"} className="text-center font-mono">{data.filter(e=>e.day===d && e.shift==="AM").length}</td>
                  <td key={d+"pm"} className="text-center font-mono">{data.filter(e=>e.day===d && e.shift==="PM").length}</td>
                </>
              ))}
              <td className="text-center font-mono bg-muted">{totalAll}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="p-3 border border-border rounded bg-card shadow-sm flex flex-wrap gap-2 cursor-default">
        <button disabled={!selectedWorker || locked || !selectedType} onClick={decrement} className="h-[32px] px-3 bg-muted rounded">-</button>
        <button disabled={!selectedWorker || locked} onClick={resetCell} className="h-[32px] px-3 bg-warning/40 rounded text-white">Reset Cell</button>
        <button disabled={!selectedWorker || locked} onClick={resetRowWorker} className="h-[32px] px-3 bg-warning/70 rounded text-black">Reset Worker</button>
        <button disabled={locked} onClick={resetAll} className="h-[32px] px-3 bg-error/60 rounded text-white">Reset ALL</button>
        <button disabled={locked} onClick={undo} className="h-[32px] px-3 bg-secondary/70 rounded text-white">Undo</button>
        <button disabled={!requireFilled} onClick={()=>setLocked(!locked)} className={`h-[32px] px-3 rounded ${locked?"bg-success/70 text-white":"bg-warning/70 text-black"}`}>{locked ? "Unlock" : "Lock"}</button>
        <button disabled={!locked} onClick={exportData} className="h-[32px] px-3 bg-primary/70 text-white rounded">Export</button>
      </div>

      <div className="font-mono text-secondary">Total defects recorded: {totalAll}</div>

    </div>
  );
};

export default CheckSheetDefectCause;
