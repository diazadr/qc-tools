import { forwardRef } from "react"
import ReactECharts from "echarts-for-react"

interface HistogramRow {
  category: string
  count: number
  lower?: number | null
  upper?: number | null
  midpoint?: number | null
}

interface Props {
  data: HistogramRow[]
  normalCurve?: { x: number; y: number }[]
  yLeftLabel?: string
  height?: number | string
}

const HistogramChart = forwardRef<any, Props>(({
  data,
  normalCurve,
  yLeftLabel = "Frequency",
  height = 350
}, ref) => {

  if (!data || data.length === 0)
    return <div className="text-secondary">No data.</div>

  // posisi numeric berdasarkan midpoint
  const xValues = data.map(r => r.midpoint ?? 0)
  const counts = data.map(r => r.count)

  // batas bawah & atas histogram
  const minX = Math.min(...data.map(r => r.lower ?? 0))
  const maxX = Math.max(...data.map(r => r.upper ?? 0))

  const option: any = {
    grid: { top: 40, left: 65, right: 20, bottom: 40 },

    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (params: any[]) => {
        const p = params.find(x => x.seriesType === "bar")
        if (!p) return ""

        const row = data[p.dataIndex]

        return `
          <div style="padding:6px 8px">
            <b>${row.category}</b><br/>
            ${row.lower != null ? `Class: ${row.lower.toFixed(4)} – ${row.upper?.toFixed(4)}<br/>` : ""}
            ${row.midpoint != null ? `Midpoint: ${row.midpoint.toFixed(4)}<br/>` : ""}
            Frequency: ${row.count}
          </div>
        `
      }
    },

    xAxis: {
      type: "value",
      min: minX,
      max: maxX,
      name: "Value",
      axisLabel: { color: "#666" }
    },

    yAxis: {
      type: "value",
      name: yLeftLabel,
      nameLocation: "middle",
      nameGap: 45,
      axisLabel: { color: "#666" }
    },

    series: [
      {
        name: "Frequency",
        type: "bar",

        // FIX: bar width harus pakai pixel/%. Tidak boleh pakai numeric span.
        barWidth: "90%",
        barGap: 0,
        barCategoryGap: 0,

        data: xValues.map((x, i) => ({
          value: [x, counts[i]]
        })),

        itemStyle: {
          color: "#3B82F6",
          borderColor: "#1E40AF",
          borderWidth: 1
        }
      },

      ...(normalCurve && normalCurve.length
        ? [
            {
              name: "Normal Curve",
              type: "line",
              smooth: true,
              showSymbol: false,
              yAxisIndex: 0,
              lineStyle: { width: 2, color: "#D32F2F" },
              data: normalCurve.map(p => [p.x, p.y])
            }
          ]
        : [])
    ]
  }

  return <ReactECharts ref={ref} option={option} style={{ height }} />
})

export default HistogramChart
