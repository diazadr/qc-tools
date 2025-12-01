import Papa from "papaparse"
import type { QCData } from "./schema"

function getColTotalRaw(categories: any[], day: string) {
  return categories.reduce((sum, c) => sum + (c.counts[day] ?? 0), 0)
}

export function exportCSV(data: QCData, filename: string) {
  let output = ""

  if (data.type === "CHECKSHEET") {
    let metaBlock = ""
    for (const k of data.customFields) {
      metaBlock += `${k.toUpperCase()},${data.metadata[k] || ""}\n`
    }
    metaBlock += `DATE,${data.metadata.date || ""}\n\n`

    let rows = data.categories.map(c => {
      const row: any = { Category: c.name }
      data.days.forEach(day => row[day] = c.counts[day] ?? 0)
      row.Total = c.total ?? 0
      row.Percent = (c.percentage ?? 0).toFixed(1) + "%"
      return row
    })

    const totalRow: any = { Category: "TOTAL" }
    data.days.forEach(day => totalRow[day] = getColTotalRaw(data.categories, day))
    totalRow.Total = data.allTotal
    totalRow.Percent = "100%"
    rows.push(totalRow)

    output = metaBlock + Papa.unparse(rows)
  }

  if (data.type === "HISTOGRAM") {
    const rows = data.values.map(v => ({ Value: v }))
    output = Papa.unparse(rows)
  }

  if (data.type === "PARETO") {
    const rows = data.items.map(i => ({
      Category: i.category,
      Count: i.count,
      Percentage: i.percentage,
      CumPercentage: i.cumulativePercentage
    }))
    output = Papa.unparse(rows)
  }

  const blob = new Blob([output], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename.endsWith(".csv") ? filename : filename + ".csv"
  a.click()
}
