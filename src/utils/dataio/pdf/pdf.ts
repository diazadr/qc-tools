import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { QCData } from "../schema"

function getColTotalRaw(categories: any[], day: string) {
  return categories.reduce((s, c) => s + (c.counts[day] ?? 0), 0)
}

function header(doc: jsPDF, title: string) {
  doc.setFillColor(30, 87, 153)
  doc.rect(0, 0, 999, 22, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.text(title, 14, 14)
  doc.setTextColor(0, 0, 0)
}

function footer(doc: jsPDF) {
  const p = doc.getNumberOfPages()
  const date = new Date().toLocaleString()
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text(`Generated: ${date}`, 14, 289)
  doc.text(`Page ${p}`, 200, 289, { align: "right" })
}

function watermark(doc: jsPDF) {
  doc.setFontSize(48)
  doc.setTextColor(235)
  doc.text("QC REPORT", 40, 180, { angle: 30 })
  doc.setTextColor(0, 0, 0)
}

export function exportPDF(data: QCData, filename: string) {
  const doc = new jsPDF()
  header(doc, data.title ?? "QC Data")
  watermark(doc)

  let y = 30
  doc.setFontSize(10)

if ("customFields" in data) {
  for (const k of data.customFields) {
    doc.text(`${k}: ${data.metadata[k] || "-"}`, 14, y)
    y += 6
  }

  if (data.metadata.date) {
    doc.text(`Date: ${data.metadata.date}`, 14, y)
    y += 8
  }
}


  if (data.type === "CHECKSHEET") {
    const head = ["Category", ...data.days, "Total", "%", "Cum %"]

    let running = 0
    const rows = data.categories.map(c => {
      running += c.percentage
      return [
        c.name,
        ...data.days.map(d => c.counts[d] ?? 0),
        c.total,
        c.percentage.toFixed(1) + "%",
        running.toFixed(1) + "%"
      ]
    })

    rows.push([
      "TOTAL",
      ...data.days.map(d => getColTotalRaw(data.categories, d)),
      data.allTotal,
      "100%",
      "100%"
    ])

    autoTable(doc, {
      head: [head],
      body: rows,
      startY: y,
      headStyles: { fillColor: [30, 87, 153], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 }
    })

    const sy = doc.lastAutoTable.finalY + 12

    const sorted = data.categories
      .map(c => ({ name: c.name, pct: c.percentage }))
      .sort((a, b) => b.pct - a.pct)

    let cum = 0
    const focus = []
    for (const r of sorted) {
      cum += r.pct
      if (cum <= 80) focus.push(r.name)
    }

    const worstDay = (() => {
      let max = 0
      let maxD = "-"
      for (const d of data.days) {
        const sum = getColTotalRaw(data.categories, d)
        if (sum > max) {
          max = sum
          maxD = d
        }
      }
      return { day: maxD, total: max }
    })()

    doc.setFontSize(11)
    doc.text("Summary", 14, sy)
    doc.setFontSize(10)

    let ys = sy + 6
    doc.text(
      focus.length > 0
        ? `Dominant Defects (<=80%): ${focus.join(", ")}`
        : "Dominant Defects: None",
      14,
      ys
    )
    ys += 6

    doc.text(
      worstDay.total > 0
        ? `Most Problematic Day: ${worstDay.day} (${worstDay.total})`
        : "Most Problematic Day: None",
      14,
      ys
    )
  }

  if (data.type === "HISTOGRAM") {
    autoTable(doc, {
      head: [["Value"]],
      body: data.values.map(v => [v]),
      startY: y,
      headStyles: { fillColor: [30, 87, 153], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 }
    })
  }

  if (data.type === "PARETO") {
    autoTable(doc, {
      head: [["Category", "Count", "%", "Cum %"]],
      body: data.items.map(r => [
        r.category ?? "-",
        r.count ?? 0,
        r.percentage + "%",
        r.cumulativePercentage + "%"
      ]),
      startY: y,
      headStyles: { fillColor: [30, 87, 153], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 }
    })
  }

  if (data.type === "DISTRIBUTION") {
    const body = data.rows.map(r => [
      r.deviation,
      (data.target + r.deviation * data.binSize).toFixed(6),
      r.count,
      data.unit
    ])

    autoTable(doc, {
      head: [["Deviation", "Actual", "Count", "Unit"]],
      body,
      startY: y,
      headStyles: { fillColor: [30, 87, 153], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 }
    })

    
  }

  if (data.type === "DEFECT_LOCATION") {
    const rows = data.mapping.map(m => [
      m.circ,
      m.rad,
      m.count,
      m.defect,
      m.severity,
      m.comment,
      new Date(m.timestamp).toLocaleString()
    ])

    autoTable(doc, {
      head: [["Circ","Rad","Count","Defect","Severity","Comment","Time"]],
      body: rows,
      startY: y,
      headStyles: { fillColor: [30, 87, 153], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 }
    })
  }

if (data.type === "DEFECT_CAUSE") {
  const headRow1: any[] = ["Worker"];
  const headRow2: any[] = [""];

  for (const d of data.days) {
    headRow1.push({
      content: d,
      colSpan: data.shifts.length,
      styles: { halign: "center" }
    });

    for (const s of data.shifts) {
      headRow2.push(s);
    }
  }

  headRow1.push({ content: "Total", rowSpan: 2 });
  headRow2.push("");

  const body = data.workers.map(w => {
    const row: any[] = [w];

    for (const d of data.days) {
      for (const s of data.shifts) {
        const cellData = data.defectTypes
          .map(t => {
            const c = data.dataset.filter(
              e => e.worker === w && e.day === d && e.shift === s && e.type === t
            ).length;
            return `${t} ${c}`;
          })
          .join("\n");

        row.push(cellData);
      }
    }

    const total = data.dataset.filter(e => e.worker === w).length;
    row.push(`${total}`);

    return row;
  });

  autoTable(doc, {
    head: [headRow1, headRow2],
    body,
    startY: y,
    styles: { fontSize: 9, cellWidth: "wrap" },
    headStyles: { fillColor: [30, 87, 153], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 }
  });
}



  footer(doc)

  const name = filename.endsWith(".pdf") ? filename : filename + ".pdf"
  doc.save(name)
}
