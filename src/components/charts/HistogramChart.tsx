import ReactECharts from "echarts-for-react";

interface Props {
  data: number[];
  bins: number;
}

const HistogramChart = ({ data, bins }: Props) => {
  if (!data || data.length === 0) {
    return <div className="text-secondary">No data.</div>;
  }

  // ====================================
  // ISO BIN (STURGES)
  // ====================================
  const sturges = Math.round(1 + 3.322 * Math.log10(data.length));
  const actualBins = Math.max(3, Math.min(bins, 12, sturges));

  // ====================================
  // DATA
  // ====================================
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const binSize = range / actualBins;

  const histogram = Array(actualBins).fill(0);
  data.forEach((value) => {
    let idx = Math.floor((value - min) / binSize);
    if (idx >= actualBins) idx = actualBins - 1;
    histogram[idx]++;
  });

  const binXcoords = Array(actualBins)
    .fill(0)
    .map((_, i) => min + i * binSize);

  const maxFreq = Math.max(...histogram);

  const mean = data.reduce((a, b) => a + b, 0) / data.length;

  const option = {
    xAxis: {
      type: "value",
      min,
      max,
      name: "Measurement Value",
      nameLocation: "middle",
      nameGap: 30,
      axisLabel: { color: "#aaa" },
      scale: true,
    },

    yAxis: {
      type: "value",
      name: "Frequency",
      nameLocation: "middle",
      nameGap: 40,
      
      // ====================
      // FIX: beri ruang atas
      // ====================
      max: maxFreq * 1.15,

      // ====================
      // FIX: jangan nempel atas
      // ====================
      boundaryGap: [0, "20%"],
      axisLabel: { color: "#aaa" },
      scale: true,
    },

    grid: {
      top: 30,
      left: 65,
      right: 20,
      bottom: 45,
    },

    series: [
      {
        type: "bar",
        data: histogram.map((count, i) => [binXcoords[i], count]),
        itemStyle: {
          color: "#3B82F6",
        },
        
        // ====================
        // FIX — clipping BARS
        // ====================
        clip: true,

        // ====================
        // WIDTH LEBIH OPTIMAL
        // ====================
        barWidth: (range / actualBins) * 0.6,
      },

      {
        type: "line",
        markLine: {
          symbol: "none",
          data: [
            {
              xAxis: mean,
              lineStyle: {
                width: 2,
                type: "dashed",
                color: "#ef4444",
              },
              label: {
                formatter: `Mean = ${mean.toFixed(2)}`,
                position: "insideEndTop",
                color: "#ef4444",
              },
            },
          ],
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 350 }} />;
};

export default HistogramChart;
