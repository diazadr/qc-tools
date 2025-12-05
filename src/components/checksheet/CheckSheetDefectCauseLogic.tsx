import { useEffect, useState, useRef } from "react"
import { useChecksheetStore } from "../../store/useChecksheetStore"
import { exportExcel } from "../../utils/dataio/excel/excel"
import { exportCSV } from "../../utils/dataio/csv/csv"
import { exportPDF } from "../../utils/dataio/pdf/pdf"

export interface Entry {
  worker: string
  day: string
  shift: string
  type: string
}

export interface DefectCauseSnapshot {
  metadata: Record<string, string>
  customFields: string[]
  workers: string[]
  defectType: string[]
  dataset: Entry[]
  isLocked: boolean
}

const DEFAULT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DEFAULT_SHIFT = ["AM", "PM"]
const DEFAULT_WORKERS = ["A", "B", "C", "D"]
const DEFAULT_DEFECT = ["⭕", "🔴", "❌", "⚠️", "🟦"]

export const useDefectCauseLogic = () => {
  const store = useChecksheetStore()

  const [days] = useState(DEFAULT_DAYS)
  const [shift] = useState(DEFAULT_SHIFT)
  const [workers, setWorkers] = useState(DEFAULT_WORKERS)
  const [defectType, setDefectType] = useState(DEFAULT_DEFECT)

  const [dataset, setDataset] = useState<Entry[]>([])

  const [metadata, setMetadata] = useState<Record<string, string>>({
    product: "",
    lot: "",
    date: "",
    inspector: "",
  })

  const [customFields, setCustomFields] = useState<string[]>([
    "product", "lot", "inspector"
  ])
  const [newField, setNewField] = useState("")


  const [isLocked, setIsLocked] = useState(false)
  const [newWorker, setNewWorker] = useState("")

  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedShift, setSelectedShift] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [activeTabWD, setActiveTabWD] = useState<"worker" | "defect">("worker")
  const [manualInput, setManualInput] = useState(0)


  const [cellBuffer, setCellBuffer] = useState("")
  const cellRefs = useRef<Record<string, Record<string, HTMLTableCellElement | null>>>({})

  const [sortKey, setSortKey] = useState<"worker" | "type" | "total" | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  const requireFilled =
    metadata.product.trim() &&
    metadata.lot.trim() &&
    metadata.date.trim() &&
    metadata.inspector.trim()

  const count = (worker: string, day: string, s: string, type: string) =>
    dataset.filter(e => e.worker === worker && e.day === day && e.shift === s && e.type === type).length

  const totalWorker = (worker: string) =>
    dataset.filter(e => e.worker === worker).length

  const totalType = (type: string) =>
    dataset.filter(e => e.type === type).length

  const totalAll = dataset.length

  const addDataset = (arr: Entry[]) => {
    setDataset(arr)
  }

  const setCount = (worker: string, day: string, s: string, type: string, value: number) => {
    const filtered = dataset.filter(
      e => !(e.worker === worker && e.day === day && e.shift === s && e.type === type)
    )
    const next: Entry[] = []
    for (let i = 0; i < value; i++) {
      next.push({ worker, day, shift: s, type })
    }
    addDataset([...filtered, ...next])
  }

  const handleCellKeyDown = (e: any, worker: string, day: string, s: string, type: string) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) { e.preventDefault() }
    if (isLocked) return

    if (e.key >= "0" && e.key <= "9") {
      const newBuf = cellBuffer + e.key
      setCellBuffer(newBuf)
      setCount(worker, day, s, type, Number(newBuf))
    }

    if (e.key === "Backspace") {
      const newBuf = cellBuffer.slice(0, -1)
      setCellBuffer(newBuf)
      setCount(worker, day, s, type, newBuf === "" ? 0 : Number(newBuf))
    }

    if (e.key === "Enter") setCellBuffer("")
  }

  const increment = () => {
    if (!selectedWorker || !selectedDay || !selectedShift || !selectedType) return
    if (isLocked) return
    addDataset([...dataset, { worker: selectedWorker, day: selectedDay, shift: selectedShift, type: selectedType }])
  }

  const decrement = () => {
    if (!selectedWorker || !selectedDay || !selectedShift || !selectedType) return
    if (isLocked) return
    const idx = dataset.findIndex(e =>
      e.worker === selectedWorker && e.day === selectedDay && e.shift === selectedShift && e.type === selectedType
    )
    if (idx === -1) return
    const arr = [...dataset]
    arr.splice(idx, 1)
    addDataset(arr)
  }

  const resetCell = () => {
    if (!selectedWorker || !selectedDay || !selectedShift) return
    if (isLocked) return
    addDataset(dataset.filter(e =>
      !(e.worker === selectedWorker && e.day === selectedDay && e.shift === selectedShift)
    ))
  }

  const applyManualInput = () => {
    if (!selectedWorker || !selectedDay || !selectedShift || !selectedType) return
    if (isLocked) return
    if (manualInput < 0) return

    setCount(selectedWorker, selectedDay, selectedShift, selectedType, manualInput)
    saveSnapshot()
  }


  const resetWorker = () => {
    if (!selectedWorker) return
    if (isLocked) return
    addDataset(dataset.filter(e => e.worker !== selectedWorker))
  }
  const addField = () => {
    if (isLocked) return
    const v = newField.trim()
    if (!v) return
    if (customFields.includes(v)) return

    setCustomFields([...customFields, v])
    setMetadata({ ...metadata, [v]: "" })
    setNewField("")
    saveSnapshot()
  }

  const clearAll = () => {
    if (!confirm("Clear ALL data?")) return

    setDataset([])
    setWorkers(DEFAULT_WORKERS)
    setDefectType(DEFAULT_DEFECT)

    setMetadata({
      product: "",
      lot: "",
      date: "",
      inspector: ""
    })

    setCustomFields(["product", "lot", "inspector"])
    setNewField("")
    setIsLocked(false)

    store.setSnapshot("defect-cause", null)
  }

  const addWorker = (w: string) => {
    if (isLocked) return
    if (!w.trim()) return
    if (workers.includes(w)) return
    setWorkers([...workers, w])
    saveSnapshot()
  }

  const renameWorker = (old: string, newN: string) => {
    if (isLocked) return
    if (!newN.trim()) return
    if (workers.includes(newN)) return

    setWorkers(workers.map(w => w === old ? newN : w))

    const updated = dataset.map(e => ({
      ...e,
      worker: e.worker === old ? newN : e.worker
    }))
    setDataset(updated)
    saveSnapshot()
  }

  const addDefectSymbol = (s: string) => {
    if (isLocked) return
    if (!s.trim()) return
    if (defectType.includes(s)) return
    setDefectType([...defectType, s])
    saveSnapshot()
  }

  const renameDefectSymbol = (old: string, newN: string) => {
    if (isLocked) return
    if (!newN.trim()) return
    if (defectType.includes(newN)) return

    setDefectType(defectType.map(d => d === old ? newN : d))

    const updated = dataset.map(e => ({
      ...e,
      type: e.type === old ? newN : e.type
    }))
    setDataset(updated)
    saveSnapshot()
  }

  const saveSnapshot = () => {
    if (!metadata) return
    store.setSnapshot("defect-cause", {
      metadata,
      customFields,
      workers,
      defectType,
      dataset,
      isLocked
    })
  }

