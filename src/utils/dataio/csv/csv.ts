import Papa from "papaparse"
import type { QCData } from "../schema"

function getColTotalRaw(categories: any[], day: string) {
  return categories.reduce((sum, c) => sum + (c.counts[day] ?? 0), 0)
}

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

  if (data.type === "DISTRIBUTION") {
  let metaBlock = ""
  for (const k of data.customFields) {
    metaBlock += `${k.toUpperCase()},${data.metadata[k] || ""}\n`
  }
  metaBlock += `DATE,${data.metadata.date || ""}\n\n`

  const rows = data.rows.map(r => ({
    Deviation: r.deviation,
    Actual: (data.target + r.deviation * data.binSize).toFixed(6),
    Count: r.count,
    Unit: data.unit
  }))

  

  output = metaBlock + Papa.unparse(rows)
}

if (data.type === "DEFECT_LOCATION") {
  let metaBlock = ""
  for (const k of data.customFields) {
    metaBlock += `${k.toUpperCase()},${data.metadata[k] || ""}\n`
  }

  metaBlock += `TOTAL,${data.totalAll ?? ""}\n\n`

  const rows = data.mapping.map(m => ({
    Circular: m.circ,
    Radial: m.rad,
    Count: m.count,
    Defect: m.defect,
    Severity: m.severity,
    Comment: m.comment,
    Time: new Date(m.timestamp).toISOString(),
  }))

  output = metaBlock + Papa.unparse(rows)
}
if (data.type === "DEFECT_CAUSE") {

  let metaBlock = ""
  for (const k of data.customFields) {
    metaBlock += `${k.toUpperCase()},${data.metadata[k] || ""}\n`
  }
  metaBlock += `TOTAL,${data.totalAll ?? ""}\n\n`

  const rows = data.dataset.map(e => ({
    Worker: e.worker,
    Day: e.day,
    Shift: e.shift,
    Type: e.type
  }))

  output = metaBlock + Papa.unparse(rows)
}


  const blob = new Blob([output], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename.endsWith(".csv") ? filename : filename + ".csv"
  a.click()
}

export function importCSVChecksheet(file: File, callback:(result:any)=>void) {
  Papa.parse(file, {
    skipEmptyLines: true,
    complete: (res) => {
      const raw = res.data as any[]

      const metaLines:string[] = []
      const tableLines:any[] = []

      for (const r of raw) {
        if (r.Category === undefined) {
          metaLines.push(r)
        }
        if (r.Category !== undefined) {
          tableLines.push(r)
        }
      }

      let metadata: Record<string,string> = {}
      let customFields: string[] = []

      metaLines.forEach((r:any) => {
        const k = Object.keys(r)[0]
        const v = r[k]
        if (k.toLowerCase() === "date") {
          metadata.date = v
        } else {
          customFields.push(k)
          metadata[k] = v
        }
      })

      const { days, categories } = parseImportedChecksheetData(tableLines)
      callback({ days, categories, customFields, metadata })
    }
  })
}
