import type { Categories } from './types'
import { AnnotationType, Category } from './types'

/** Solid Vis / Not Vis / Unsure / Confident hues. */
export const polarityCategoryColors: Record<string, string> = {
  [Category.Vis]: '#0d9488',
  [Category.NotVis]: '#dc2626',
  [Category.Unsure]: '#6b7280',
  [Category.Confident]: '#0284c7',
}

export const categories: Categories = [
  // Vis/Non-Vis
  { value: Category.Vis, tasks: [AnnotationType.MultilabelClassification] },
  { value: Category.NotVis, tasks: [AnnotationType.MultilabelClassification] },
  // Confident/Unsure
  { value: Category.Unsure, tasks: [AnnotationType.MultilabelClassification] },
  { value: Category.Confident, tasks: [AnnotationType.MultilabelClassification] },
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
