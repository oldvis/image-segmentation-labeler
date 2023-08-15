import type { Annotation, AnnotationType } from '~/stores/annotation/types'

/** The type of data shapes in polygon annotation. */
export enum ShapeType {
  Polygon = 'Polygon',
  Rect = 'Rect',
  Point = 'Point',
}

type Point = [number, number]

interface PointLikeValue {
  /** The shape of the annotation. */
  shape: ShapeType.Point
  /** The point (x, y) positions. */
  points: [Point]
}

interface RectLikeValue {
  /** The shape of the annotation. */
  shape: ShapeType.Rect
  /** The point (x, y) positions. */
  points: [Point, Point, Point, Point]
}

interface PolygonLikeValue {
  /** The shape of the annotation. */
  shape: ShapeType.Polygon
  /** The point (x, y) positions. */
  points: Point[]
}

/**
 * The shape like annotation's value.
 * To be used by label tasks that extend the shape label task.
 */
export type ShapeLikeValue = PointLikeValue | RectLikeValue | PolygonLikeValue

/**
 * The shape like annotation.
 * To be used by label tasks that extend the shape label task.
 */
export interface AnnotationShapeLike extends Annotation {
  /** The content of the annotation. */
  value: ShapeLikeValue
}

/** The shape annotation. */
export interface AnnotationShape extends AnnotationShapeLike {
  /** The type of the annotation. */
  type: AnnotationType.Shape
  /** The content of the annotation. */
  value: ShapeLikeValue & {
    /** The category of the annotation. */
    category: string
  }
}
