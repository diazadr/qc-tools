import type { QCData } from "./schema"


export function detectDataType(obj: any): QCData["type"] {

  if (obj.rows && obj.target !== undefined) return "DISTRIBUTION"

  if (obj.categories && obj.days) return "CHECKSHEET"
  if (obj.values) return "HISTOGRAM"
  if (obj.items) return "PARETO"
  if (obj.mapping && obj.circular && obj.radial) return "DEFECT_LOCATION"
  if (obj.dataset && obj.workers && obj.defectType) return "DEFECT_CAUSE"

  return "CHECKSHEET"
}
