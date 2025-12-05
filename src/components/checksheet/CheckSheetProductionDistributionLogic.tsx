import { useEffect, useState } from "react"
import { useChecksheetStore } from "../../store/useChecksheetStore"
import { exportExcel } from "../../utils/dataio/excel/excel"
import { exportCSV } from "../../utils/dataio/csv/csv"
import { exportPDF } from "../../utils/dataio/pdf/pdf"

export interface DevRow {
  deviation: number
  count: number
}

export interface SnapshotDistribution {
  metadata: Record<string, string>
  customFields: string[]

  target: number
  LSL: number
  USL: number
  binSize: number

  rows: DevRow[]
  unit: string
  locked: boolean
}

const DEFAULT_FIELDS = ["Product", "Operator", "Line"]
const DEFAULT_METADATA: Record<string, string> = {
  date: new Date().toISOString().slice(0, 10),
  product: "",
  operator: "",
  line: "",
}
const DEFAULT_ROWS = Array.from({ length: 21 }, (_, i) => ({
  deviation: i - 10,
  count: 0
}))
const DEFAULT_UNIT = "mm"

export const useDistributionLogic = () => {

  const store = useChecksheetStore()

  const [target, setTarget] = useState(8.3)
  const [LSL, setLSL] = useState(-8)
  const [USL, setUSL] = useState(8)
  const [binSize, setBinSize] = useState(0.001)
  const [unit, setUnit] = useState(DEFAULT_UNIT)

  const [metadata, setMetadata] = useState<Record<string, string>>(DEFAULT_METADATA)
  const [customFields, setCustomFields] = useState(DEFAULT_FIELDS)
  const [newField, setNewField] = useState("")

  const [rows, setRows] = useState<DevRow[]>(DEFAULT_ROWS)
  const [locked, setLocked] = useState(false)
  const [selectedDev, setSelectedDev] = useState<number | null>(null)
  const [manualInput, setManualInput] = useState(0)

const encodeURLSafe = (str: string) =>
  btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

const decodeURLSafe = (str: string) => {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4))
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad
  return atob(base64)
}

  const getShareLink = () => {
    const snapshot = {
      metadata,
      customFields,
      target,
      LSL,
      USL,
      binSize,
      unit,
      rows,
    }

    const json = JSON.stringify(snapshot)
    const encoded = encodeURLSafe(json)

    // Tetap pada path sekarang
    const baseURL = window.location.href.split("?")[0]

    return `${baseURL}?dist=${encoded}`
  }

  const preparedRows = rows.map(r => ({
    deviation: r.deviation,
    count: r.count,
    actual: target + r.deviation * binSize
  }))

  const doExportCSV = () => {
    exportCSV(
      {
        type: "DISTRIBUTION",
        title: metadata.product || "Distribution",
        metadata,
        customFields,
        rows: preparedRows,
        target,
        LSL,
        USL,
        binSize,
        unit,
      },
      "distribution"
    )
  }

  const doExportExcel = () => {
    exportExcel(
      {
        type: "DISTRIBUTION",
        title: metadata.product || "Distribution",
        metadata,
        customFields,
        rows: preparedRows,
        target,
        LSL,
        USL,
        binSize,
        unit,
      },
      "distribution"
    )
  }


  const doExportPDF = () => {
    exportPDF(
      {
        type: "DISTRIBUTION",
        title: metadata.product || "Distribution",
        metadata,
        customFields,
        rows: preparedRows,
        target,
        LSL,
        USL,
        binSize,
        unit,
      },
      "distribution"
    )
  }


  const metadataFilled =
    customFields.every(f => (metadata[f] ?? "").trim()) &&
    (metadata.date ?? "").trim()

  const autoLockIfDataExists = () => {
    if (locked) return
    const hasCount = rows.some(r => r.count > 0)
    if (metadataFilled && hasCount) {
      setLocked(true)
      saveSnapshot()
    }
  }

  useEffect(() => {

    const params = new URLSearchParams(window.location.search)
    const encoded = params.get("dist")
    if (encoded) {
      const decoded = JSON.parse(decodeURLSafe(encoded))

      setMetadata(decoded.metadata || DEFAULT_METADATA)
      setCustomFields(decoded.customFields || DEFAULT_FIELDS)
      setTarget(decoded.target || 8.3)
      setLSL(decoded.LSL ?? -8)
      setUSL(decoded.USL ?? 8)
      setBinSize(decoded.binSize ?? 0.001)
      setUnit(decoded.unit || DEFAULT_UNIT)
      setRows(decoded.rows || DEFAULT_ROWS)
      return
    }

    const snap = store.getSnapshot("distribution")
    if (snap) {
      const data = snap.data as SnapshotDistribution
      setMetadata(data.metadata || DEFAULT_METADATA)
      setCustomFields(data.customFields || DEFAULT_FIELDS)
      setTarget(data.target)
      setLSL(data.LSL)
      setUSL(data.USL)
      setBinSize(data.binSize)
      setRows(data.rows)
      setLocked(data.locked)
      setUnit(data.unit)
    }
  }, [])

  const saveSnapshot = () => {
    store.setSnapshot("distribution", {
      metadata,
      customFields,
      target,
      LSL,
      USL,
      binSize,
      rows,
      locked,
      unit
    })
  }

  const increment = () => {
    if (selectedDev === null || locked) return
    setRows(prev => prev.map(r =>
      rows.indexOf(r) === selectedDev
        ? { ...r, count: r.count + 1 } : r
    ))
    saveSnapshot()
    autoLockIfDataExists()
  }

  const decrement = () => {
    if (selectedDev === null || locked) return
    setRows(prev => prev.map(r =>
      rows.indexOf(r) === selectedDev
        && r.count > 0
        ? { ...r, count: r.count - 1 }
        : r
    ))
    saveSnapshot()
    autoLockIfDataExists()
  }
  const applyManualInput = () => {
    if (selectedDev === null || locked) return
    if (manualInput < 0) return
    setRows(prev => prev.map((r, i) =>
      i === selectedDev ? { ...r, count: manualInput } : r
    ))
    setManualInput(0)
    saveSnapshot()
    autoLockIfDataExists()
  }
  const updateCount = (index: number, value: number) => {
    setRows(prev => prev.map((r, i) =>
      i === index ? { ...r, count: value } : r
    ))
    saveSnapshot()
    autoLockIfDataExists()
  }


  const clearSelected = () => {
    if (selectedDev === null || locked) return
    setRows(prev => prev.map((r, i) =>
      i === selectedDev ? { ...r, count: 0 } : r
    ))
    saveSnapshot()
  }


  const clearAll = () => {
    if (!confirm("Clear data?")) return
    setMetadata(DEFAULT_METADATA)
    setCustomFields(DEFAULT_FIELDS)
    setRows(DEFAULT_ROWS)
    setTarget(8.3)
    setLSL(-8)
    setUSL(8)
    setBinSize(0.001)
    setLocked(false)
    saveSnapshot()
  }

  const addField = () => {
    if (locked) return
    const f = newField.trim()
    if (!f) return
    if (customFields.includes(f)) return
    if (f === "date") return

    const newCustom = [...customFields, f]
    setCustomFields(newCustom)
    setMetadata({ ...metadata, [f]: "" })
    setNewField("")
    saveSnapshot()
  }

  const removeField = (f: string) => {
    if (locked) return
    if (f === "date") return

    const newFields = customFields.filter(x => x !== f)
    const m = { ...metadata }
    delete m[f]
    setCustomFields(newFields)
    setMetadata(m)
    saveSnapshot()
  }

  const totalCount = rows.reduce((s, r) => s + r.count, 0)

  const LSLActual = target + LSL * binSize
  const USLActual = target + USL * binSize

  let inSpec = 0
  let outSpec = 0

  rows.forEach(r => {
    const actual = target + r.deviation * binSize
    if (r.count <= 0) return
    if (actual < LSLActual || actual > USLActual) outSpec += r.count
    else inSpec += r.count
  })

  const worstDeviation = rows.reduce(
    (max, cur) => cur.count > max.count ? cur : max,
    { deviation: 0, count: -1 }
  )


  return {
    target, setTarget,
    LSL, setLSL,
    USL, setUSL,
    binSize, setBinSize,
    unit, setUnit,

    metadata, setMetadata,
    customFields, setCustomFields,
    newField, setNewField,
    addField, removeField,

    rows, setRows,
    locked, setLocked,
    selectedDev, setSelectedDev,
    manualInput, setManualInput,

    increment, decrement,
    applyManualInput, clearSelected, clearAll,
    saveSnapshot,
    getShareLink,
    doExportCSV, doExportExcel, doExportPDF, updateCount,
    totalCount,
    inSpec,
    outSpec,
    worstDeviation,
    LSLActual,
    USLActual,

  }
}
