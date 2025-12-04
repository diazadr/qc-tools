import { useState, useMemo, useEffect, useRef } from "react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Papa from "papaparse"
import { useChecksheetStore } from "../store/useChecksheetStore"

type HistogramSourceKey = "production-distribution" | "defective-item" | "defect-location" | "defect-cause" | "manual"

interface HistogramItem {
    category: string
    count: number
    operator?: string
    shift?: string
    line?: string
    date?: string
}

interface HistogramRow extends HistogramItem {
    percentage: number
}

interface HistogramSnapshot {
    operator?: string
    shift?: string
    line?: string
    bins?: number
    manualData?: number[] | null
    items?: HistogramItem[]
    selectedSource?: HistogramSourceKey
    customFields?: string[]
    metadata?: Record<string, string>
    date?: string
}

const DEFAULT_CUSTOM_FIELDS = ["Product"]
const DEFAULT_METADATA: Record<string, string> = { product: "", date: "" }

export const useHistogramLogic = () => {
    const store = useChecksheetStore()

    const chartRef = useRef<any | null>(null)
    const [showNormalCurve, setShowNormalCurve] = useState(false)
    const [operator, setOperator] = useState("")
    const [shift, setShift] = useState("")
    const [line, setLine] = useState("")
    const [bins, setBins] = useState(8)
    const [inputData, setInputData] = useState("")
    const [numbersManual, setNumbersManual] = useState<number[] | null>(null)

    const [selectedSource, setSelectedSource] = useState<HistogramSourceKey>("manual")
    const [items, setItems] = useState<HistogramItem[]>([])
    const [category, setCategory] = useState("")
    const [count, setCount] = useState("")
    const [customFields, setCustomFields] = useState<string[]>(DEFAULT_CUSTOM_FIELDS)
    const [newField, setNewField] = useState("")
    const [metadata, setMetadata] = useState<Record<string, string>>(DEFAULT_METADATA)
    const [varianceMode] = useState<"sample" | "population">("sample")

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search)
            const encoded = params.get("p")
            if (encoded) {
                const decoded = JSON.parse(atob(encoded)) as Partial<HistogramSnapshot>
                if (Array.isArray(decoded.items)) setItems(decoded.items)
                if (typeof decoded.operator === "string") setOperator(decoded.operator)
                if (typeof decoded.shift === "string") setShift(decoded.shift)
                if (typeof decoded.line === "string") setLine(decoded.line)
                if (typeof decoded.date === "string") setInputData(decoded.date)
                if (typeof decoded.bins === "number") setBins(decoded.bins)
                if (decoded.selectedSource) setSelectedSource(decoded.selectedSource)
                if (Array.isArray(decoded.customFields)) setCustomFields(decoded.customFields)
                if (decoded.metadata && typeof decoded.metadata === "object") setMetadata(decoded.metadata)
                if (Array.isArray(decoded.manualData)) setNumbersManual(decoded.manualData)
                return
            }
        } catch (e) { }

        const snap = store.getSnapshot("histogram")
        if (snap?.data) {
            const data = snap.data as HistogramSnapshot
            if (Array.isArray(data.items)) setItems(data.items)
            if (typeof data.operator === "string") setOperator(data.operator)
            if (typeof data.shift === "string") setShift(data.shift)
            if (typeof data.line === "string") setLine(data.line)
            if (typeof data.bins === "number") setBins(data.bins)
            if (data.selectedSource) setSelectedSource(data.selectedSource)
            if (Array.isArray((data as any).customFields)) setCustomFields((data as any).customFields)
            if ((data as any).metadata && typeof (data as any).metadata === "object") setMetadata((data as any).metadata)
            if (Array.isArray(data.manualData)) setNumbersManual(data.manualData)
            return
        }

        setSelectedSource("manual")
    }, []) // eslint-disable-line

    useEffect(() => {
        const snap: HistogramSnapshot = {
            operator,
            shift,
            line,
            bins,
            manualData: numbersManual,
            items,
            selectedSource,
            customFields,
            metadata,
            date: new Date().toLocaleString(),
        }
        store.setSnapshot("histogram", snap)
    }, [operator, shift, line, bins, numbersManual, items, selectedSource, customFields, metadata]) // eslint-disable-line

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
                (Object.values(c.counts) as number[]).reduce((s, n) => s + n, 0)
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
    ]) // eslint-disable-line

    const reloadFromSource = () => {
        if (selectedSource === "manual") return
        if (selectedSource === "production-distribution") {
            const nums = autoNumbers
            setNumbersManual(nums.length ? nums : null)
            setItems([])
            return
        }
        const snap = store.getSnapshot(selectedSource)
        if (!snap?.data) return
        if (selectedSource === "defective-item") {
            const nums = snap.data.categories.map((c: any) =>
                (Object.values(c.counts) as number[]).reduce((s, n) => s + n, 0)
            )
            setNumbersManual(nums)
            setItems([])
            return

        }

        if (selectedSource === "defect-cause" && snap.data.dataset) {
            const map: Record<string, number> = {}
            snap.data.dataset.forEach((entry: any) => {
                const k = entry.type ?? "Unknown"
                map[k] = (map[k] || 0) + 1
            })

            const nums = Object.values(map)
            setNumbersManual(nums)
            setItems([])
            return
        }
        if (selectedSource === "defect-location" && snap.data.marks) {
            const map: Record<string, number> = {}
            snap.data.marks.forEach((m: any) => {
                const k = m.defect ?? "Unknown"
                map[k] = (map[k] || 0) + m.count
            })
            const nums = snap.data.marks.map((m: any) => m.count)
            setNumbersManual(nums)
            setItems([])
            return
        }
    }

    useEffect(() => {
        reloadFromSource()
    }, [selectedSource]) // eslint-disable-line

    const data: number[] = numbersManual ?? autoNumbers

    const mean = useMemo(() => {
        return data.length
            ? data.reduce((a: number, b: number) => a + b, 0) / data.length
            : 0
    }, [data])

    const sorted = useMemo(() => [...data].sort((a, b) => a - b), [data])

    const median = useMemo(() => {
        if (sorted.length === 0) return 0
        return sorted.length % 2
            ? sorted[Math.floor(sorted.length / 2)]
            : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    }, [sorted])

    const mode = useMemo(() => {
        const freq: Record<number, number> = {}
        data.forEach((n: number) => {
            freq[n] = (freq[n] || 0) + 1
        })
        const keys = Object.keys(freq).map(Number)
        if (!keys.length) return 0
        return keys.reduce((a, b) => (freq[a] > freq[b] ? a : b), keys[0])
    }, [data])


    const range = useMemo(() => (sorted.length ? sorted[sorted.length - 1] - sorted[0] : 0), [sorted])

    const variance = useMemo(() => {
        if (data.length <= 1) return 0
        const divisor = varianceMode === "sample" ? data.length - 1 : data.length
        return data.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / divisor
    }, [data, mean, varianceMode])


    const stddev = useMemo(() => Math.sqrt(variance), [variance])

    const sturgesBins = (n: number) => Math.max(1, Math.ceil(1 + Math.log2(n)))

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
    const [lsl] = useState<number | null>(null)
    const [usl] = useState<number | null>(null)
    const cp = useMemo(() => {
        if (lsl == null || usl == null || stddev === 0) return null
        return (usl - lsl) / (6 * stddev)
    }, [lsl, usl, stddev])

    const cpk = useMemo(() => {
        if (lsl == null || usl == null || stddev === 0) return null
        const cpu = (usl - mean) / (3 * stddev)
        const cpl = (mean - lsl) / (3 * stddev)
        return Math.min(cpu, cpl)
    }, [lsl, usl, mean, stddev])


    const computeNumericBins = (arr: number[], binCount: number) => {
        if (!arr.length) return [] as { label: string; count: number; min: number; max: number }[]
        const min = Math.min(...arr)
        const max = Math.max(...arr)
        const span = max - min || 1
        const size = span / binCount
        const binsArr = Array.from({ length: binCount }, (_, i) => ({
            label: `${(min + i * size).toFixed(2)} to < ${(min + (i + 1) * size).toFixed(2)}`,
            count: 0,
            min: min + i * size,
            max: min + (i + 1) * size,
        }))
        arr.forEach(v => {
            let idx = Math.floor((v - min) / size)
            if (v === max) idx = binCount - 1
            if (idx < 0) idx = 0
            if (idx >= binCount) idx = binCount - 1
            binsArr[idx].count++
        })
        return binsArr
    }

    // --- Buku: class boundaries & midpoint ---
    const computeBookStyleBins = (arr: number[], binCount: number) => {
        if (!arr.length) return [];

        const min = Math.min(...arr);
        const max = Math.max(...arr);

        const span = max - min || 1;
        const classWidth = span / binCount;

        const bins: { lower: number; upper: number; midpoint: number; count: number }[] = [];

        for (let i = 0; i < binCount; i++) {
            const lower = min + i * classWidth;
            const upper = lower + classWidth;

            bins.push({
                lower,
                upper,
                midpoint: (lower + upper) / 2,
                count: 0
            });
        }

        arr.forEach(v => {
            let idx = Math.floor((v - min) / classWidth);
            if (v === max) idx = binCount - 1;
            if (idx < 0) idx = 0;
            if (idx >= binCount) idx = binCount - 1;
            bins[idx].count++;
        });

        return bins;
    };



    const zScores = data.map(v => (v - mean) / stddev)
    const outliersZ = data.filter((_v, i) => Math.abs(zScores[i]) > 3)

    const sortedCopy = [...data].sort((a, b) => a - b)
    const q1 = sortedCopy[Math.floor(sortedCopy.length * 0.25)]
    const q3 = sortedCopy[Math.floor(sortedCopy.length * 0.75)]
    const iqr = q3 - q1
    const tukeyLower = q1 - 1.5 * iqr
    const tukeyUpper = q3 + 1.5 * iqr
    const outliersTukey = data.filter(v => v < tukeyLower || v > tukeyUpper)


    const histogramBase = useMemo(() => {
        if (items.length) {
            return items.map(i => ({
                label: i.category,
                count: i.count,
                lower: null,
                upper: null,
                midpoint: null
            }));
        }

        const bookBins = computeBookStyleBins(data, bins);

        return bookBins.map(b => ({
            label: `${b.lower.toFixed(4)} – ${b.upper.toFixed(4)}`,
            count: b.count,
            lower: b.lower,
            upper: b.upper,
            midpoint: b.midpoint
        }));
    }, [items, data, bins]);



    const totalCount = useMemo(() => {
        return histogramBase.reduce((s, r) => s + (Number.isFinite(r.count) ? r.count : 0), 0)
    }, [histogramBase])

    const tableRows: HistogramRow[] = useMemo(() => {
        return histogramBase.map(r => ({
            category: r.label,
            count: r.count,
            percentage: totalCount === 0 ? 0 : Number(((r.count / totalCount) * 100).toFixed(1)),
            lower: r.lower,
            upper: r.upper,
            midpoint: r.midpoint,
            operator,
            shift,
            line,
            date: new Date().toLocaleString(),
        }));
    }, [histogramBase, totalCount, operator, shift, line])
    // --- Buku: mean dari frequency table ---
    const meanGrouped = useMemo(() => {
        const rows = histogramBase;
        let sumFM = 0;
        let sumF = 0;

        rows.forEach(r => {
            if (r.midpoint !== null && r.count) {
                sumFM += r.midpoint * r.count;
                sumF += r.count;
            }
        });

        return sumF > 0 ? sumFM / sumF : 0;
    }, [histogramBase]);

    // --- Buku: mode untuk grouped data (kelas dengan frekuensi terbesar) ---
    const modeGrouped = useMemo(() => {
        const rows = histogramBase;
        if (!rows.length) return null;
        return rows.reduce((max, r) => r.count > max.count ? r : max, rows[0]);
    }, [histogramBase]);


    // --- Buku: variance + sd dari frequency table ---
    const varianceGrouped = useMemo(() => {
        const rows = histogramBase;
        let sumF = 0;
        let S = 0;

        rows.forEach(r => {
            if (r.midpoint !== null) {
                const diff = r.midpoint - meanGrouped;
                S += r.count * diff * diff;
                sumF += r.count;
            }
        });

        return sumF > 1 ? S / (sumF - 1) : 0;
    }, [histogramBase, meanGrouped]);

    const stddevGrouped = useMemo(() => Math.sqrt(varianceGrouped), [varianceGrouped]);
