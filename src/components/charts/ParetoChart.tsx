import { forwardRef, useImperativeHandle, useRef } from "react";
import ReactECharts from "echarts-for-react";

export interface ParetoItem {
  category: string;
  count: number;
}

export interface ParetoChartHandle {
  getImageDataUrl: () => string | null;
}



interface Props {
  data: ParetoItem[];
  show80Line?: boolean;
  showABCLine?: boolean;
  showABCLabel?: boolean;
  yLeftLabel?: string;
  yRightLabel?: string;
  product?: string;
  line?: string;
  shift?: string;
  date?: string;
}

const ParetoChart = forwardRef<ParetoChartHandle, Props>(
  (
    {
      data,
      show80Line = true,
      showABCLine = false,
      showABCLabel = false,
      yLeftLabel = "Count",
      yRightLabel = "Cumulative %",
      product,
      line,
      shift,
      date,
    },
    ref
  ) => {
    const chartRef = useRef<any>(null);
    const getImageDataUrl = () => {
      if (!chartRef.current) return null;
      return chartRef.current.getEchartsInstance().getDataURL({
        type: "png",
        pixelRatio: 3,
        backgroundColor: "#FFFFFF",
      });
    };

    // ======================================================
    // FUNGSI AMBIL UKURAN DOM CHART
    // ======================================================
    const getImageSize = () => {
      const el = chartRef.current?.getEchartsInstance().getDom();
      return el ? { w: el.offsetWidth, h: el.offsetHeight } : null;
    };
     useImperativeHandle(ref, () => ({
    getImageDataUrl,
    getImageSize,
  }));
    const sorted = data;
    const total = sorted.reduce((s, x) => s + x.count, 0);

    // Hitung kategori A/B/C
    let cumulativeABC = 0;
    const abcClass = sorted.map((d) => {
      cumulativeABC += d.count;
      const pct = total === 0 ? 0 : (cumulativeABC / total) * 100;

      if (pct <= 80) return "A";
      if (pct <= 95) return "B";
      return "C";
    });

    // Untuk chart kategori
    let cumulative = 0;
    const categories = sorted.map((d) => `${d.category} (${d.count})`);
    const counts = sorted.map((d) => d.count);

    const cumulativePercent = sorted.map((d) => {
      cumulative += d.count;
      return Number(((cumulative / total) * 100).toFixed(1));
    });

    // Warna bar - mode ABC opsional
    const topColors = ["#DC2626", "#EA580C", "#EAB308"];
    const barColors = sorted.map((d, i) => {
      if (d.category.includes("Others (")) return "#6B7280";

      if (showABCLine || showABCLabel) {
        const cls = abcClass[i];
        if (cls === "A") return "#DC2626";
        if (cls === "B") return "#EAB308";
        return "#1E40AF";
      }

      return i < 3 ? topColors[i] : "#1E3A8A";
    });

    const metaTitle =
      [
        product ? `Product: ${product}` : "",
        line ? `Line: ${line}` : "",
        shift ? `Shift: ${shift}` : "",
        date ? `Date: ${date}` : "",
      ]
        .filter(Boolean)
        .join(" | ") || "Pareto Chart";

    const option = {
      title: {
        text: metaTitle,
        left: "center",
        textStyle: { fontSize: 14, fontWeight: 600, color: "#e2e8f0" },
      },

      tooltip: {
        trigger: "axis",
        formatter: (params: any[]) => {
          const bar = params.find((p) => p.seriesType === "bar");
          const line = params.find((p) => p.seriesType === "line");
          const rank = bar?.dataIndex + 1;

          return `
<b>${bar?.name}</b><br/>
Rank: ${rank}<br/>
${yLeftLabel}: ${bar?.value}<br/>
${yRightLabel}: ${line?.value}%<br/>
ABC: ${abcClass[bar?.dataIndex] || "-"}
          `;
        },
      },

      grid: {
        top: 60,
        left: 50,
        right: 60,
        bottom: 80,
      },

      xAxis: {
        type: "category",
        data: categories,
        axisLabel: { rotate: 35, color: "#9ca3af", fontSize: 11 },
        axisLine: { lineStyle: { color: "#475569" } },
      },

      yAxis: [
        {
          type: "value",
          name: yLeftLabel,
          axisLine: { lineStyle: { color: "#9ca3af" } },
          splitLine: { lineStyle: { color: "#475569" } },
        },
        {
          type: "value",
          name: yRightLabel,
          min: 0,
          max: 100,
          axisLine: { lineStyle: { color: "#9ca3af" } },
          axisLabel: { formatter: "{value}%" },
          splitLine: { show: false },
        },
      ],

      series: [
        // BAR SERIES
        {
          name: yLeftLabel,
          type: "bar",
          data: counts,
          barWidth: "60%",
          itemStyle: { color: (p: any) => barColors[p.dataIndex] },

          ...(showABCLabel
            ? {
              label: {
                show: true,
                position: "top",
                formatter: (p: any) => abcClass[p.dataIndex],
                color: "#FFFFFF",
                fontSize: 11,
                fontWeight: 700,
              },
            }
            : {}),
        },

        // LINE SERIES
        {
          name: yRightLabel,
          type: "line",
          yAxisIndex: 1,
          data: cumulativePercent,
          symbol: "circle",
          symbolSize: 9,
          smooth: false,
          label: {
            show: true,
            position: "top",
            formatter: "{c}%",
            color: "#F59E0B",
            fontSize: 10,
          },
          itemStyle: { color: "#F59E0B" },
          lineStyle: { width: 3, color: "#F59E0B" },

          ...(showABCLine
            ? {
              markLine: {
                yAxisIndex: 1,
                data: [{ yAxis: 80 }, { yAxis: 95 }],
                lineStyle: {
                  type: "dashed",
                  width: 2,
                  color: "#22C55E",
                },
                label: {
                  formatter: (p: any) =>
                    p.value === 80 ? "80%" : "95%",
                  position: "end",
                  color: "#22C55E",
                  fontSize: 11,
                },
              },
            }
            : show80Line
              ? {
                markLine: {
                  yAxisIndex: 1,
                  data: [{ yAxis: 80 }],
                  lineStyle: {
                    type: "dashed",
                    width: 2,
                    color: "#22C55E",
                  },
                  label: {
                    formatter: "80% Threshold",
                    position: "end",
                    color: "#22C55E",
                    fontSize: 11,
                  },
                },
              }
              : {}),
        },
      ],
    };

    useImperativeHandle(ref, () => ({
      getImageDataUrl: () => {
        if (!chartRef.current) return null;
        return chartRef.current.getEchartsInstance().getDataURL({
          type: "png",
          pixelRatio: 3,
          backgroundColor: "#FFFFFF",
        });
      },
    }));

    return (
      <ReactECharts
        ref={chartRef}
        option={option}
        notMerge={true}
        lazyUpdate={false}
        style={{ height: 420, width: "100%" }}
      />
    );
  }
);

ParetoChart.displayName = "ParetoChart";
export default ParetoChart;
