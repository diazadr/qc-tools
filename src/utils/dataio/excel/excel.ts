import * as XLSX from "xlsx"
import type {
  QCData,
  ChecksheetData,
  HistogramData,
  ParetoData,
  DistributionData,
  DefectLocationData,
  DefectCauseData
} from "../schema"
export interface ChecksheetImportResult {
  days: string[]
  categories: any[]
  customFields: string[]
  metadata: Record<string, string>
}
// --------------------------------------------------------------
// STYLE HELPERS
// --------------------------------------------------------------

const BORDER = {
  top: { style: "thin", color: { rgb: "000000" } },
  bottom: { style: "thin", color: { rgb: "000000" } },
  left: { style: "thin", color: { rgb: "000000" } },
  right: { style: "thin", color: { rgb: "000000" } }
}

function styleHeader(cell: any) {
  cell.s = {
    fill: { fgColor: { rgb: "1F4E78" } },
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
    alignment: { horizontal: "center", vertical: "center" },
    border: BORDER
  }
}

function styleTotal(cell: any) {
  cell.s = {
    fill: { fgColor: { rgb: "FFF2CC" } },
    font: { bold: true },
    alignment: { horizontal: "center" },
    border: BORDER
  }
}

function styleCell(cell: any) {
  cell.s = {
    alignment: { horizontal: "center" },
    border: BORDER
  }
}

function styleTitle(cell: any) {
  cell.s = {
    font: { bold: true, sz: 18 },
    alignment: { horizontal: "center", vertical: "center" }
  }
}

// --------------------------------------------------------------
// AUTO BUILD SHEET WITH AOA
// --------------------------------------------------------------

function buildSheet(aoa: (string | number)[][], mergeToLastCol = 0) {
  const sheet = XLSX.utils.aoa_to_sheet(aoa)

  Object.keys(sheet).forEach(k => {
    if (k[0] === "!") return

    const ref = XLSX.utils.decode_cell(k)
    const cell = sheet[k]

    if (ref.r === 0) {
      styleTitle(cell)
      return
    }

    if (ref.r === 2 || ref.r === 5) {
      styleHeader(cell)
      return
    }

    const last = aoa.length - 1
    if (ref.r === last) {
      styleTotal(cell)
      return
    }

    if (ref.r > 5) styleCell(cell)
  })

  sheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: mergeToLastCol } }
  ]

  sheet["!cols"] = Array(mergeToLastCol + 1).fill({ wch: 14 })

  return sheet
}

// --------------------------------------------------------------
// CHECKSHEET (FINAL)
// --------------------------------------------------------------

function sheetChecksheet(d: ChecksheetData) {
  const aoa: (string | number)[][] = []

  aoa.push([d.title])
  aoa.push([])
  aoa.push(["Field", "Value"])
  d.customFields.forEach(f => aoa.push([f, d.metadata[f] || ""]))
  aoa.push(["Date", d.metadata.date || ""])
  aoa.push([])

  aoa.push(["Category", ...d.days, "Total", "%", "Cum %"])

  let running = 0
  d.categories.forEach(c => {
    running += c.percentage ?? 0
    aoa.push([
      c.name,
      ...d.days.map(day => c.counts[day] ?? 0),
      c.total ?? 0,
      (c.percentage ?? 0).toFixed(1) + "%",
      running.toFixed(1) + "%"
    ])
  })

  aoa.push([
    "TOTAL",
    ...d.days.map(day => d.categories.reduce((s, c) => s + (c.counts[day] ?? 0), 0)),
    d.allTotal,
    "100%",
    "100%"
  ])

  return buildSheet(aoa, d.days.length + 3)
}

// --------------------------------------------------------------
function sheetHistogram(d: HistogramData) {
  const aoa = [["Histogram"], [], ["Value"], ...d.values.map(v => [v])]
  return buildSheet(aoa, 0)
}

// --------------------------------------------------------------
function sheetPareto(d: ParetoData) {
  const aoa = [
    [d.title],
    [],
    ["Category", "Count", "%", "Cum %"],
    ...d.items.map(i => [
      i.category,
      i.count,
      i.percentage ?? "",
      i.cumulativePercentage ?? ""
    ])
  ]
  return buildSheet(aoa, 3)
}

