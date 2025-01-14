import type { AnnotationShapeLike, ShapeLikeValue } from '../shape'
import type { AnnotationType } from '~/stores/annotation/types'

export { ShapeType } from '../shape'

/**
 * The mark types.
 * - Line: Stroked lines, often used for showing change over time.
 * - Point: Circular points, such as dots in scatter plots.
 * - Rect: Rectangles, as in bar charts and timelines.
 * - Arc: Circular arcs, including pie and donut slices.
 * - Area: Filled areas with horizontal or vertical alignment.
 * - Geoshape: Polygons in maps.
 * - Isotype: Icons in isotype.
 * - Text: Text labels with configurable fonts, alignment and angle.
 * - Others: Marks that do not belong to the defined types.
 *
 * Basically follows [vega mark types](https://vega.github.io/vega/docs/marks/), with the following changes:
 * - removes "trail", "rule", "shape", "image", "group", "path", "symbol"
 * - rename "path" to "polygon"
 * - add "point", "geoshape" from [vega-lite mark types](https://vega.github.io/vega-lite/docs/mark.html)
 * - add "isotype" (in vega, isotype is stored as "point" with "shape" in its encoding field)
 */
export type MarkType = 'Line' | 'Point' | 'Rect' | 'Arc' | 'Area' | 'Geoshape' | 'Isotype' | 'Text' | 'Others'

/**
 * The type of measurement.
 * Reference: https://vega.github.io/vega-lite/docs/type.html
 */
export enum MeasurementType {
  Quantitative = 'Quantitative',
  Ordinal = 'Ordinal',
  Nominal = 'Nominal',
}

export const measurementTypes = [
  MeasurementType.Quantitative,
  MeasurementType.Ordinal,
  MeasurementType.Nominal,
]

export interface Value {
  /** The name of the encoded attribute. */
  field?: string
  /** The type of measurement. */
  type: MeasurementType
}

export interface Encode {
  /** The primary x-coordinate in pixels. */
  x?: Value
  /** The primary y-coordinate in pixels. */
  y?: Value
  /** The primary rho-coordinate in pixels for polar coordinate. */
  rho?: Value
  /** The primary theta-coordinate in radius for polar coordinate. */
  theta?: Value
  /** The width of the mark in pixels. */
  width?: Value
  /** The height of the mark in pixels. */
  height?: Value
  /** The fill color. */
  fill?: Value
  /** The stroke width in pixels. */
  strokeWidth?: Value
  /** The angle of the shape in radius (only for arc). */
  angle?: Value
  /** The outer radius of the shape (only for arc and point). */
  radius?: Value
  /** Other visual channels not covered above. */
  [key: string]: Value | undefined
}

export const encodeChannels = ['x', 'y', 'rho', 'theta', 'width', 'height', 'fill', 'strokeWidth', 'angle', 'radius']

export enum SchemaType {
  Tabular = 'Tabular',
  Graph = 'Graph',
}

export const schemaTypes = [SchemaType.Tabular, SchemaType.Graph]

/**
 * A specification of a mark in the chart.
 * Reference: https://vega.github.io/vega/docs/specification/
 */
export interface Mark {
  /** The underlying data schema. */
  schema: SchemaType
  /** The mark type. */
  type: MarkType
  /** The encoded visual channels of the mark. */
  encode: Encode
}

/**
 * Reference: https://vega.github.io/vega-lite-v2/docs/repeat.html#repeat
 */
export interface Repeat {
  /** Horizontal repeated views. */
  column?: number
  /** Vertical repeated views. */
  row?: number
}

/**
 * A specification of a chart.
 * Reference: https://vega.github.io/vega/docs/specification/
 */
interface Chart {
  /** The title of the chart in the image. */
  title?: string
  /** The theme of the chart. */
  theme?: string
  /** The language of the chart. */
  language?: string
  /** The repeating for generating small multiple. */
  repeat?: Repeat
  /** The encoding. */
  marks: Mark[]
}

/** The shape annotation. */
export interface AnnotationChart extends AnnotationShapeLike {
  /** The type of the annotation. */
  type: AnnotationType.Chart
  /** The content of the annotation. */
  value: ShapeLikeValue & {
    /** The categories of the annotation. */
    categories?: string[]
    /** The chart specification. */
    chart: Chart
  }
}
