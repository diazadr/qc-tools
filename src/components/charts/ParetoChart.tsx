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
  yLeftLabel?: string;
  yRightLabel?: string;
}

const ParetoChart = forwardRef<ParetoChartHandle, Props>(
  ({ data, show80Line = true, yLeftLabel = "Count", yRightLabel = "Cumulative %" }, ref) => {
    const chartRef = useRef<any>(null);

    const sorted = [...data].sort((a, b) => b.count - a.count);
    const total = sorted.reduce((sum, d) => sum + d.count, 0);

    let cumulative = 0;
    const categories = sorted.map((d) => d.category);
    const counts = sorted.map((d) => d.count);
    const cumulativePercent = sorted.map((d) => {
      cumulative += d.count;
      const pct = total === 0 ? 0 : (cumulative / total) * 100;
      return Number(pct.toFixed(1));
    });

    const option = {
      title: {
        text: "Pareto Chart of Defect Categories",
        left: "center",
        textStyle: {
          fontSize: 14,
          fontWeight: 600,
          color: "#e2e8f0",
        },
      },
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const bar = params[0];
          const line = params[1];
          return `
            <b>${bar.name}</b><br/>
            ${yLeftLabel}: ${bar.value}<br/>
            ${yRightLabel}: ${line.value}%
          `;
        },
        axisPointer: { type: "shadow" },
      },
      grid: {
        top: 60,
        left: 50,
        right: 60,
        bottom: 50,
      },
      xAxis: [
        {
          type: "category",
          data: categories,
          axisLabel: {
            rotate: 0,  // ISO: tegak lurus
            color: "#9ca3af",
            fontSize: 12,
          },
          axisLine: {
            lineStyle: { color: "#475569" },
          },
        },
      ],
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
          axisLabel: { formatter: "{value}%" },
          axisLine: { lineStyle: { color: "#9ca3af" } },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: yLeftLabel,
          type: "bar",
          data: counts,
          barWidth: "60%",
          itemStyle: {
            color: "#1E3A8A",
          },
        },
        {
          name: yRightLabel,
          type: "line",
          yAxisIndex: 1,
          data: cumulativePercent,
          smooth: true,
          symbol: "circle",      // ISO: titik di poin
          symbolSize: 8,
          itemStyle: {
            color: "#F59E0B",
          },
          lineStyle: {
            width: 3,
          },

          ...(show80Line
            ? {
                markLine: {
                  data: [{ yAxis: 80 }],
                  lineStyle: {
                    type: "dashed",
                    width: 2,
                    color: "#22C55E",
                  },
                  label: {
                    formatter: "80% Threshold",
                    position: "end",
                    fontSize: 11,
                    color: "#22C55E",
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
        const instance = chartRef.current.getEchartsInstance();
        return instance.getDataURL({
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
        style={{ height: 380, width: "100%" }}
      />
    );
  }
);

ParetoChart.displayName = "ParetoChart";

export default ParetoChart;
