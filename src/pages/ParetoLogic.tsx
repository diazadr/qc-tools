import { useState, useRef, useEffect, useMemo } from "react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Papa from "papaparse"
import type { ParetoChartHandle } from "../components/charts/ParetoChart"
import { useChecksheetStore } from "../store/useChecksheetStore"


 //  TYPE DEFINITIONS

type ParetoSourceKey = "defective-item" | "defect-cause" | "defect-location"

interface ParetoItem {
  category: string
  count: number
  date?: string
}

interface ParetoRow extends ParetoItem {
  percentage: number
  cumulativePercentage: number
}

type NormalizationMode = "none" | "per100" | "per1000" | "per10000" | "custom"

interface ParetoSnapshot {
  items: ParetoItem[]
  date: string
  normalizationMode: NormalizationMode
  customNormalizationBase: number
  smallGroupThreshold: number
  selectedSource: ParetoSourceKey
  metadata: Record<string, string>
}

const DEFAULT_METADATA: Record<string, string> = { date: "" }

  // HOOK UTAMA

export const useParetoLogic = () => {

  //   1) STATE & VARIABEL UI

  const chartRef = useRef<ParetoChartHandle | null>(null)
  const store = useChecksheetStore()

  const [selectedSource, setSelectedSource] = useState<ParetoSourceKey>("defective-item")
  const [items, setItems] = useState<ParetoItem[]>([])
  const [category, setCategory] = useState("")
  const [count, setCount] = useState("")
  const [date, setDate] = useState("")
  const [normalizationMode, setNormalizationMode] = useState<NormalizationMode>("none")
  const [customNormalizationBase, setCustomNormalizationBase] = useState<number>(1000)
  const [smallGroupThreshold, setSmallGroupThreshold] = useState<number>(3)
  const [sortKey, setSortKey] = useState<
    "category" | "count" | "percentage" | "cumulativePercentage" | null
  >("count")
  const [sortAsc, setSortAsc] = useState<boolean>(false)

  const [metadata, setMetadata] = useState<Record<string, string>>(DEFAULT_METADATA)

  //   2) LOAD DATA (STORE, URL SNAPSHOT)

  const loadFromSource = (source: ParetoSourceKey): ParetoItem[] => {
    const snap1 = store.getSnapshot("defective-item")
    const snap2 = store.getSnapshot("defect-cause")
    const snap3 = store.getSnapshot("defect-location")

    if (source === "defective-item" && snap1?.data?.categories) {
      return snap1.data.categories.map((c: any) => ({
        category: c.name,
        count: Object.values(c.counts).reduce((s: any, n: any) => s + n, 0),
      }))
    }

    if (source === "defect-cause" && snap2?.data?.dataset) {
      const map: Record<string, number> = {}
      snap2.data.dataset.forEach((entry: any) => {
        map[entry.type] = (map[entry.type] || 0) + 1
      })
      return Object.entries(map).map(([k, v]) => ({
        category: k,
        count: v as number,
      }))
    }

    if (source === "defect-location" && snap3?.data?.marks) {
      const map: Record<string, number> = {}
      snap3.data.marks.forEach((m: any) => {
        map[m.defect] = (map[m.defect] || 0) + m.count
      })
      return Object.entries(map).map(([k, v]) => ({
        category: k,
        count: v as number,
      }))
    }

    return []
  }

  const reloadFromSource = () => {
    const srcItems = loadFromSource(selectedSource)
    setItems(srcItems)
  }

  // snapshot URL / store
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const encoded = params.get("p")
      if (encoded) {
        const decoded = JSON.parse(atob(encoded)) as Partial<ParetoSnapshot>
        if (decoded.items && Array.isArray(decoded.items)) setItems(decoded.items)
        if (typeof decoded.date === "string") setDate(decoded.date)
        if (decoded.normalizationMode) setNormalizationMode(decoded.normalizationMode)
        if (typeof decoded.customNormalizationBase === "number") setCustomNormalizationBase(decoded.customNormalizationBase)
        if (typeof decoded.smallGroupThreshold === "number") setSmallGroupThreshold(decoded.smallGroupThreshold)
        if (decoded.selectedSource) setSelectedSource(decoded.selectedSource)
        if (decoded.metadata && typeof decoded.metadata === "object") setMetadata(decoded.metadata)
        return
      }
    } catch (e) {}

    const snap = store.getSnapshot("pareto")
    if (snap?.data) {
      const data = snap.data as ParetoSnapshot
      if (Array.isArray(data.items) && data.selectedSource === selectedSource) setItems(data.items)
      if (typeof data.date === "string") setDate(data.date)
      if (data.normalizationMode) setNormalizationMode(data.normalizationMode)
      if (typeof data.customNormalizationBase === "number") setCustomNormalizationBase(data.customNormalizationBase)
      if (typeof data.smallGroupThreshold === "number") setSmallGroupThreshold(data.smallGroupThreshold)
      if (data.selectedSource) setSelectedSource(data.selectedSource)
      if ((data as any).metadata && typeof (data as any).metadata === "object") setMetadata((data as any).metadata)
      return
    }

    const initialSource: ParetoSourceKey[] = ["defective-item", "defect-cause", "defect-location"]
    for (const src of initialSource) {
      const data = loadFromSource(src)
      if (data.length > 0) {
        setSelectedSource(src)
        setItems(data)
        return
      }
    }
  }, [])

  useEffect(() => {
    reloadFromSource()
  }, [selectedSource])

  // Simpan ke snapshot store
  useEffect(() => {
    const snap: ParetoSnapshot = {
      items,
      date,
      normalizationMode,
      customNormalizationBase,
      smallGroupThreshold,
      selectedSource,
      metadata,
    }
    store.setSnapshot("pareto", snap)
  }, [
    items,
    date,
    normalizationMode,
    customNormalizationBase,
    smallGroupThreshold,
    selectedSource,
    metadata,
  ])


  //   3) RUMUS PARETO (TOTAL, SORTING, GROUPING, NORMALIZATION)

  const totalCount = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number.isFinite(it.count) ? it.count : 0), 0)
  }, [items])

  const baseSorted = useMemo(() => {
    const clone = [...items]
    clone.sort((a, b) => b.count - a.count)
    return clone
  }, [items])

  const groupedItems = useMemo(() => {
    if (totalCount <= 0 || smallGroupThreshold <= 0) return baseSorted
    const small: ParetoItem[] = []
    const big: ParetoItem[] = []

    baseSorted.forEach(it => {
      const pct = (it.count / totalCount) * 100
      if (pct < smallGroupThreshold) small.push(it)
      else big.push(it)
    })

    if (small.length === 0) return big

    const sumSmall = small.reduce((s, i) => s + i.count, 0)
    const others: ParetoItem = {
      category: `Others (<${smallGroupThreshold}%)`,
      count: sumSmall,
      date: new Date().toLocaleString(),
    }

    return [...big, others]
  }, [baseSorted, totalCount, smallGroupThreshold])

  const sorted = useMemo(() => {
    if (!sortKey) return groupedItems
    const arr = [...groupedItems]
    arr.sort((a, b) => {
      if (sortKey === "category") {
        const res = (a.category || "").localeCompare(b.category || "")
        return sortAsc ? res : -res
      }
      if (sortKey === "count") {
        const res = a.count - b.count
        return sortAsc ? res : -res
      }
      return 0
    })
    return arr
  }, [groupedItems, sortKey, sortAsc])

  const tableRows: ParetoRow[] = useMemo(() => {
    let cumulative = 0
    return sorted.map(it => {
      cumulative += it.count
      const rawPct = totalCount === 0 ? 0 : (it.count / totalCount) * 100
      const cumPct = totalCount === 0 ? 0 : (cumulative / totalCount) * 100
      let displayValue = rawPct

      if (normalizationMode !== "none" && totalCount > 0) {
        let base = 1000
        if (normalizationMode === "per100") base = 100
        else if (normalizationMode === "per1000") base = 1000
        else if (normalizationMode === "per10000") base = 10000
        else if (normalizationMode === "custom") base = customNormalizationBase > 0 ? customNormalizationBase : 1000
        displayValue = (it.count / totalCount) * base
      }

      return {
        ...it,
        percentage: Number(displayValue.toFixed(1)),
        cumulativePercentage: Number(cumPct.toFixed(1)),
      }
    })
  }, [sorted, totalCount, normalizationMode, customNormalizationBase])

    // 4) ANALISIS TAMBAHAN PARETO

  const summary = useMemo(() => {
    return tableRows.filter(r => r.cumulativePercentage <= 80).map(r => r.category).join(", ")
  }, [tableRows])

  const focusDefects = useMemo(() => {
    return tableRows.filter(r => r.cumulativePercentage <= 80)
  }, [tableRows])

  const focusCoverage = useMemo(() => {
    if (focusDefects.length === 0) return 0
    return focusDefects[focusDefects.length - 1].cumulativePercentage
  }, [focusDefects])

  const topLossRecommendation = useMemo(() => {
    if (tableRows.length === 0) return ""
    const top3 = tableRows.slice(0, 3)
    const top3Total = top3.reduce((s, r) => s + r.count, 0)
    const pct = totalCount === 0 ? 0 : (top3Total / totalCount) * 100
    const names = top3.map(r => r.category).join(", ")
    return `Top 3 defect (${names}) menyumbang ${pct.toFixed(1)}% kerusakan — prioritaskan kategori ini.`
  }, [tableRows, totalCount])

  const dominantCategory = useMemo(() => {
    if (tableRows.length === 0) return null as ParetoRow | null
    let max = tableRows[0]
    tableRows.forEach(r => {
      if (r.count > max.count) max = r
    })
    return max
  }, [tableRows])

  const dominantRatio = useMemo(() => {
    if (!dominantCategory || totalCount === 0) return 0
    return dominantCategory.count / totalCount
  }, [dominantCategory, totalCount])

  const imbalanceScore = useMemo(() => {
    if (tableRows.length === 0 || totalCount === 0) return 0
    const n = tableRows.length
    const avgShare = 1 / n
    let sumAbs = 0
    tableRows.forEach(r => {
      const share = r.count / totalCount
      sumAbs += Math.abs(share - avgShare)
    })
    return sumAbs
  }, [tableRows, totalCount])

  const isSkewed = useMemo(() => dominantRatio >= 0.5, [dominantRatio])
  const isBalanced = useMemo(() => imbalanceScore < 0.3, [imbalanceScore])
  const isSparse = useMemo(() => {
    if (tableRows.length === 0 || totalCount === 0) return false
    return tableRows.every(r => r.count / totalCount < 0.05)
  }, [tableRows, totalCount])

  const summaryDetailText = useMemo(() => {
    const parts: string[] = []
    if (dominantCategory && totalCount > 0) {
      const pct = ((dominantCategory.count / totalCount) * 100).toFixed(1)
      parts.push(`Kategori terbesar: ${dominantCategory.category} (${pct}%)`)
    }
    if (focusDefects.length > 0) {
      parts.push(`Kategori fokus (≤80%): ${focusDefects.map(r => r.category).join(", ")}`)
      parts.push(`Coverage fokus: ${focusCoverage.toFixed(1)}%`)
    }
    if (isSkewed) parts.push("Distribusi sangat condong ke sedikit kategori utama")
    else if (isBalanced) parts.push("Distribusi relatif merata antar kategori")
    if (isSparse) parts.push("Sebagian besar kategori memiliki frekuensi rendah")
    return parts.join(" | ")
  }, [dominantCategory, totalCount, focusDefects, focusCoverage, isSkewed, isBalanced, isSparse])


 //    5) LOGIKA UI — MENAMBAH / EDIT / DELETE ITEM

  const setSort = (key: "category" | "count" | "percentage" | "cumulativePercentage") => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const validateCategoryName = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return false
    return true
  }

  const addItem = () => {
    if (!validateCategoryName(category)) return
    const num = Number(count)
    if (!Number.isFinite(num) || num < 0) return
    const trimmed = category.trim()
    const existingIndex = items.findIndex(
      it => it.category.trim().toLowerCase() === trimmed.toLowerCase()
    )
    if (existingIndex >= 0) {
      const updated = [...items]
      updated[existingIndex] = {
        ...updated[existingIndex],
        count: updated[existingIndex].count + num,
        date: new Date().toLocaleString(),
      }
      setItems(updated)
    } else {
      setItems([
        ...items,
        {
          category: trimmed,
          count: num,
          date: new Date().toLocaleString(),
        },
      ])
    }
    setCategory("")
    setCount("")
  }

  const increment = (index: number) => {
    const updated = [...items]
    if (!updated[index]) return
    updated[index] = { ...updated[index], count: updated[index].count + 1 }
    setItems(updated)
  }

  const decrement = (index: number) => {
    const updated = [...items]
    if (!updated[index]) return
    const newVal = updated[index].count - 1
    updated[index] = { ...updated[index], count: newVal < 0 ? 0 : newVal }
    setItems(updated)
  }

  const reset = (index: number) => {
    const updated = [...items]
    if (!updated[index]) return
    updated[index] = { ...updated[index], count: 0 }
    setItems(updated)
  }

  const clearAll = () => {
    if (confirm("Hapus semua data?")) setItems([])
  }

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index)
    setItems(updated)
  }

  const setItemCount = (index: number, value: number) => {
    if (!Number.isFinite(value) || value < 0) return
    const updated = [...items]
    if (!updated[index]) return
    updated[index] = { ...updated[index], count: value }
    setItems(updated)
  }

  const renameCategory = (index: number, newName: string) => {
    if (!validateCategoryName(newName)) return
    const trimmed = newName.trim()
    const updated = [...items]
    if (!updated[index]) return
    const exists = items.some(
      (it, i) =>
        i !== index &&
        it.category.trim().toLowerCase() === trimmed.toLowerCase()
    )
    if (exists) return
    updated[index] = { ...updated[index], category: trimmed }
    setItems(updated)
  }


 //    6) EXPORT (CSV, EXCEL, JSON, PDF, IMAGE)

  const exportCSV = () => {
    const isPercentMode = normalizationMode === "none"
    const csvData = Papa.unparse(
      tableRows.map(r => ({
        Category: r.category,
        Count: r.count,
        Value: r.percentage + (isPercentMode ? "%" : ""),
        CumPercent: r.cumulativePercentage + "%",
        Date: r.date,
        ...metadata,
      }))
    )
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pareto.csv"
    a.click()
  }

  const exportTopNToCSV = (n: number) => {
    const isPercentMode = normalizationMode === "none"
    const topRows = tableRows.slice(0, n)
    const csvData = Papa.unparse(
      topRows.map(r => ({
        Category: r.category,
        Count: r.count,
        Value: r.percentage + (isPercentMode ? "%" : ""),
        CumPercent: r.cumulativePercentage + "%",
        Date: r.date,
        ...metadata,
      }))
    )
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pareto-topN.csv"
    a.click()
  }

  const exportExcel = () => {
    const isPercentMode = normalizationMode === "none"
    const data = tableRows.map(r => ({
      Category: r.category,
      Count: r.count,
      Value: r.percentage + (isPercentMode ? "%" : ""),
      CumulativePercentage: r.cumulativePercentage + "%",
      Date: r.date,
      ...metadata,
    }))
    const sheet = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheet, "Pareto")
    XLSX.writeFile(wb, "pareto.xlsx")
  }

  const exportJSON = () => {
    const payload = {
      items,
      tableRows,
      totalCount,
      date,
      normalizationMode,
      customNormalizationBase,
      smallGroupThreshold,
      selectedSource,
      metadata,
      focusDefects,
      focusCoverage,
      dominantCategory,
      dominantRatio,
      imbalanceScore,
      isSkewed,
      isBalanced,
      isSparse,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pareto.json"
    a.click()
  }

  const exportChartImage = () => {
    if (!chartRef.current) return
    const png = chartRef.current.getImageDataUrl()
    if (!png) return
    const a = document.createElement("a")
    a.href = png
    a.download = "pareto-chart.png"
    a.click()
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text("QC — Pareto Report", 14, 14)
    doc.text(`Date: ${date || "-"}`, 14, 30)

    Object.keys(metadata).forEach((k, i) => {
      const y = 46 + i * 8
      doc.text(`${k}: ${metadata[k] || "-"}`, 14, y)
    })

    autoTable(doc, {
      startY: 46 + Object.keys(metadata).length * 8,
      head: [["Kategori", "Jumlah", "Nilai", "Kumulatif%", "Operator", "Shift", "Line", "Tanggal"]],
      body: tableRows.map(r => [
        r.category || "",
        r.count || 0,
        normalizationMode === "none" ? `${r.percentage}%` : `${r.percentage}`,
        r.cumulativePercentage + "%",
        r.date || "",
      ]),
    })

    const y = (doc as any).lastAutoTable.finalY + 10
    doc.text("Ringkasan:", 12, y)
    doc.text(summary || "-", 12, y + 8)
    doc.text("Detail:", 12, y + 16)
    doc.text(summaryDetailText || "-", 12, y + 24)
    doc.save("pareto.pdf")
  }

  const getShareLink = () => {
    const snapshot: ParetoSnapshot = {
      items,
      date,
      normalizationMode,
      customNormalizationBase,
      smallGroupThreshold,
      selectedSource,
      metadata,
    }
    const json = JSON.stringify(snapshot)
    const base64 = btoa(json)
    return `${window.location.origin}${window.location.pathname}?p=${base64}`
  }

   //  7) IMPORT (CSV / EXCEL)

  const importFromCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: result => {
        const rows = result.data as any[]
        const map: Record<string, number> = {}
        rows.forEach(r => {
          const name = (r.Category || r.category || "").toString().trim()
          const rawCount = r.Count ?? r.count ?? 0
          const num = Number(rawCount)
          if (!name || !Number.isFinite(num) || num < 0) return
          map[name] = (map[name] || 0) + num
        })
        const imported: ParetoItem[] = Object.entries(map).map(([k, v]) => ({
          category: k,
          count: v as number,
        }))
        setItems(imported)
      },
    })
  }

  const importFromExcel = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: "array" })
      const wsName = wb.SheetNames[0]
      const ws = wb.Sheets[wsName]
      const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" })
      const map: Record<string, number> = {}
      json.forEach(r => {
        const name =
          (r.Category ||
            r.category ||
            r.Kategori ||
            r.kategori ||
            "").toString().trim()
        const rawCount = r.Count ?? r.count ?? r.Jumlah ?? r.jumlah ?? 0
        const num = Number(rawCount)
        if (!name || !Number.isFinite(num) || num < 0) return
        map[name] = (map[name] || 0) + num
      })
      const imported: ParetoItem[] = Object.entries(map).map(([k, v]) => ({
        category: k,
        count: v as number,
      }))
      setItems(imported)
    }
    reader.readAsArrayBuffer(file)
  }

  //   8) RETURN BINDINGS UNTUK UI

  return {
    chartRef,
    items,
    setItems,
    category,
    setCategory,
    count,
    setCount,
    date,
    setDate,
    normalizationMode,
    setNormalizationMode,
    customNormalizationBase,
    setCustomNormalizationBase,
    smallGroupThreshold,
    setSmallGroupThreshold,
    sortKey,
    sortAsc,
    setSort,
    selectedSource,
    setSelectedSource,
    reloadFromSource,
    totalCount,
    groupedItems,
    sorted,
    tableRows,
    summary,
    summaryDetailText,
    focusDefects,
    focusCoverage,
    dominantCategory,
    dominantRatio,
    imbalanceScore,
    isSkewed,
    isBalanced,
    isSparse,
    addItem,
    increment,
    decrement,
    reset,
    removeItem,
    clearAll,
    setItemCount,
    renameCategory,
    exportCSV,
    exportTopNToCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    exportChartImage,
    getShareLink,
    importFromCSV,
    importFromExcel,
    topLossRecommendation,
    metadata,
    setMetadata,
  }
}
