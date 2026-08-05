import type { User } from '../user/types'
import type { AnnotationChart } from '~/packages/label-task-types/chart/types'
import type { AnnotationMultilabelClassification } from '~/packages/label-task-types/multilabel-classification/types'
import type { AnnotationShape } from '~/packages/label-task-types/shape/types'

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
  // Confident/Unsure
  Unsure = 'Unsure',
  Confident = 'Confident',
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

export type Categories = { value: Category, tasks: AnnotationType[] }[]

/** Shared fields for every annotation variant. */
export interface AnnotationBase {
  /** The uuid of the annotation. */
  uuid: string
  /** The uuid of the subject the annotation is associated with. */
  subject: string
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

/**
 * Active annotation union (Chart | Shape | MultilabelClassification).
 * Narrow with `annotation.type`.
 */
export type Annotation
  = AnnotationChart
    | AnnotationShape
    | AnnotationMultilabelClassification

/** Image payload for OldVis labeling subjects. */
export interface ImageDataObjectValue {
  url: string
  width: number
  height: number
  filename: string
}

/** The interface of a data object to be labeled. */
export interface DataObject<T = unknown> {
  /** The universal unique id of the data object. */
  uuid: string
  /** The content of the data object. */
  value: T
}

export type ImageDataObject = DataObject<ImageDataObjectValue>
