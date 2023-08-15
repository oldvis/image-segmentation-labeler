import { AnnotationType, Category } from './types'
import type { Categories } from './types'

export const categories: Categories = [
  // Vis/Non-Vis
  { value: Category.Vis, tasks: [AnnotationType.MultilabelClassification] },
  { value: Category.NotVis, tasks: [AnnotationType.MultilabelClassification] },
  // Confident/Unconfident
  { value: Category.Confident, tasks: [AnnotationType.MultilabelClassification] },
  { value: Category.Unconfident, tasks: [AnnotationType.MultilabelClassification] },
  // Mark type categories.
  { value: Category.Line, tasks: [AnnotationType.Chart] },
  { value: Category.Point, tasks: [AnnotationType.Chart] },
  { value: Category.Rect, tasks: [AnnotationType.Chart] },
  { value: Category.Arc, tasks: [AnnotationType.Chart] },
  { value: Category.Area, tasks: [AnnotationType.Chart] },
  { value: Category.Geoshape, tasks: [AnnotationType.Chart] },
  { value: Category.Isotype, tasks: [AnnotationType.Chart] },
  { value: Category.Text, tasks: [AnnotationType.Chart] },
  { value: Category.Others, tasks: [AnnotationType.Chart] },
]
