import { useState, useMemo, useEffect, useRef } from "react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Papa from "papaparse"
import { useChecksheetStore } from "../../store/useChecksheetStore"
import ExcelJS from "exceljs";

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
// DATA KELOMPOK
interface GroupedRow {
    lower: number
    upper: number
    freq: number
}
// MAIN HOOK

export const useHistogramLogic = () => {
    const store = useChecksheetStore()

    // STATE & UI

    const chartRef = useRef<any>(null)
    const [showNormalCurve, setShowNormalCurve] = useState(false)
    const [showMeanLine, setShowMeanLine] = useState(false)
    const [bins, setBins] = useState(8)
    const [inputData, setInputData] = useState("")
    const [numbersManual, setNumbersManual] = useState<number[] | null>(null)
    const [selectedSource, setSelectedSource] =
        useState<HistogramSourceKey>("manual")
    const [items, setItems] = useState<HistogramItem[]>([])
    const [varianceMode] = useState<"sample" | "population">("sample")
    const [metadata, setMetadata] = useState<{ lsl?: number | null; usl?: number | null }>({})
    const [categoryList, setCategoryList] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [showComparisonLine, setShowComparisonLine] = useState(false)
    const [isURLLoading, setIsURLLoading] = useState(true)
    // MODE INPUT: single / grouped
    const [inputMode, setInputMode] = useState<"single" | "grouped">("single")

    const [groupedData, setGroupedData] = useState<GroupedRow[]>([])

    // field input sementara
    const [gLower, setGLower] = useState("")
    const [gUpper, setGUpper] = useState("")
    const [gFreq, setGFreq] = useState("")

    // SNAPSHOT LOADING

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const encoded = params.get("p");

            if (encoded) {
                try {
                    const decoded = JSON.parse(atob(encoded));

                    if (decoded.items) setItems(decoded.items);
                    if (decoded.bins) setBins(decoded.bins);
                    if (decoded.manualData) setNumbersManual(decoded.manualData);
                    if (decoded.selectedSource) setSelectedSource(decoded.selectedSource);
                    if (decoded.metadata) setMetadata(decoded.metadata);
                    if (decoded.selectedCategory) setSelectedCategory(decoded.selectedCategory);
                    if (decoded.inputData) setInputData(decoded.inputData);
                    if (typeof decoded.showNormalCurve === "boolean") setShowNormalCurve(decoded.showNormalCurve);
                    if (typeof decoded.showMeanLine === "boolean") setShowMeanLine(decoded.showMeanLine);
                    if (typeof decoded.showComparisonLine === "boolean") setShowComparisonLine(decoded.showComparisonLine);
                } catch (e) {
                    console.warn("Failed to parse sharelink payload", e);
                } finally {
                    setIsURLLoading(false);
                }
                return;
            }
        } catch (e) {
            console.warn("Error reading URL param p", e);
        }

        // not loaded from URL: try load from persisted snapshot store
        try {
            const snap = store.getSnapshot("histogram");
            if (snap?.data) {
                const d = snap.data;
                if (d.items) setItems(d.items);
                if (d.bins) setBins(d.bins);
                if (d.manualData) setNumbersManual(d.manualData);
                if (d.selectedSource) setSelectedSource(d.selectedSource);
                if (d.metadata) setMetadata(d.metadata);
                // done loading from store
                setIsURLLoading(false);
                return;
            }
        } catch (e) {
            console.warn("Failed to load snapshot from store", e);
        }

        // fallback: no URL, no store snapshot
        setSelectedSource("manual");
        setIsURLLoading(false);
    }, []);


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
    }, [JSON.stringify(store.snapshots)])


    // Reload jika ganti source
    const reloadFromSource = () => {
        setMetadata({})
        setSelectedCategory(null)
        setCategoryList([])

        if (selectedSource === "manual") {
            return
        }

        const snap = store.getSnapshot(selectedSource)
        if (!snap?.data) return

        // production-distribution → tetap pakai langsung
        if (selectedSource === "production-distribution") {
            setNumbersManual(autoNumbers)
            setItems([])
            return
        }

        // defective-item
        if (selectedSource === "defective-item") {
            const cats = snap.data.categories.map((c: any) => c.name)
            setCategoryList(cats)
            setItems([])
            setNumbersManual([]) // tunggu user pilih kategori
            return
        }

        // defect-location
        if (selectedSource === "defect-location") {
            const cats = snap.data.marks.map((m: any) => m.defect)
            setCategoryList(cats)
            setItems([])
            setNumbersManual([])
            return
        }

        // defect-cause
        if (selectedSource === "defect-cause") {
            const cats = Array.from(
                new Set(snap.data.dataset.map((e: any) => String(e.type)))
            ) as string[]
            setCategoryList(cats)
            setItems([])
            setNumbersManual([])

            return
        }
    }
    const loadSelectedCategory = (cat: string) => {
        setSelectedCategory(cat)

        if (selectedSource === "defective-item") {
            const snap = store.getSnapshot("defective-item")
            if (!snap?.data) return
            const c = snap.data.categories.find((x: any) => x.name === cat)
            if (!c) return

            setNumbersManual([])
            return
        }
        if (selectedSource === "defect-location") {
            const snap = store.getSnapshot("defect-location")
            if (!snap?.data) return
            const m = snap.data.marks.find((x: any) => x.defect === cat)
            if (!m) return
            setNumbersManual([])
            return
        }

        if (selectedSource === "defect-cause") {
            const snap = store.getSnapshot("defect-cause")
            if (!snap?.data) return
            setNumbersManual([])
            return
        }
    }


    useEffect(() => {
        if (!isURLLoading) reloadFromSource()
    }, [selectedSource, isURLLoading])


    const data = (numbersManual && numbersManual.length > 0)
        ? numbersManual
        : autoNumbers

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

    const modeCountUnique = useMemo(() => {
        if (!data.length) return true

        const freq: Record<number, number> = {}

        data.forEach((v: number) => {
            freq[v] = (freq[v] || 0) + 1
        })

        const maxFreq = Math.max(...Object.values(freq))

        return maxFreq === 1
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

        // MODE GROUPED
        if (inputMode === "grouped" && groupedData.length > 0) {
            return groupedData.map(g => ({
                label: `${g.lower} – ${g.upper}`,
                count: g.freq,
                lower: g.lower,
                upper: g.upper,
                midpoint: (g.lower + g.upper) / 2
            }))
        }

        // MODE DATA TUNGGAL (AUTO BIN)
        const book = computeBookStyleBins(data, bins)
        return book.map(b => ({
            label: `${b.lower.toFixed(4)} – ${b.upper.toFixed(4)}`,
            count: b.count,
            lower: b.lower,
            upper: b.upper,
            midpoint: b.midpoint,
        }))

    }, [data, bins, inputMode, groupedData])


    const comparisonLine = useMemo(() => {
        return histogramBase
            .filter(b => b.midpoint !== null)
            .map(b => ({
                x: b.midpoint as number,
                y: b.count
            }))
    }, [histogramBase])

    const histogramShape = useMemo(() => {
        if (!histogramBase.length) return "-"

        const counts = histogramBase.map(b => b.count)
        const maxCount = Math.max(...counts)
        const majorThreshold = maxCount * 0.70   // puncak besar

        // cari bin yang count-nya mendekati puncak utama
        const majorPeaks = histogramBase
            .map((b, i) => ({ i, count: b.count }))
            .filter(b => b.count >= majorThreshold)

        // jika dua puncak besar dan jaraknya jauh → twin peak
        if (majorPeaks.length >= 2) {
            const dist = Math.abs(majorPeaks[0].i - majorPeaks[1].i)
            if (dist >= 2) return "Twin-peak"
        }

        // skewness untuk tipe lain
        const skew = data.length > 2 ? (3 * (mean - median)) / (stddev || 1) : 0

        if (Math.abs(skew) < 0.3) return "Normal"
        if (skew > 0.5) return "Positively Skew"
        if (skew < -0.5) return "Negatively Skew"

        return "General"
    }, [histogramBase, data, mean, median, stddev])



