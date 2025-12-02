import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { QCData } from "./schema"

function getColTotalRaw(categories: any[], day: string) {
  return categories.reduce((sum, c) => sum + (c.counts[day] ?? 0), 0)
}

export function exportPDF(data: QCData, filename: string) {
  const doc = new jsPDF()
  doc.text(data.title ?? "QC Data", 14, 16)

  if (data.type === "CHECKSHEET") {
    doc.setFontSize(10)

    let y = 22
    for (const k of data.customFields) {
      doc.text(`${k}: ${data.metadata[k] || "-"}`, 14, y)
      y += 6
    }
    doc.text(`Date: ${data.metadata.date || "-"}`, 14, y)
    y += 10

    const head = ["Category", ...data.days, "Total", "%"]

    const rows = data.categories.map(c => [
      c.name,
      ...data.days.map(d => c.counts[d] ?? 0),
      c.total ?? 0,
      (c.percentage ?? 0).toFixed(1) + "%",
    ])

    rows.push([
      "TOTAL",
      ...data.days.map(d => getColTotalRaw(data.categories, d)),
      data.allTotal,
      "100%"
    ])

    autoTable(doc, {
      head: [head],
      body: rows,
      startY: y
    })

    doc.text(`Grand Total: ${data.allTotal}`, 14, doc.lastAutoTable.finalY + 12)
  }

  if (data.type === "HISTOGRAM") {
    autoTable(doc, {
      head: [["Value"]],
      body: data.values.map(v => [v]),
      startY: 22
    })
  }

  if (data.type === "PARETO") {
    autoTable(doc, {
      head: [["Category", "Count", "%", "Cum %"]],
      body: data.items.map(r => [
        r.category ?? "-",
        r.count ?? 0,
        (r.percentage ?? 0) + "%",
        (r.cumulativePercentage ?? 0) + "%"
      ]),
      startY: 22
    })
  }

  if (data.type === "DISTRIBUTION") {
  doc.setFontSize(10)
  let y = 22

  for (const k of data.customFields) {
    doc.text(`${k}: ${data.metadata[k] || "-"}`, 14, y)
    y += 6
  }
  doc.text(`Date: ${data.metadata.date || "-"}`, 14, y)
  y += 10

  const body = data.rows.map(r => [
    r.deviation,
    (data.target + r.deviation * data.binSize).toFixed(6),
    r.count,
    data.unit
  ])

  autoTable(doc, {
    head: [["Deviation", "Actual", "Count", "Unit"]],
    body,
    startY: y
  })

  doc.save(filename.endsWith(".pdf") ? filename : filename + ".pdf")
}

if (data.type === "DEFECT_LOCATION") {
  doc.setFontSize(10)

  let y = 22
  for (const k of data.customFields) {
    doc.text(`${k}: ${data.metadata[k] || "-"}`, 14, y)
    y += 6
  }
  doc.text(`Total: ${data.totalAll ?? "-"}`, 14, y)
  y += 10

  const head = ["Circ","Rad","Count","Defect","Severity","Comment","Time"]

  const rows = data.mapping.map(m => [
    m.circ,
    m.rad,
    m.count,
    m.defect,
    m.severity,
    m.comment,
    new Date(m.timestamp).toLocaleString(),
  ])

  autoTable(doc, {
    head: [head],
    body: rows,
    startY: y
  })

  doc.save(filename.endsWith(".pdf") ? filename : filename + ".pdf")
}

if (data.type === "DEFECT_CAUSE") {
  doc.setFontSize(10)

  let y = 22
  for (const k of data.customFields) {
    doc.text(`${k}: ${data.metadata[k] || "-"}`, 14, y)
    y += 6
  }
  doc.text(`Total: ${data.totalAll ?? "-"}`, 14, y)
  y += 10
    
  autoTable(doc, {
    head: [["Worker","Day","Shift","Defect"]],
    body: data.dataset.map(e => [e.worker,e.day,e.shift,e.type]),
    startY: y
  })

  doc.save(filename.endsWith(".pdf") ? filename : filename + ".pdf")
  return
}


  doc.save(filename.endsWith(".pdf") ? filename : filename + ".pdf")
}
