import * as XLSX from "xlsx"
import type { QCData } from "./schema"

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

  XLSX.writeFile(book, filename.endsWith(".xlsx") ? filename : filename + ".xlsx")
}