const getShareLink = () => {
  const d = {
    metadata,
    customFields,
    workers,
    defectType,
    dataset,
    isLocked
  };

  const encoded = btoa(JSON.stringify(d));

  return `${window.location.origin}/checksheet/defect-cause?cause=${encoded}`;
};

  const setSort = (key: "worker" | "type" | "total") => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  const sortedWorkers = [...workers].sort((a, b) => {
    if (!sortKey) return 0
    if (sortKey === "worker") return sortAsc ? a.localeCompare(b) : b.localeCompare(a)
    if (sortKey === "total") return sortAsc ? totalWorker(a) - totalWorker(b) : totalWorker(b) - totalWorker(a)
    return 0
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get("cause")
    if (encoded) {
      try {
        const d = JSON.parse(atob(encoded))
        setMetadata(d.metadata || { product: "", lot: "", date: "", inspector: "" })
        setCustomFields(d.customFields || ["product", "lot", "inspector"])
        setWorkers(d.workers || DEFAULT_WORKERS)
        setDefectType(d.defectType || DEFAULT_DEFECT)
        setDataset(d.dataset || [])
        setIsLocked(d.isLocked ?? false)
      } catch { }
      return
    }

    const snap = store.getSnapshot("defect-cause")

    if (!snap || !snap.data) return   // ← FIX DI SINI

    const d = snap.data as DefectCauseSnapshot

    setMetadata(d.metadata || { product: "", lot: "", date: "", inspector: "" })
    setCustomFields(d.customFields || ["product", "lot", "inspector"])
    setWorkers(d.workers || DEFAULT_WORKERS)
    setDefectType(d.defectType || DEFAULT_DEFECT)
    setDataset(d.dataset || [])
    setIsLocked(d.isLocked || false)
  }, [])


const doExportCSV = () => {
  exportCSV(
    {
      type: "DEFECT_CAUSE",
      title: metadata.product || "Defect Cause",

      metadata,
      customFields,

      workers,
      defectTypes: defectType,
      days,
      shifts: shift,
      dataset,
      totalAll,

      sortKey,
      sortAsc
    },
    "defect-cause"
  )
}

const doExportExcel = () => {
  exportExcel(
    {
      type: "DEFECT_CAUSE",
      title: metadata.product || "Defect Cause",

      metadata,
      customFields,

      workers,
      defectTypes: defectType,
      days,
      shifts: shift,
      dataset,
      totalAll,

      sortKey,
      sortAsc
    },
    "defect-cause"
  )
}


const doExportPDF = () => {
  exportPDF(
    {
      type: "DEFECT_CAUSE",
      title: metadata.product || "Defect Cause",

      metadata,
      customFields,

      workers,
      defectTypes: defectType,
      days,
      shifts: shift,
      dataset,
      totalAll,

      sortKey,
      sortAsc
    },
    "defect-cause"
  )
}


  return {
    days, shift, workers, defectType,
    metadata, setMetadata,
    customFields, setCustomFields,

    dataset, setDataset,
    isLocked, setIsLocked,

    selectedWorker, setSelectedWorker,
    selectedDay, setSelectedDay,
    selectedShift, setSelectedShift,
    selectedType, setSelectedType,

    requireFilled,
    count,
    totalWorker,
    totalType,
    totalAll,

    cellRefs, cellBuffer, setCellBuffer,
    manualInput, setManualInput,
    applyManualInput,
    handleCellKeyDown,
    newWorker, setNewWorker,
    increment,
    decrement,
    resetCell,
    resetWorker,
    clearAll,
    addWorker,
    renameWorker,
    addDefectSymbol,
    renameDefectSymbol,
    newField, setNewField,     // ← tambah
    addField,
    setWorkers,        // ← tambahkan ini
    setDefectType,     // ← tambahkan ini
    activeTabWD, setActiveTabWD,
    saveSnapshot,
    getShareLink,

    sortKey, sortAsc, setSort,
    sortedWorkers,

    doExportCSV,
    doExportExcel,
    doExportPDF
  }

}
