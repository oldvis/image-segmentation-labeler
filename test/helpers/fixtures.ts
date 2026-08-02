import type { AnnotationChart } from '~/packages/label-task-types/chart/types'
import type { AnnotationMultilabelClassification } from '~/packages/label-task-types/multilabel-classification/types'
import type { AnnotationShape } from '~/packages/label-task-types/shape/types'
import type { ImageDataObject } from '~/stores/annotation'
import { SchemaType } from '~/packages/label-task-types/chart/types'
import { ShapeType } from '~/packages/label-task-types/shape/types'
import { AnnotationType } from '~/stores/annotation'

export const makeDataObject = (uuid = 'img-1'): ImageDataObject => ({
  uuid,
  value: {
    url: 'https://example.com/img-1.jpg',
    width: 200,
    height: 100,
    filename: `${uuid}.jpg`,
  },
})

export const makeChartAnnotation = (
  overrides: Partial<AnnotationChart> & { subject: string },
): AnnotationChart => ({
  type: AnnotationType.Chart,
  uuid: overrides.uuid ?? 'ann-1',
  subject: overrides.subject,
  user: overrides.user ?? null,
  time: overrides.time ?? '2024-01-01T00:00:00.000Z',
  value: overrides.value ?? {
    shape: ShapeType.Rect,
    points: [[10, 10], [10, 40], [50, 40], [50, 10]],
    chart: {
      marks: [{ schema: SchemaType.Tabular, type: 'Rect', encode: {} }],
    },
  },
})

export const makeMultilabelAnnotation = (
  overrides: Partial<AnnotationMultilabelClassification> & { subject: string },
): AnnotationMultilabelClassification => ({
  type: AnnotationType.MultilabelClassification,
  uuid: overrides.uuid ?? 'ml-1',
  subject: overrides.subject,
  user: overrides.user ?? null,
  time: overrides.time ?? '2024-01-01T00:00:00.000Z',
  value: overrides.value ?? ['Vis'],
})

export const makeShapeAnnotation = (
  overrides: Partial<AnnotationShape> & { subject: string },
): AnnotationShape => ({
  type: AnnotationType.Shape,
  uuid: overrides.uuid ?? 'shape-1',
  subject: overrides.subject,
  user: overrides.user ?? null,
  time: overrides.time ?? '2024-01-01T00:00:00.000Z',
  value: overrides.value ?? {
    category: 'Rect',
    shape: ShapeType.Rect,
    points: [[0, 0], [0, 1], [1, 1], [1, 0]],
  },
})