// --------------------------------------------------------------
function sheetDistribution(d: DistributionData) {
  const aoa: (string | number)[][] = []
  aoa.push([d.title])
  aoa.push([])
  aoa.push(["Field", "Value"])
  d.customFields.forEach(f => aoa.push([f, d.metadata[f] || ""]))
  aoa.push(["Date", d.metadata.date || ""])
  aoa.push([])

  aoa.push(["Deviation", "Actual", "Count", "Unit"])

  aoa.push(
    ...d.rows.map(r => [
      r.deviation,
      r.actual ?? "",
      r.count,
      d.unit
    ])
  )

  return buildSheet(aoa, 3)
}

// --------------------------------------------------------------
function sheetDefectLocation(d: DefectLocationData) {
  const aoa: (string | number)[][] = []
  aoa.push([d.title])
  aoa.push([])
  aoa.push(["Field", "Value"])
  d.customFields.forEach(f => aoa.push([f, d.metadata[f] || ""]))
  aoa.push(["Total", String(d.totalAll ?? "")])
  aoa.push([])

  aoa.push(["Circ", "Rad", "Count", "Defect", "Severity", "Comment", "Time"])

  aoa.push(
    ...d.mapping.map(m => [
      m.circ,
      m.rad,
      m.count,
      m.defect,
      m.severity,
      m.comment,
      new Date(m.timestamp).toISOString()
    ])
  )

  return buildSheet(aoa, 6)
}

// --------------------------------------------------------------
function sheetDefectCause(d: DefectCauseData) {
  const aoa: (string | number)[][] = []
  aoa.push([d.title])
  aoa.push([])
  aoa.push(["Field", "Value"])
  d.customFields.forEach(f => aoa.push([f, d.metadata[f] || ""]))
  aoa.push(["Total", String(d.totalAll ?? "")])
  aoa.push([])

  aoa.push(["Worker", "Day", "Shift", "Type"])

  aoa.push(
    ...d.dataset.map(r => [
      r.worker,
      r.day,
      r.shift,
      r.type
    ])
  )

  return buildSheet(aoa, 3)
}

// --------------------------------------------------------------
// EXPORT WRAPPER
// --------------------------------------------------------------

export function exportExcel(data: QCData, filename: string) {
  const book = XLSX.utils.book_new()

  switch (data.type) {
    case "CHECKSHEET":
      XLSX.utils.book_append_sheet(book, sheetChecksheet(data), "CHECKSHEET")
      break
    case "HISTOGRAM":
      XLSX.utils.book_append_sheet(book, sheetHistogram(data), "HISTOGRAM")
      break
    case "PARETO":
      XLSX.utils.book_append_sheet(book, sheetPareto(data), "PARETO")
      break
    case "DISTRIBUTION":
      XLSX.utils.book_append_sheet(book, sheetDistribution(data), "DISTRIBUTION")
      break
    case "DEFECT_LOCATION":
      XLSX.utils.book_append_sheet(book, sheetDefectLocation(data), "DEFECT_LOCATION")
      break
    case "DEFECT_CAUSE":
      XLSX.utils.book_append_sheet(book, sheetDefectCause(data), "DEFECT_CAUSE")
      break
  }

  XLSX.writeFile(book, filename.endsWith(".xlsx") ? filename : filename + ".xlsx")
}

export function importExcelChecksheet(
  file: File,
  callback: (result: ChecksheetImportResult) => void
) {
  const reader = new FileReader()

  reader.onload = (e) => {
    const buffer = e.target?.result
    const workbook = XLSX.read(buffer, { type: "binary" })

    const dataSheet = workbook.Sheets["CHECKSHEET"] || workbook.Sheets["DATA"]
    const infoSheet = workbook.Sheets["INFO"]

    const rows = XLSX.utils.sheet_to_json(dataSheet || {}, { defval: "" })
    const infoRows = infoSheet
      ? XLSX.utils.sheet_to_json(infoSheet, { defval: "" })
      : []

    const days = Object.keys(rows[0] || {}).filter(
      k => !["Category", "Total", "%", "Cum %"].includes(k)
    )

    const categories = rows
      .filter((r: any) => r.Category && r.Category !== "TOTAL")
      .map((r: any) => ({
        id: crypto.randomUUID(),
        name: r.Category,
        counts: Object.fromEntries(days.map(d => [d, Number(r[d] || 0)]))
      }))

    const metadata: Record<string, string> = {}
    const customFields: string[] = []

    infoRows.forEach((row: any) => {
      const field = String(row.Field || "")
      const value = String(row.Value || "")

      if (!field) return

      if (field.toLowerCase() === "date") metadata.date = value
      else {
        customFields.push(field)
        metadata[field] = value
      }
    })

    callback({
      days,
      categories,
      customFields,
      metadata
    })
  }

  reader.readAsBinaryString(file)
}

