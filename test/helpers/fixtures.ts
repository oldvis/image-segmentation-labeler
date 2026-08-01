import type { Annotation, ImageDataObject } from '~/stores/annotation'
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
  overrides: Partial<Annotation> & { subject: string },
): Annotation => ({
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
  overrides: Partial<Annotation> & { subject: string },
): Annotation => ({
  type: AnnotationType.MultilabelClassification,
  uuid: overrides.uuid ?? 'ml-1',
  subject: overrides.subject,
  user: overrides.user ?? null,
  time: overrides.time ?? '2024-01-01T00:00:00.000Z',
  value: overrides.value ?? ['Vis'],
})
