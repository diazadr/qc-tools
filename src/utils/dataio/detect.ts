import type { QCData } from "./schema"


export function detectDataType(obj: any): QCData["type"] {
  if (obj.categories && obj.days) return "CHECKSHEET"
  if (obj.values) return "HISTOGRAM"
  if (obj.items) return "PARETO"
  return "CHECKSHEET"
}
