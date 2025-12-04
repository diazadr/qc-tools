import { useState, useMemo, useEffect, useRef } from "react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Papa from "papaparse"
import { useChecksheetStore } from "../store/useChecksheetStore"

// TYPES

type HistogramSourceKey =
    | "production-distribution"
    | "defective-item"
    | "defect-location"
    | "defect-cause"
    | "manual"

interface HistogramItem {
    category: string
    count: number
    date?: string
}

interface HistogramRow extends HistogramItem {
    percentage: number
}

interface HistogramSnapshot {
    bins?: number
    manualData?: number[] | null
    items?: HistogramItem[]
    selectedSource?: HistogramSourceKey
    metadata?: {
        lsl?: number | null
        usl?: number | null
    }
    date?: string
}

// MAIN HOOK

export const useHistogramLogic = () => {
    const store = useChecksheetStore()

    // STATE & UI

    const chartRef = useRef<any>(null)
    const [showNormalCurve, setShowNormalCurve] = useState(false)
    const [bins, setBins] = useState(8)
    const [inputData, setInputData] = useState("")
    const [numbersManual, setNumbersManual] = useState<number[] | null>(null)
    const [selectedSource, setSelectedSource] =
        useState<HistogramSourceKey>("manual")
    const [items, setItems] = useState<HistogramItem[]>([])
    const [varianceMode] = useState<"sample" | "population">("sample")
    const [metadata, setMetadata] = useState<{ lsl?: number | null; usl?: number | null }>({})

    // SNAPSHOT LOADING

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search)
            const encoded = params.get("p")
            if (encoded) {
                const decoded = JSON.parse(atob(encoded)) as Partial<HistogramSnapshot>
                if (decoded.items) setItems(decoded.items)
                if (decoded.bins) setBins(decoded.bins)
                if (decoded.manualData) setNumbersManual(decoded.manualData)
                if (decoded.selectedSource) setSelectedSource(decoded.selectedSource)
                return
            }
        } catch { }

        const snap = store.getSnapshot("histogram")
        if (snap?.data) {
            const d = snap.data
            if (d.items) setItems(d.items)
            if (d.bins) setBins(d.bins)
            if (d.manualData) setNumbersManual(d.manualData)
            if (d.selectedSource) setSelectedSource(d.selectedSource)
            if (d.metadata) setMetadata(d.metadata)
            return
        }
        setSelectedSource("manual")
    }, [])

    // SNAPSHOT SAVE

    useEffect(() => {
        const snap: HistogramSnapshot = {
            bins,
            manualData: numbersManual,
            items,
            selectedSource,
            metadata,
            date: new Date().toLocaleString(),
        }
        store.setSnapshot("histogram", snap)
    }, [bins, numbersManual, items, selectedSource, metadata])

    // SOURCE HANDLING

    const autoNumbers = useMemo(() => {
        const s1 = store.getSnapshot("production-distribution")
        const s2 = store.getSnapshot("defective-item")
        const s3 = store.getSnapshot("defect-location")
        const s4 = store.getSnapshot("defect-cause")

        if (s1?.data?.rows) {
            const arr: number[] = []
            s1.data.rows.forEach((r: any) => {
                for (let i = 0; i < r.count; i++) {
                    arr.push(Number(s1.data.target) + r.deviation * s1.data.binSize)
                }
            })
            return arr
        }

        if (s2?.data?.categories) {
            return s2.data.categories.map((c: any) =>
                Object.values(c.counts).reduce((s: any, n: any) => s + n, 0)
            )
        }

        if (s3?.data?.marks) return s3.data.marks.map((m: any) => m.count)

        if (s4?.data?.dataset) {
            const map: Record<string, number> = {}
            s4.data.dataset.forEach((e: any) => {
                const k = e.type ?? "Unknown"
                map[k] = (map[k] || 0) + 1
            })
            return Object.values(map)
        }

        return []
    }, [
        store.snapshots["production-distribution"],
        store.snapshots["defective-item"],
        store.snapshots["defect-location"],
        store.snapshots["defect-cause"],
    ])

    // Reload jika ganti source
    const reloadFromSource = () => {
        setMetadata({})
        if (selectedSource === "manual") return

        if (selectedSource === "production-distribution") {
            setNumbersManual(autoNumbers)
            setItems([])
            return
        }

        const snap = store.getSnapshot(selectedSource)
        if (!snap?.data) return

        if (selectedSource === "defective-item") {
            const nums = snap.data.categories.map((c: any) =>
                Object.values(c.counts).reduce((s: any, n: any) => s + n, 0)
            )
            setNumbersManual(nums)
            setItems([])
            return
        }

        if (selectedSource === "defect-cause") {
            const map: Record<string, number> = {}
            snap.data.dataset.forEach((e: any) => {
                const k = e.type ?? "Unknown"
                map[k] = (map[k] || 0) + 1
            })
            setNumbersManual(Object.values(map))
            setItems([])
            return
        }

        if (selectedSource === "defect-location") {
            const nums = snap.data.marks.map((m: any) => m.count)
            setNumbersManual(nums)
            setItems([])
            return
        }
    }

    useEffect(() => reloadFromSource(), [selectedSource])

    const data = numbersManual ?? autoNumbers

    // STATISTICS (MEAN, MEDIAN, MODE, RANGE, VARIANCE, STDEV)

    const mean = useMemo(
        () =>
            data.length
                ? data.reduce((a: number, b: number) => a + b, 0) / data.length
                : 0,
        [data]
    )

    const sorted = useMemo(() => [...data].sort((a, b) => a - b), [data])

    const median = useMemo(() => {
        if (!sorted.length) return 0
        return sorted.length % 2
            ? sorted[Math.floor(sorted.length / 2)]
            : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    }, [sorted])

    const mode = useMemo(() => {
        const freq: Record<number, number> = {}
        data.forEach((n: number) => {
            freq[n] = (freq[n] || 0) + 1
        })
        const keys = Object.keys(freq).map(Number) as number[]
        if (!keys.length) return 0
        return keys.reduce((a: number, b: number) =>
            freq[a] > freq[b] ? a : b
            , keys[0])
    }, [data])

    const range = useMemo(
        () => (sorted.length ? sorted[sorted.length - 1] - sorted[0] : 0),
        [sorted]
    )

    const variance = useMemo(() => {
        if (data.length <= 1) return 0
        const divisor = varianceMode === "sample" ? data.length - 1 : data.length
        return data.reduce((s: number, x: number) => s + Math.pow(x - mean, 2), 0) / divisor
    }, [data, mean, varianceMode])

    const stddev = useMemo(() => Math.sqrt(variance), [variance])

    // CP / CPK
    const cp = useMemo(() => {
        if (!metadata.lsl || !metadata.usl || stddev === 0) return null
        return (metadata.usl - metadata.lsl) / (6 * stddev)
    }, [metadata, stddev])

    const cpk = useMemo(() => {
        if (!metadata.lsl || !metadata.usl || stddev === 0) return null
        const cpu = (metadata.usl - mean) / (3 * stddev)
        const cpl = (mean - metadata.lsl) / (3 * stddev)
        return Math.min(cpu, cpl)
    }, [metadata, mean, stddev])

    // HISTOGRAM BIN GENERATION

    const computeBookStyleBins = (arr: number[], binCount: number) => {
        if (!arr.length) return []
        const min = Math.min(...arr)
        const max = Math.max(...arr)
        const span = max - min || 1
        const width = span / binCount

        const bins = Array.from({ length: binCount }).map((_, i) => {
            const lower = min + i * width
            const upper = lower + width
            return {
                lower,
                upper,
                midpoint: (lower + upper) / 2,
                count: 0,
            }
        })

        arr.forEach(v => {
            let idx = Math.floor((v - min) / width)
            if (v === max) idx = binCount - 1
            bins[idx].count++
        })

        return bins
    }

    const histogramBase = useMemo(() => {
        if (items.length)
            return items.map(i => ({
                label: i.category,
                count: i.count,
                lower: null,
                upper: null,
                midpoint: null,
            }))

        const book = computeBookStyleBins(data, bins)
        return book.map(b => ({
            label: `${b.lower.toFixed(4)} – ${b.upper.toFixed(4)}`,
            count: b.count,
            lower: b.lower,
            upper: b.upper,
            midpoint: b.midpoint,
        }))
    }, [items, data, bins])

    // OUTLIER

    const zScores = data.map((v: number) => (v - mean) / stddev)
    const outliersZ = data.filter((_value: number, i: number) => {
        return Math.abs(zScores[i]) > 3
    })
    const sortedCopy = [...data].sort((a: number, b: number) => a - b)
    const q1 = sortedCopy[Math.floor(sortedCopy.length * 0.25)]
    const q3 = sortedCopy[Math.floor(sortedCopy.length * 0.75)]
    const iqr = q3 - q1

    const outliersTukey = data.filter((v: number) => {
        return v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr
    })

    const sturgesBins = (n: number): number => {
        return Math.max(1, Math.ceil(1 + Math.log2(n)))
    }

    const freedmanDiaconisBins = (arr: number[]) => {
        if (arr.length < 2) return 1
        const sortedArr = [...arr].sort((a, b) => a - b)
        const q1 = sortedArr[Math.floor(sortedArr.length * 0.25)]
        const q3 = sortedArr[Math.floor(sortedArr.length * 0.75)]
        const iqr = q3 - q1
        const binWidth = (2 * iqr) / Math.cbrt(arr.length)
        if (binWidth <= 0) return sturgesBins(arr.length)

        const min = sortedArr[0]
        const max = sortedArr[sortedArr.length - 1]
        return Math.max(1, Math.ceil((max - min) / binWidth))
    }


    // TABLE & SUMMARY

    const totalCount = useMemo(
        () => histogramBase.reduce((s, r) => s + r.count, 0),
        [histogramBase]
    )

    const tableRows: HistogramRow[] = useMemo(
        () =>
            histogramBase.map(r => ({
                category: r.label,
                count: r.count,
                percentage: totalCount ? Number(((r.count / totalCount) * 100).toFixed(1)) : 0,
                lower: r.lower,
                upper: r.upper,
                midpoint: r.midpoint,
                date: new Date().toLocaleString(),
            })),
        [histogramBase, totalCount]
    )

    const summary = useMemo(
        () => tableRows.map(r => r.category).join(", "),
        [tableRows]
    )

    const summaryDetailText = useMemo(() => {
        if (!tableRows.length || totalCount === 0) return ""
        const max = tableRows.reduce((m, r) => (r.count > m.count ? r : m), tableRows[0])
        const pct = ((max.count / totalCount) * 100).toFixed(1)
        return `Kategori terbesar: ${max.category} (${pct}%)`
    }, [tableRows, totalCount])

    // GROUPED STATS

    const meanGrouped = useMemo(() => {
        let sumFM = 0
        let sumF = 0
        histogramBase.forEach(r => {
            if (r.midpoint !== null) {
                sumFM += r.midpoint * r.count
                sumF += r.count
            }
        })
        return sumF ? sumFM / sumF : 0
    }, [histogramBase])

    const varianceGrouped = useMemo(() => {
        let sumF = 0
        let S = 0
        histogramBase.forEach(r => {
            if (r.midpoint !== null) {
                const diff = r.midpoint - meanGrouped
                S += r.count * diff * diff
                sumF += r.count
            }
        })
        return sumF > 1 ? S / (sumF - 1) : 0
    }, [histogramBase, meanGrouped])

    const stddevGrouped = useMemo(() => Math.sqrt(varianceGrouped), [varianceGrouped])

    const modeGrouped = useMemo(() => {
        if (!histogramBase.length) return null
        return histogramBase.reduce((max, r) => (r.count > max.count ? r : max), histogramBase[0])
    }, [histogramBase])

    // NORMAL CURVE

    const normalCurvePoints = useMemo(() => {
        if (!showNormalCurve || !data.length || stddev === 0) return []
        const min = Math.min(...data)
        const max = Math.max(...data)
        const step = (max - min) / 50

        const raw = []
        for (let x = min; x <= max; x += step) {
            const fx =
                (1 / (stddev * Math.sqrt(2 * Math.PI))) *
                Math.exp(-((x - mean) ** 2) / (2 * (stddev ** 2)))

            raw.push({ x, fx })
        }

        const maxFx = Math.max(...raw.map(r => r.fx))
        const maxCount = Math.max(...histogramBase.map(r => r.count), 1)

        return raw.map(r => ({
            x: r.x,
            y: r.fx * (maxCount / maxFx),
        }))
    }, [showNormalCurve, data, mean, stddev, histogramBase])

    // UI FUNCTIONS

    const clearAll = () => {
        if (confirm("Hapus semua data?")) {
            setItems([])
            setNumbersManual(null)
            setSelectedSource("manual")
        }
    }

    const parseManualInput = () => {
        setMetadata({})
        const parsed = inputData
            .split(/[\s,;]+/)
            .map(v => parseFloat(v))
            .filter(v => !isNaN(v))

        if (parsed.length) {
            setNumbersManual(parsed)
            setItems([])
            setSelectedSource("manual")
        }
    }

    // IMPORT

    const importFromCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: result => {
                const rows = result.data as any[]
                const byCategory: Record<string, number> = {}
                const numericValues: number[] = []

                rows.forEach(r => {
                    const name = (r.Category || r.category || r.name || "").toString().trim()
                    const rawCount = r.Count ?? r.count ?? r.Value

                    if (name && rawCount == null) {
                        const v = Number(r.Value)
                        if (Number.isFinite(v)) numericValues.push(v)
                        return
                    }

                    const num = Number(rawCount)
                    if (!name && Number.isFinite(num)) numericValues.push(num)
                    if (name && Number.isFinite(num)) {
                        byCategory[name] = (byCategory[name] || 0) + num
                    }
                })

                if (numericValues.length) {
                    setNumbersManual(numericValues)
                    setItems([])
                    return
                }

                const imported = Object.entries(byCategory).map(([k, v]) => ({
                    category: k,
                    count: v,
                    date: new Date().toLocaleString(),
                }))
                setItems(imported)
                setNumbersManual(null)
            },
        })
    }

    const importFromExcel = (file: File) => {
        const reader = new FileReader()
        reader.onload = e => {
            const dataArr = new Uint8Array(e.target?.result as ArrayBuffer)
            const wb = XLSX.read(dataArr, { type: "array" })
            const ws = wb.Sheets[wb.SheetNames[0]]
            const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" })

            const byCategory: Record<string, number> = {}
            const numericValues: number[] = []

            json.forEach(r => {
                const name = (r.Category || r.category || r.Name || "").toString().trim()
                const rawCount = r.Count ?? r.count ?? r.Value

                if (name && rawCount == null) {
                    const v = Number(r.Value)
                    if (Number.isFinite(v)) numericValues.push(v)
                    return
                }

                const num = Number(rawCount)
                if (!name && Number.isFinite(num)) numericValues.push(num)
                if (name && Number.isFinite(num)) {
                    byCategory[name] = (byCategory[name] || 0) + num
                }
            })

            if (numericValues.length) {
                setNumbersManual(numericValues)
                setItems([])
                return
            }

            const imported = Object.entries(byCategory).map(([k, v]) => ({
                category: k,
                count: v,
                date: new Date().toLocaleString(),
            }))
            setItems(imported)
            setNumbersManual(null)
        }
        reader.readAsArrayBuffer(file)
    }

    // EXPORT

    const exportCSV = () => {
        const csvData = Papa.unparse(
            tableRows.map(r => ({
                Category: r.category,
                Count: r.count,
                Value: `${r.percentage}%`,
                Date: r.date,
            }))
        )
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "histogram.csv"
        a.click()
    }

    const exportExcel = () => {
        const dataForSheet = tableRows.map(r => ({
            Category: r.category,
            Count: r.count,
            Value: `${r.percentage}%`,
            Date: r.date,
        }))

        const sheet = XLSX.utils.json_to_sheet(dataForSheet)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, sheet, "Histogram")
        XLSX.writeFile(wb, "histogram.xlsx")
    }

    const exportJSON = () => {
        const payload = {
            items,
            tableRows,
            totalCount,
            bins,
            selectedSource,
            summary,
            summaryDetailText,
            date: new Date().toLocaleString(),
        }
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json;charset=utf-8;",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "histogram.json"
        a.click()
    }

    const exportPDF = () => {
        const doc = new jsPDF()
        doc.text("QC — Histogram Report", 14, 16)

        autoTable(doc, {
            startY: 50,
            head: [["Kategori/Bin", "Jumlah", "Nilai"]],
            body: tableRows.map(r => [r.category, r.count, `${r.percentage}%`]),
        })

        const y = (doc as any).lastAutoTable.finalY + 10
        doc.text("Ringkasan:", 12, y)
        doc.text(summary || "-", 12, y + 8)
        doc.text("Detail:", 12, y + 16)
        doc.text(summaryDetailText || "-", 12, y + 24)

        doc.save("histogram.pdf")
    }

    const exportChartImage = () => {
        if (!chartRef.current) return
        const png = chartRef.current.getImageDataUrl?.()
        if (!png) return
        const a = document.createElement("a")
        a.href = png
        a.download = "histogram-chart.png"
        a.click()
    }

    const getShareLink = () => {
        const snapshot: HistogramSnapshot = {
            items,
            bins,
            metadata,
            manualData: numbersManual,
            selectedSource,
            date: new Date().toLocaleString(),
        }
        const json = JSON.stringify(snapshot)
        return `${window.location.origin}${window.location.pathname}?p=${btoa(json)}`
    }

    // RETURN API

    return {
        // UI refs
        chartRef,

        // data
        data,
        items,
        numbersManual,
        histogramBase,
        tableRows,
        totalCount,

        // ui state
        bins,
        setBins,
        setItems,
        selectedSource,
        setSelectedSource,
        inputData,
        setInputData,
        metadata,
        setMetadata,
        showNormalCurve,
        setShowNormalCurve,

        // action: source
        reloadFromSource,
        clearAll,
        parseManualInput,

        // stats
        mean,
        median,
        mode,
        range,
        variance,
        stddev,
        cp,
        cpk,
        outliersZ,
        outliersTukey,
        freedmanDiaconisBins,
        meanGrouped,
        stddevGrouped,
        varianceGrouped,
        modeGrouped,


        normalCurvePoints,

        // import
        importFromCSV,
        importFromExcel,

        // export
        exportCSV,
        exportExcel,
        exportJSON,
        exportPDF,
        exportChartImage,
        getShareLink,

        // summary
        summary,
        summaryDetailText,
    }
}
