import { useState, useEffect, useRef } from "react"
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
const DEFAULT_FIELDS = ["Product","Model","Inspector"]
const DEFAULT_METADATA: Record<string, string> = {
  Product: "",
  Model: "",
  Inspector: "",
  Date: new Date().toISOString().slice(0, 10),
}

export const useDefectLocationLogic = () => {
  const store = useChecksheetStore()

  const [circular, setCircular] = useState(DEFAULT_CIRC)
  const [radial, setRadial] = useState(DEFAULT_RADIAL)
  const [marks, setMarks] = useState<LocationMark[]>([])
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
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [cellBuffer, setCellBuffer] = useState("")
  const cellRefs = useRef<(HTMLTableCellElement | null)[][]>([])

  const metadataFilled =
    customFields.every(f => (metadata[f] ?? "").trim())
const getCellDefect = (c: string, r: number) =>
  marks.find(m => m.circ === c && m.rad === r)?.defect || ""
const getCellSeverity = (c: string, r: number) =>
  marks.find(m => m.circ === c && m.rad === r)?.severity || ""

const deleteCircular = (c: string) => {
  if (locked) return
setCircular(prev => {
  const updated = prev.filter(x => x !== c)
  saveSnapshot(updated, radial, marks)
  return updated
})

setMarks(prev => {
  const updated = prev.filter(m => m.circ !== c)
  saveSnapshot(circular, radial, updated)
  return updated
})

}

const deleteRadial = (r: number) => {
  if (locked) return
  setRadial(prev => prev.filter(x => x !== r))
  setMarks(prev => prev.filter(m => m.rad !== r))
  if (selectedRad === r) setSelectedRad(null)
  saveSnapshot()
}

const saveSnapshot = (
  c = circular,
  r = radial,
  m = marks
) => {
  store.setSnapshot("defect-location", {
    circular: c,
    radial: r,
    marks: m,
    customFields,
    metadata,
    locked
  })
}


  const autoLockIfDataExists = () => {
    if (locked) return
    const hasReject = marks.some(m => m.count > 0)
    if (metadataFilled && hasReject) {
      setLocked(true)
      saveSnapshot()
    }
  }

  const getCell = (c: string, r: number) =>
    marks.find(m => m.circ === c && m.rad === r)?.count || 0

  const setCellValue = (c: string, r: number, val: number) => {
    if (!defectType) return
    setMarks(prev => {
      const exist = prev.find(m => m.circ===c && m.rad===r)
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
    saveSnapshot()
    autoLockIfDataExists()
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

  const totalRow = (c: string) =>
    radial.reduce((s,r)=>s + getCell(c,r), 0)

  const totalCol = (r: number) =>
    circular.reduce((s,c)=>s + getCell(c,r), 0)

  const totalAll = marks.reduce((s,m)=>s+m.count, 0)

  const getDefectList = () => {
    const map = new Map<string,number>()
    marks.forEach(m => {
      map.set(m.defect,(map.get(m.defect)||0)+m.count)
    })
    return Array.from(map.entries()).sort((a,b)=>b[1]-a[1])
  }

  const getSeverityTotals = () => {
    const r = {Minor:0,Major:0,Critical:0}
    marks.forEach(m => r[m.severity]+=m.count)
    return r
  }

  const sortedCircular = [...circular].sort((a,b)=>{
    if (!sortKey) return 0
    if (sortKey==="circ") return sortAsc ? a.localeCompare(b) : b.localeCompare(a)
    if (sortKey==="total") {
      return sortAsc ? totalRow(a) - totalRow(b) : totalRow(b) - totalRow(a)
    }
    return 0
  })

  const setSort = (key: string) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  const paretoData = (() => {
    const arr = circular.map(c => ({
      circ: c,
      total: totalRow(c),
      pct: totalAll>0?(totalRow(c)/totalAll)*100:0
    })).sort((a,b)=>b.total-a.total)
    let running = 0
    return arr.map(x => {
      running+=x.pct
      return {...x,cumPct:running}
    })
  })()

  const focusLocations = paretoData.filter(x=>x.cumPct<=80)

  const worstLocation = circular.reduce((max,c)=>{
    return totalRow(c)>totalRow(max)?c:max
  }, circular[0])

  const addField = () => {
    if (locked) return
    const f = newField.trim()
    if (!f) return
    if (f === "Date") return
    if (customFields.includes(f)) return
    const newFields = [...customFields, f]
    setCustomFields(newFields)
    setMetadata({ ...metadata, [f]: "" })
    setNewField("")
    saveSnapshot()
  }

  const removeField = (f: string) => {
    if (locked) return
    if (f === "Product") return
    if (f === "Date") return
    const newFields = customFields.filter(x => x !== f)
    const m = { ...metadata }
    delete m[f]
    setCustomFields(newFields)
    setMetadata(m)
    saveSnapshot()
  }
function generateNextCircularLabel(arr: string[]) {
  const last = arr[arr.length-1]
  if (/^[A-Z]$/.test(last)) {
    return String.fromCharCode(last.charCodeAt(0)+1)
  }
  return last + "_new"
}

const addCircular = () => {
  if (locked) return
  const next = generateNextCircularLabel(circular)
  setCircular([...circular, next])
  saveSnapshot()
}



const addRadial = () => {
  if (locked) return
  const max = Math.max(...radial)
  setRadial([...radial, max + 1])
  saveSnapshot()
}


const renameCircular = (oldName: string, newName: string) => {
  if (locked) return
  if (!newName.trim()) return
  if (circular.includes(newName)) return
setCircular(prev => {
  const updated = prev.map(c => c === oldName ? newName : c)
  saveSnapshot(updated, radial, marks)
  return updated
})

setMarks(prev => {
  const updated = prev.map(m => m.circ === oldName ? {...m, circ:newName} : m)
  saveSnapshot(circular, radial, updated)
  return updated
})

}
const renameRadial = (oldVal: number, newVal: number) => {
  if (locked) return
  if (radial.includes(newVal)) return
  if (isNaN(newVal)) return

setRadial(prev => {
  const updated = prev.map(r => r === oldVal ? newVal : r)
  saveSnapshot(circular, updated, marks)
  return updated
})

setMarks(prev => {
  const updated = prev.map(m => m.rad === oldVal ? {...m, rad:newVal} : m)
  saveSnapshot(circular, radial, updated)
  return updated
})

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

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get("loc")
    if (encoded) {
      const d = JSON.parse(atob(encoded))
      const filteredFields = d.customFields?.filter((x: string) => x !== "Date") || []
      setCircular(d.circular)
      setRadial(d.radial)
      setMarks(d.marks)
      setCustomFields(filteredFields)
      setMetadata(d.metadata)
      setLocked(d.locked || false)
      return
    }
    const snap = store.getSnapshot("defect-location")
    if(!snap) return
    const d = snap.data as DefectLocationSnapshot
    const filteredFields = d.customFields?.filter(x => x !== "Date") || []
    setCircular(d.circular)
    setRadial(d.radial)
    setMarks(d.marks)
    setCustomFields(filteredFields)
    setMetadata(d.metadata)
    setLocked(d.locked || false)
  },[])

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

  return {
    circular, radial, marks,
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
  increment, decrement,
  applyManual,
  totalRow, totalCol, totalAll,
  addCircular, addRadial,
  renameCircular, renameRadial,
  deleteCircular, deleteRadial,
  sortKey, sortAsc, setSort,
  sortedCircular,
  paretoData,
  focusLocations,
  worstLocation,
  getDefectList,
  getSeverityTotals,
  metadataFilled,
  cellRefs, cellBuffer, setCellBuffer,
  getShareLink,
  exportSnapshot: saveSnapshot,
  doExportCSV, doExportExcel, doExportPDF, getCellDefect,
getCellSeverity
  }
}
