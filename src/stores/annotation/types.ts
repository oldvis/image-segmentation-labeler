import type { User } from '../user/types'

/** The enum of label status types. */
export enum StatusType {
  /** The data object is not viewed and not labeled. */
  New = 'New',
  /** The data object is viewed but not yet labeled. */
  Viewed = 'Viewed',
  /** The data object is viewed but skipped. */
  Skipped = 'Skipped',
  /** The data object is labeled. */
  Labeled = 'Labeled',
}

export interface Status {
  uuid: string
  value: StatusType
}

export enum AnnotationType {
  Chart = 'Chart',
  Classification = 'Classification',
  MultilabelClassification = 'MultilabelClassification',
  Shape = 'Shape',
  MultilabelShape = 'MultilabelShape',
}

export enum Category {
  // Vis/Non-Vis
  Vis = 'Vis',
  NotVis = 'Not Vis',
  // Confident/Unconfident
  Confident = 'Confident',
  Unconfident = 'Unconfident',
  // Mark type categories.
  /** Stroked lines, often used for showing change over time. */
  Line = 'Line',
  /** Circular points, such as dots in scatter plots. */
  Point = 'Point',
  /** Rectangles, as in bar charts and timelines. */
  Rect = 'Rect',
  /** Circular arcs, including pie and donut slices. */
  Arc = 'Arc',
  /** Filled areas with horizontal or vertical alignment. */
  Area = 'Area',
  /** Polygons in maps. */
  Geoshape = 'Geoshape',
  Isotype = 'Isotype',
  /** Text labels with configurable fonts, alignment and angle. */
  Text = 'Text',
  Others = 'Others',
}

export type Categories = { value: Category; tasks: AnnotationType[] }[]

export interface Annotation {
  /** The type of annotation. */
  type: AnnotationType
  /** The uuid of the annotation. */
  uuid: string
  /** The uuid of the subject the annotation is associated with. */
  subject: string
  /** The annotation content. */
  value: unknown
  /**
   * The user providing the annotation.
   * Null when the user cannot be identified.
   */
  user: User | null
  /**
   * The time the annotation is finished.
   * Null when the time cannot be identified.
   */
  time: string | null
}

/** The interface of a data object to be labeled. */
export interface DataObject {
  /** The universal unique id of the data object. */
  uuid: string
  /** The content of the data object. */
  value: unknown
}