const normalCurvePoints = useMemo(() => {
    if (!showNormalCurve) return [];
    if (!data.length || stddev === 0) return [];

    const min = Math.min(...data);
    const max = Math.max(...data);
    const step = (max - min) / 50;

    const raw = [];
    for (let x = min; x <= max; x += step) {
        const fx = (1 / (stddev * Math.sqrt(2 * Math.PI))) *
                   Math.exp(-Math.pow(x - mean, 2) / (2 * stddev * stddev));
        raw.push({ x, fx });
    }

    const maxFx = Math.max(...raw.map(r => r.fx));
    const maxCount = Math.max(...histogramBase.map(r => r.count), 1);

    return raw.map(r => ({
        x: r.x,
        y: r.fx * (maxCount / maxFx)
    }));
}, [showNormalCurve, data, mean, stddev, histogramBase]);

    const summary = useMemo(() => {
        return tableRows.map(r => r.category).join(", ")
    }, [tableRows])

    const summaryDetailText = useMemo(() => {
        const parts: string[] = []
        if (tableRows.length && totalCount > 0) {
            const max = tableRows.reduce((m, r) => (r.count > m.count ? r : m), tableRows[0])
            const pct = ((max.count / totalCount) * 100).toFixed(1)
            parts.push(`Kategori terbesar: ${max.category} (${pct}%)`)
        }
        return parts.join(" | ")
    }, [tableRows, totalCount])

    const validateCategoryName = (name: string) => {
        const trimmed = name.trim()
        return !!trimmed
    }

    const addItem = () => {
        if (!validateCategoryName(category)) return
        const num = Number(count)
        if (!Number.isFinite(num) || num < 0) return
        const trimmed = category.trim()
        const existingIndex = items.findIndex(it => it.category.trim().toLowerCase() === trimmed.toLowerCase())
        if (existingIndex >= 0) {
            const updated = [...items]
            updated[existingIndex] = {
                ...updated[existingIndex],
                count: updated[existingIndex].count + num,
                operator,
                shift,
                line,
                date: new Date().toLocaleString(),
            }
            setItems(updated)
        } else {
            setItems([
                ...items,
                {
                    category: trimmed,
                    count: num,
                    operator,
                    shift,
                    line,
                    date: new Date().toLocaleString(),
                },
            ])
        }
        setCategory("")
        setCount("")
        setSelectedSource("manual")
    }

    const increment = (index: number) => {
        const updated = [...items]
        if (!updated[index]) return
        updated[index] = { ...updated[index], count: updated[index].count + 1, date: new Date().toLocaleString() }
        setItems(updated)
        setSelectedSource("manual")
    }

    const decrement = (index: number) => {
        const updated = [...items]
        if (!updated[index]) return
        const newVal = updated[index].count - 1
        updated[index] = { ...updated[index], count: newVal < 0 ? 0 : newVal, date: new Date().toLocaleString() }
        setItems(updated)
        setSelectedSource("manual")
    }

    const reset = (index: number) => {
        const updated = [...items]
        if (!updated[index]) return
        updated[index] = { ...updated[index], count: 0, date: new Date().toLocaleString() }
        setItems(updated)
        setSelectedSource("manual")
    }

    const clearAll = () => {
        if (confirm("Hapus semua data?")) {
            setItems([])
            setNumbersManual(null)
            setSelectedSource("manual")
        }
    }

    const removeItem = (index: number) => {
        const updated = items.filter((_, i) => i !== index)
        setItems(updated)
        setSelectedSource("manual")
    }

    const setItemCount = (index: number, value: number) => {
        if (!Number.isFinite(value) || value < 0) return
        const updated = [...items]
        if (!updated[index]) return
        updated[index] = { ...updated[index], count: value, date: new Date().toLocaleString() }
        setItems(updated)
        setSelectedSource("manual")
    }

    const renameCategory = (index: number, newName: string) => {
        if (!validateCategoryName(newName)) return
        const trimmed = newName.trim()
        const updated = [...items]
        if (!updated[index]) return
        const exists = items.some((it, i) => i !== index && it.category.trim().toLowerCase() === trimmed.toLowerCase())
        if (exists) return
        updated[index] = { ...updated[index], category: trimmed, date: new Date().toLocaleString() }
        setItems(updated)
        setSelectedSource("manual")
    }

    const addField = () => {
        const f = newField.trim()
        if (!f) return
        if (f === "date") return
        if (customFields.includes(f)) return
        const newCustom = [...customFields, f]
        setCustomFields(newCustom)
        setMetadata({ ...metadata, [f]: "" })
        setNewField("")
    }

    const removeField = (f: string) => {
        if (f === "date") return
        const newFields = customFields.filter(x => x !== f)
        const m = { ...metadata }
        delete m[f]
        setCustomFields(newFields)
        setMetadata(m)
    }

    const parseManualInput = () => {
        const parsed = inputData
            .split(/[\s,;]+/)
            .map(v => parseFloat(v))
            .filter(v => !isNaN(v))
        if (parsed.length > 0) {
            setNumbersManual(parsed)
            setItems([])
            setSelectedSource("manual")
        }
    }

    const importFromCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: result => {
                const rows = result.data as any[]
                const byCategory: Record<string, number> = {}
                const numericValues: number[] = []
                rows.forEach(r => {
                    const name = (r.Category || r.category || r.CategoryName || r.name || "").toString().trim()
                    const rawCount = r.Count ?? r.count ?? r.Jumlah ?? r.jumlah ?? r.Value ?? r.value
                    if (name && (rawCount === undefined || rawCount === null)) {
                        const v = Number(r.Value ?? r.value ?? r.ValueRaw)
                        if (Number.isFinite(v)) numericValues.push(v)
                        return
                    }
                    const num = Number(rawCount)
                    if (!name && Number.isFinite(num)) numericValues.push(num)
                    if (name && Number.isFinite(num) && num >= 0) {
                        byCategory[name] = (byCategory[name] || 0) + num
                    }
                })
                if (numericValues.length) {
                    setNumbersManual(numericValues)
                    setItems([])
                    setSelectedSource("manual")
                    return
                }
                const imported: HistogramItem[] = Object.entries(byCategory).map(([k, v]) => ({
                    category: k,
                    count: v,
                    date: new Date().toLocaleString(),
                }))
                setItems(imported)
                setNumbersManual(null)
                setSelectedSource("manual")
            },
        })
    }

    const importFromExcel = (file: File) => {
        const reader = new FileReader()
        reader.onload = e => {
            const dataArr = new Uint8Array(e.target?.result as ArrayBuffer)
            const wb = XLSX.read(dataArr, { type: "array" })
            const wsName = wb.SheetNames[0]
            const ws = wb.Sheets[wsName]
            const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" })
            const byCategory: Record<string, number> = {}
            const numericValues: number[] = []
            json.forEach(r => {
                const name = (r.Category || r.category || r.Kategori || r.kategori || r.Name || r.name || "").toString().trim()
                const rawCount = r.Count ?? r.count ?? r.Jumlah ?? r.jumlah ?? r.Value ?? r.value
                if (name && (rawCount === undefined || rawCount === null || rawCount === "")) {
                    const v = Number(r.Value ?? r.value ?? r.ValueRaw)
                    if (Number.isFinite(v)) numericValues.push(v)
                    return
                }
                const num = Number(rawCount)
                if (!name && Number.isFinite(num)) numericValues.push(num)
                if (name && Number.isFinite(num) && num >= 0) {
                    byCategory[name] = (byCategory[name] || 0) + num
                }
            })
            if (numericValues.length) {
                setNumbersManual(numericValues)
                setItems([])
                setSelectedSource("manual")
                return
            }
            const imported: HistogramItem[] = Object.entries(byCategory).map(([k, v]) => ({
                category: k,
                count: v,
                date: new Date().toLocaleString(),
            }))
            setItems(imported)
            setNumbersManual(null)
            setSelectedSource("manual")
        }
        reader.readAsArrayBuffer(file)
    }

    const exportCSV = () => {
        const csvData = Papa.unparse(
            tableRows.map(r => ({
                Category: r.category,
                Count: r.count,
                Value: `${r.percentage}%`,
                Operator: r.operator,
                Shift: r.shift,
                Line: r.line,
                Date: r.date,
                ...metadata,
            }))
        )
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "histogram.csv"
        a.click()
    }

    const exportTopNToCSV = (n: number) => {
        const topRows = tableRows.slice(0, n)
        const csvData = Papa.unparse(
            topRows.map(r => ({
                Category: r.category,
                Count: r.count,
                Value: `${r.percentage}%`,
                Operator: r.operator,
                Shift: r.shift,
                Line: r.line,
                Date: r.date,
                ...metadata,
            }))
        )
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "histogram-topN.csv"
        a.click()
    }

    const exportExcel = () => {
        const dataForSheet = tableRows.map(r => ({
            Category: r.category,
            Count: r.count,
            Value: `${r.percentage}%`,
            Operator: r.operator,
            Shift: r.shift,
            Line: r.line,
            Date: r.date,
            ...metadata,
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
            operator,
            shift,
            line,
            bins,
            selectedSource,
            customFields,
            metadata,
            summary,
            summaryDetailText,
            date: new Date().toLocaleString(),
        }
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "histogram.json"
        a.click()
    }

    const exportPDF = () => {
        const doc = new jsPDF()
        doc.text("QC — Histogram Report", 14, 16)
        doc.text(`Operator: ${operator || "-"}`, 14, 26)
        doc.text(`Shift: ${shift || "-"}`, 14, 33)
        doc.text(`Line: ${line || "-"}`, 14, 40)
        autoTable(doc, {
            startY: 50,
            head: [["Kategori/Bin", "Jumlah", "Nilai"]],
            body: tableRows.map(r => [r.category || "", r.count || 0, `${r.percentage}%`]),
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
            operator,
            shift,
            line,
            bins,
            manualData: numbersManual,
            selectedSource,
            customFields,
            metadata,
            date: new Date().toLocaleString(),
        }
        const json = JSON.stringify(snapshot)
        const base64 = btoa(json)
        return `${window.location.origin}${window.location.pathname}?p=${base64}`
    }

    return {
        chartRef,
        data,
        items,
        setItems,
        operator,
        setOperator,
        shift,
        setShift,
        line,
        setLine,
        bins,
        setBins,
        inputData,
        setInputData,
        parseManualInput,
        numbersManual,
        setNumbersManual,
        selectedSource,
        setSelectedSource,
        reloadFromSource,
        category,
        setCategory,
        count,
        setCount,
        addItem,
        increment,
        decrement,
        reset,
        removeItem,
        clearAll,
        setItemCount,
        renameCategory,
        customFields,
        setCustomFields,
        newField,
        setNewField,
        metadata,
        setMetadata,
        addField,
        removeField,
        totalCount,
        histogramBase,
        tableRows,
        summary,
        summaryDetailText,
        importFromCSV,
        importFromExcel,
        exportCSV,
        exportTopNToCSV,
        exportExcel,
        exportJSON,
        exportPDF,
        exportChartImage,
        getShareLink,
        mean,
        median,
        mode,
        range,
        variance,
        stddev,
        cpk,
        outliersZ,
        outliersTukey,
        cp,
        freedmanDiaconisBins,
        stddevGrouped,
        modeGrouped,
        computeNumericBins,
        meanGrouped,
        varianceGrouped,
        showNormalCurve,
        setShowNormalCurve,
        normalCurvePoints
    }
}
