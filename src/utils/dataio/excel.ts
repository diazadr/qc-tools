import * as XLSX from "xlsx"
import type { QCData } from "./schema"

function parseImportedChecksheetData(rows:any[], infoRows?:any[]) {
  let days = Object.keys(rows[0])
    .filter(k => k !== "Category" && k !== "Total" && k !== "Percent")

  const categories = rows
    .filter((r:any) => r.Category !== "TOTAL")
    .map((r:any) => ({
      id: crypto.randomUUID(),
      name: r.Category,
      counts: Object.fromEntries(
        days.map(d => [d, Number(r[d] || 0)])
      )
    }))

  let metadata: Record<string,string> = {}
  let customFields: string[] = []

  if (infoRows) {
    infoRows.forEach((r:any) => {
      const field = String(r.Field)
      const value = String(r.Value || "")
      if (field.toLowerCase() === "date") {
        metadata.date = value
      } else {
        customFields.push(field)
        metadata[field] = value
      }
    })
  } else {
    metadata.date = ""
  }

  return { days, categories, customFields, metadata }
}


export function exportExcel(data: QCData, filename: string) {
  const book = XLSX.utils.book_new()

  if (data.type === "CHECKSHEET") {
    const metaSheetData: any[] = []
    for (const k of data.customFields) {
      metaSheetData.push({ Field: k, Value: data.metadata[k] || "" })
    }
    metaSheetData.push({ Field: "Date", Value: data.metadata.date || "" })

    const metaSheet = XLSX.utils.json_to_sheet(metaSheetData)
    XLSX.utils.book_append_sheet(book, metaSheet, "INFO")

const rows = data.categories.map(c => {
  const r: any = { Category: c.name }
  data.days.forEach(day => r[day] = c.counts[day] ?? 0)
  r.Total = c.total ?? 0
  r.Percent = (c.percentage ?? 0).toFixed(1) + "%"
  return r
})



// tambahkan footer TOTAL row
const totalRow: any = { Category: "TOTAL" }
data.days.forEach(day => totalRow[day] = getColTotalRaw(data.categories, day))
totalRow.Total = data.allTotal
totalRow.Percent = "100%"

rows.push(totalRow)
function getColTotalRaw(categories: any[], day: string) {
  return categories.reduce((sum, c) => sum + (c.counts[day] ?? 0), 0)
}


    const dataSheet = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(book, dataSheet, "DATA")

    XLSX.writeFile(book, filename.endsWith(".xlsx") ? filename : filename + ".xlsx")
    return
  }

  if (data.type === "HISTOGRAM") {
    const sheetData = data.values.map(v => ({ Value: v }))
    const sheet = XLSX.utils.json_to_sheet(sheetData)
    XLSX.utils.book_append_sheet(book, sheet, "DATA")
  }

  if (data.type === "PARETO") {
    const sheetData = data.items.map(i => ({
      Category: i.category,
      Count: i.count,
      Percentage: i.percentage,
      CumPercentage: i.cumulativePercentage
    }))
    const sheet = XLSX.utils.json_to_sheet(sheetData)
    XLSX.utils.book_append_sheet(book, sheet, "DATA")
  }

  if (data.type === "DISTRIBUTION") {

  const metaSheetData: any[] = []
  for (const k of data.customFields) {
    metaSheetData.push({ Field: k, Value: data.metadata[k] || "" })
  }
  metaSheetData.push({ Field: "Date", Value: data.metadata.date || "" })

  const metaSheet = XLSX.utils.json_to_sheet(metaSheetData)
  XLSX.utils.book_append_sheet(book, metaSheet, "INFO")

  const rows = data.rows.map(r => ({
    Deviation: r.deviation,
    Actual: (data.target + r.deviation * data.binSize),
    Count: r.count,
    Unit: data.unit,
  }))

  

  const dataSheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(book, dataSheet, "DATA")

  XLSX.writeFile(book, filename.endsWith(".xlsx") ? filename : filename + ".xlsx")
  return
}

if (data.type === "DEFECT_LOCATION") {

  const metaSheetData: any[] = []
  for (const k of data.customFields) {
    metaSheetData.push({ Field: k, Value: data.metadata[k] || "" })
  }
  metaSheetData.push({ Field: "Total", Value: data.totalAll ?? "" })

  const metaSheet = XLSX.utils.json_to_sheet(metaSheetData)
  XLSX.utils.book_append_sheet(book, metaSheet, "INFO")

  const rows = data.mapping.map(m => ({
    Circular: m.circ,
    Radial: m.rad,
    Count: m.count,
    Defect: m.defect,
    Severity: m.severity,
    Comment: m.comment,
    Time: new Date(m.timestamp).toISOString(),
  }))

  const dataSheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(book, dataSheet, "DATA")

  XLSX.writeFile(book, filename.endsWith(".xlsx") ? filename : filename + ".xlsx")
  return
}

if (data.type === "DEFECT_CAUSE") {

  const metaSheetData: any[] = []
  for (const k of data.customFields) {
    metaSheetData.push({ Field: k, Value: data.metadata[k] || "" })
  }
  metaSheetData.push({ Field: "Total", Value: data.totalAll ?? "" })

  const metaSheet = XLSX.utils.json_to_sheet(metaSheetData)
  XLSX.utils.book_append_sheet(book, metaSheet, "INFO")

  const rows = data.dataset.map(m => ({
    Worker: m.worker,
    Day: m.day,
    Shift: m.shift,
    Type: m.type,
  }))

  const dataSheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(book, dataSheet, "DATA")

  XLSX.writeFile(book, filename.endsWith(".xlsx") ? filename : filename + ".xlsx")
  return
}


  XLSX.writeFile(book, filename.endsWith(".xlsx") ? filename : filename + ".xlsx")
}


export function importExcelChecksheet(file: File, callback: (result:any)=>void) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const buffer = e.target?.result
    const book = XLSX.read(buffer, { type: "binary" })

    const dataSheet = book.Sheets["DATA"]
    const infoSheet = book.Sheets["INFO"]

    const rows = XLSX.utils.sheet_to_json(dataSheet)
    const infoRows = infoSheet
      ? XLSX.utils.sheet_to_json(infoSheet)
      : undefined

    const parsed = parseImportedChecksheetData(rows, infoRows)
    callback(parsed)
  }
  reader.readAsBinaryString(file)
}
