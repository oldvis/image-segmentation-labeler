import { Category } from './types'

/** Native `title` copy for short category labels (tags + mark types). */
export const categoryTips: Record<string, string> = {
  [Category.Vis]: 'This is a visualization',
  [Category.NotVis]: 'This is not a visualization',
  [Category.Unsure]: 'Not sure if the annotation is accurate',
  [Category.Confident]: 'Confident that the annotation is accurate',
  [Category.Line]: 'Stroked lines, often used for showing change over time',
  [Category.Point]: 'Circular points, such as dots in scatter plots',
  [Category.Rect]: 'Rectangles, as in bar charts and timelines',
  [Category.Arc]: 'Circular arcs, including pie and donut slices',
  [Category.Area]: 'Filled areas with horizontal or vertical alignment',
  [Category.Geoshape]: 'Polygons in maps',
  [Category.Isotype]: 'Repeated icons representing quantities',
  [Category.Text]: 'Text labels with configurable fonts, alignment and angle',
  [Category.Others]: 'Other mark types',
}

export const categoryTip = (category: string): string => (
  categoryTips[category] ?? category
)
