export type DataType =
  | "CHECKSHEET"
  | "HISTOGRAM"
  | "PARETO"
  | "DISTRIBUTION"
  | "DEFECT_LOCATION"
  | "DEFECT_CAUSE"

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

export interface DefectCauseData {
  type: "DEFECT_CAUSE"
  title: string

  metadata: Record<string,string>
  customFields: string[]

  workers: string[]
  defectType: string[]
  days: string[]
  shift: string[]

  dataset: {
    worker: string
    day: string
    shift: string
    type: string
  }[]

  totalAll: number

  sortKey?: string | null
  sortAsc?: boolean
}



export interface DefectLocationData {
  type: "DEFECT_LOCATION"
  title: string

  metadata: Record<string, string>
  customFields: string[]

  circular: string[]
  radial: number[]

  mapping: {
    circ: string
    rad: number
    count: number
    defect: string
    severity: "Minor" | "Major" | "Critical"
    comment: string
    timestamp: number
  }[]

  totalAll?: number
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

export interface DistributionData {
  type: "DISTRIBUTION"
  title: string

  metadata: Record<string, string>
  customFields: string[]

  rows: {
    deviation: number
    actual?: number
    count: number
  }[]

  target: number
  LSL: number
  USL: number
  binSize: number
  unit: string
}


export type QCData = ChecksheetData | HistogramData | ParetoData | DistributionData | DefectLocationData | DefectCauseData
