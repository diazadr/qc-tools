export type DataType =
  | "CHECKSHEET"
  | "HISTOGRAM"
  | "PARETO"

export interface ChecksheetData {
  type: "CHECKSHEET"
  title: string
  days: string[]

  metadata: Record<string, string> // ⬅ baru
  customFields: string[]           // ⬅ baru

  categories: {
    name: string
    counts: Record<string, number>
    total?: number                 // ⬅ baru
    percentage?: number            // ⬅ baru
  }[]

  allTotal: number                  // ⬅ baru
  sortedCategories?: any[]          // ⬅ baru
}


export interface HistogramData {
  type: "HISTOGRAM"
  title: string
  values: number[]
  bins?: number
}

export interface ParetoData {
  type: "PARETO"
  title: string
  items: {
    category: string
    count: number
    percentage?: number
    cumulativePercentage?: number
  }[]
}

export type QCData = ChecksheetData | HistogramData | ParetoData