const sturgesBins = (n: number): number => {
    return Math.max(1, Math.ceil(1 + 3.322 * Math.log10(n)))
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


    const addGroupedRow = () => {
    const L = Number(gLower)
    const U = Number(gUpper)
    const F = Number(gFreq)

    if (!isFinite(L) || !isFinite(U) || !isFinite(F)) return
    if (U <= L) return

    setGroupedData([...groupedData, { lower: L, upper: U, freq: F }])
    setGLower("")
    setGUpper("")
    setGFreq("")
}


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

            // JANGAN ubah selectedSource ketika sudah memilih kategori QC
            // HANYA set manual jika memang user sedang di mode manual
            if (selectedSource === "manual") {
                setSelectedSource("manual")
            }
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

    const exportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Histogram");

        sheet.addRow(["QC — Histogram Report"]);
        sheet.mergeCells("A1:D1");
        sheet.getCell("A1").font = { bold: true, size: 16 };

        sheet.addRow(["Generated:", new Date().toLocaleString()]);
        sheet.addRow([]);

        sheet.addRow(["Bin", "Count", "Persen", "Tanggal"]);

        tableRows.forEach(r => {
            sheet.addRow([
                r.category,
                r.count,
                `${r.percentage}%`,
                r.date
            ]);
        });

        let img = null;

        if (chartRef.current) {
            const png = chartRef.current.getImageDataUrl?.();
            if (png) {
                img = workbook.addImage({
                    base64: png,
                    extension: "png"
                });

                sheet.addImage(img, {
                    tl: { col: 6, row: 1 },
                    ext: { width: 500, height: 300 }
                });
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "histogram.xlsx";
        a.click();
    };


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
        const doc = new jsPDF("p", "mm", "a4");

        doc.setFillColor(30, 87, 153);
        doc.rect(0, 0, 999, 22, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(15);
        doc.text("Histogram Report", 14, 14);
        doc.setTextColor(0, 0, 0);

        let y = 30;

        if (chartRef.current) {
            const img = chartRef.current.getImageDataUrl?.();
            if (img) {
                const pageWidth = doc.internal.pageSize.getWidth() - 20;
                const height = 70;
                doc.addImage(img, "PNG", 10, y, pageWidth, height);
                y += height + 10;
            }
        }

        autoTable(doc, {
            startY: y,
            head: [["Kategori/Bin", "Jumlah", "Persen"]],
            body: tableRows.map(r => [
                r.category,
                r.count,
                `${r.percentage}%`
            ]),
            headStyles: { fillColor: [30, 87, 153], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: { fontSize: 9 },
            margin: { left: 14, right: 14 }
        });

        let fy = (doc).lastAutoTable.finalY + 10;

        doc.setFontSize(12);
        doc.text("Ringkasan:", 14, fy);
        fy += 6;

        doc.setFontSize(10);
        doc.text(summary || "-", 14, fy);
        fy += 10;

        doc.setFontSize(12);
        doc.text("Detail:", 14, fy);
        fy += 6;

        doc.setFontSize(10);
        doc.text(doc.splitTextToSize(summaryDetailText || "-", 180), 14, fy);

        const p = doc.getNumberOfPages();
        const genDate = new Date().toLocaleString();
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`Generated: ${genDate}`, 14, 289);
        doc.text(`Page ${p}`, 200, 289, { align: "right" });

        doc.save("histogram.pdf");
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
        const snapshot = {
            items,
            bins,
            manualData: numbersManual,
            selectedSource,
            metadata,
            selectedCategory,
            inputData,
            showNormalCurve,
            showMeanLine,
            showComparisonLine,
            date: new Date().toLocaleString()
        };

        const encoded = btoa(JSON.stringify(snapshot));
        return `${window.location.origin}${window.location.pathname}?p=${encoded}`;
    };


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
        categoryList,
        selectedCategory,
        setSelectedCategory,
        loadSelectedCategory,

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
        modeCountUnique,
        range,
        variance,
        stddev,
        cp,
        cpk,
        freedmanDiaconisBins,
        meanGrouped,
        stddevGrouped,
        varianceGrouped,
        modeGrouped,
        histogramShape,
        comparisonLine,
        addGroupedRow,
        inputMode,
        setInputMode,
        groupedData,
        gLower, gUpper, gFreq,
        setGLower, setGUpper, setGFreq,
        setCategoryList,

setGroupedData,


        showMeanLine,
        setShowMeanLine,
        normalCurvePoints,
        showComparisonLine,
        setShowComparisonLine,

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
