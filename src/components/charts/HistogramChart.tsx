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
  comparisonLine?: { x: number; y: number }[]
  showComparisonLine?: boolean
  mode?: "measurement" | "category"
  yLeftLabel?: string
  height?: number | string
  meanValue?: number
  showMean?: boolean
}

const HistogramChart = forwardRef<any, Props>(
  (
    {
      data,
      normalCurve,
      comparisonLine,
      showComparisonLine = false,
      mode = "measurement",
      yLeftLabel = "Frequency",
      height = 350,
      meanValue,
      showMean = false
    },
    ref
  ) => {

    if (!data || data.length === 0)
      return <div className="text-secondary">No data.</div>

    const isMeasurement = mode === "measurement"

    let series: any[] = []
    let axisX:
      | {
        type: "value"
        min: number
        max: number
        name: string
        axisLabel: { color: string }
      }
      | {
        type: "category"
        data: string[]
        axisLabel: { color: string; rotate: number }
      }

    // =========================
    // MODE: MEASUREMENT
    // =========================
    if (isMeasurement) {
      const bins = data.filter(r => r.lower != null && r.upper != null)

      const minX = Math.min(...bins.map(r => r.lower as number))
      const maxX = Math.max(...bins.map(r => r.upper as number))

      series.push({
        name: "Histogram",
        type: "custom",
        renderItem: (_: any, api: any) => {
          const x1 = api.value(0)
          const y = api.value(1)
          const x2 = api.value(2)

          const start = api.coord([x1, 0])
          const end = api.coord([x2, y])

          return {
            type: "rect",
            shape: {
              x: start[0],
              y: end[1],
              width: end[0] - start[0],
              height: start[1] - end[1]
            },
            style: {
              fill: "#3B82F6",
              stroke: "#1E40AF"
            }
          }
        },
        data: bins.map(b => [b.lower, b.count, b.upper])
      })

      axisX = {
        type: "value",
        min: minX,
        max: maxX,
        name: "Value",
        axisLabel: { color: "#666" }
      }
    }

    // =========================
    // MODE: CATEGORY
    // =========================
    else {
      series.push({
        name: "Histogram",
        type: "bar",
        data: data.map(d => d.count),
        itemStyle: {
          color: "#3B82F6",
          borderColor: "#1E40AF",
          borderWidth: 1
        }
      })

      axisX = {
        type: "category",
        data: data.map(d => d.category),
        axisLabel: { color: "#666", rotate: 45 }
      }
    }

    // =========================
    // OPTIONAL LINES
    // =========================

    if (normalCurve && normalCurve.length && isMeasurement) {
      series.push({
        name: "Normal Curve",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: "#D32F2F" },
        data: normalCurve.map(p => [p.x, p.y])
      })
    }

    if (showComparisonLine && comparisonLine && comparisonLine.length) {
      series.push({
        name: "Shape Line",
        type: "line",
        showSymbol: false,
        smooth: false,
        lineStyle: { width: 2, color: "#F59E0B" },
        data: comparisonLine.map(p => [p.x, p.y])
      })
    }

    if (showMean && meanValue != null && isMeasurement) {
      series.push({
        name: "Mean",
        type: "line",
        markLine: {
          symbol: "none",
          lineStyle: {
            color: "#444",
            type: "dashed",
            width: 2
          },
          label: {
            formatter: "Mean",
            position: "end",
            color: "#444"
          },
          data: [{ xAxis: meanValue }]
        }
      })
    }

    const option = {
      grid: { top: 40, left: 65, right: 20, bottom: 50 },
      tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
      xAxis: axisX,
      yAxis: {
        type: "value",
        name: yLeftLabel,
        nameLocation: "middle",
        nameGap: 45,
        axisLabel: { color: "#666" }
      },
      series
    }

    return <ReactECharts ref={ref} option={option} style={{ height }} />
  }
)

export default HistogramChart
