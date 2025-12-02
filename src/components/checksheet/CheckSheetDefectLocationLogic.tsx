import { useState, useEffect } from "react"
import { useChecksheetStore } from "../../store/useChecksheetStore"
import { exportCSV } from "../../utils/dataio/csv"
import { exportExcel } from "../../utils/dataio/excel"
import { exportPDF } from "../../utils/dataio/pdf"

export interface LocationMark {
  circ: string
  rad: number
  count: number
  defect: string
  severity: "Minor" | "Major" | "Critical"
  comment: string
  timestamp: number
}

export interface HistoryItem {
  circ: string
  rad: number
  prev: number
  now: number
  time: number
}

export interface DefectLocationSnapshot {
  circular: string[]
  radial: number[]
  metadata: Record<string, string>
  customFields: string[]
  marks: LocationMark[]
  locked: boolean
}

const DEFAULT_CIRC = ["A","B","C","D","E","F","G","H"]
const DEFAULT_RADIAL = [1,2,3,4,5,6,7,8,9,10]

const DEFAULT_FIELDS = ["Product","Model","Inspector","Date"]
const DEFAULT_METADATA: Record<string, string> = {
  Product: "",
  Model: "",
  Inspector: "",
  Date: "",
}

export const useDefectLocationLogic = () => {
  const { setSnapshot, getSnapshot } = useChecksheetStore()

  const [circular, setCircular] = useState(DEFAULT_CIRC)
  const [radial, setRadial] = useState(DEFAULT_RADIAL)
  const [marks, setMarks] = useState<LocationMark[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [locked, setLocked] = useState(false)

  const [metadata, setMetadata] = useState<Record<string, string>>(DEFAULT_METADATA)
  const [customFields, setCustomFields] = useState(DEFAULT_FIELDS)
  const [newField, setNewField] = useState("")

  const [defectType, setDefectType] = useState("")
  const [comment, setComment] = useState("")
  const [severity, setSeverity] = useState<"Minor"|"Major"|"Critical">("Minor")

  const [selectedCirc, setSelectedCirc] = useState<string | null>(null)
  const [selectedRad, setSelectedRad] = useState<number | null>(null)
  const [manual, setManual] = useState(0)

  const requireFilled =
    customFields.every(f => (metadata[f] ?? "").trim())

  const getCell = (c: string, r: number) =>
    marks.find(m => m.circ === c && m.rad === r)?.count || 0

  const setCellValue = (c: string, r: number, val: number) => {
    if (!defectType) return
    setMarks(prev => {
      const exist = prev.find(m => m.circ===c && m.rad===r)
      setHistory(h=>[...h,{circ:c,rad:r,prev:(exist?.count||0),now:val,time:Date.now()}])
      if (!exist) return [...prev, {
        circ:c,
        rad:r,
        count:val,
        defect:defectType,
        severity:severity,
        comment:comment,
        timestamp:Date.now()
      }]
      return prev.map(m => m===exist ? {
        ...exist,
        count:val,
        defect:defectType,
        severity:severity,
        comment:comment,
        timestamp:Date.now()
      } : m)
    })
  }

  const undo = () => {
    if (locked) return
    const last = history[history.length-1]
    if (!last) return
    setHistory(h=>h.slice(0,-1))
    setCellValue(last.circ,last.rad,last.prev)
  }

  const increment = () => {
    if (!defectType || locked || !selectedCirc || !selectedRad) return
    setCellValue(selectedCirc, selectedRad, getCell(selectedCirc,selectedRad)+1)
  }

  const decrement = () => {
    if (locked || !selectedCirc || !selectedRad) return
    const curr = getCell(selectedCirc,selectedRad)
    if (curr===0) return
    setCellValue(selectedCirc, selectedRad, curr-1)
  }

  const applyManual = () => {
    if (!defectType || locked || !selectedCirc || !selectedRad) return
    if (manual<0) return
    setCellValue(selectedCirc, selectedRad, manual)
    setManual(0)
  }

  const resetCell = () => {
    if (locked || !selectedCirc || !selectedRad) return
    setCellValue(selectedCirc, selectedRad, 0)
  }

  const resetRow = () => {
    if (locked || !selectedCirc) return
    setMarks(m => m.map(mm => mm.circ===selectedCirc ? {...mm,count:0} : mm))
  }

  const resetAll = () => {
    if (locked) return
    setMarks([])
    setSelectedCirc(null)
    setSelectedRad(null)
    setHistory([])
  }

  const totalRow = (c: string) =>
    radial.reduce((s,r)=>s + getCell(c,r), 0)

  const totalCol = (r: number) =>
    circular.reduce((s,c)=>s + getCell(c,r), 0)

  const totalAll = marks.reduce((s,m)=>s+m.count, 0)

  const maxCount = Math.max(...marks.map(m=>m.count),1)

  const addField = () => {
    if (locked) return
    const f = newField.trim()
    if (!f) return
    if (customFields.includes(f)) return
    const newFields = [...customFields, f]
    setCustomFields(newFields)
    setMetadata({ ...metadata, [f]: "" })
    setNewField("")
  }

  const removeField = (f: string) => {
    if (locked) return
    if (f === "Product") return
    const newFields = customFields.filter(x => x !== f)
    const m = { ...metadata }
    delete m[f]
    setCustomFields(newFields)
    setMetadata(m)
  }

  const getShareLink = () => {
    const snapshot = {
      circular,
      radial,
      marks,
      customFields,
      metadata,
      locked
    }
    const json = JSON.stringify(snapshot)
    const base64 = btoa(json)
    return `${window.location.origin}/?loc=${base64}`
  }

const doExportCSV = () => {
  exportCSV(
    {
      type: "DEFECT_LOCATION",
      title: metadata.Product || metadata.Model || "Defect Location",
      metadata,
      customFields,
      circular,
      radial,
      mapping: marks,
      totalAll
    },
    "defect-location"
  )
}

const doExportExcel = () => {
  exportExcel(
    {
      type: "DEFECT_LOCATION",
      title: metadata.Product || metadata.Model || "Defect Location",
      metadata,
      customFields,
      circular,
      radial,
      mapping: marks,
      totalAll
    },
    "defect-location"
  )
}


const doExportPDF = () => {
  exportPDF(
    {
      type: "DEFECT_LOCATION",
      title: metadata.Product || metadata.Model || "Defect Location",
      metadata,
      customFields,
      circular,
      radial,
      mapping: marks,
      totalAll
    },
    "defect-location"
  )
}

  const saveSnapshot = () => {
    setSnapshot("defect-location", {
      circular,
      radial,
      marks,
      customFields,
      metadata,
      locked
    })
  }

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get("loc")
    if (encoded) {
      const d = JSON.parse(atob(encoded))
      setCircular(d.circular)
      setRadial(d.radial)
      setMarks(d.marks)
      setCustomFields(d.customFields)
      setMetadata(d.metadata)
      setLocked(d.locked || false)
      return
    }

    const snap = getSnapshot("defect-location")
    if(!snap) return
    const d = snap.data as DefectLocationSnapshot
    setCircular(d.circular)
    setRadial(d.radial)
    setMarks(d.marks)
    setCustomFields(d.customFields)
    setMetadata(d.metadata)
    setLocked(d.locked || false)
  },[])

  return {
    circular, radial, marks, history,
    selectedCirc, setSelectedCirc,
    selectedRad, setSelectedRad,
    manual, setManual,
    locked, setLocked,
    defectType, setDefectType,
    comment, setComment,
    severity, setSeverity,
    metadata, setMetadata,
    customFields, setCustomFields,
    newField, setNewField,
    addField, removeField,
    getCell, setCellValue,
    undo,
    exportSnapshot: saveSnapshot,
    doExportCSV, doExportExcel, doExportPDF,
    increment, decrement,
    applyManual, resetCell, resetRow, resetAll,
    totalRow, totalCol, totalAll, maxCount,
    requireFilled,
    getShareLink,
  }
}
