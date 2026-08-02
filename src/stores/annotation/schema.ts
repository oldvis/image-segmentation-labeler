import type { Annotation } from './types'
import { z } from 'zod'
import {
  markTypes,
  MeasurementType,
  SchemaType,
} from '~/packages/label-task-types/chart/types'
import { ShapeType } from '~/packages/label-task-types/shape/types'
import { UserType } from '../user/types'
import { AnnotationType } from './types'

const encodeValueSchema = z.object({
  field: z.string().optional(),
  type: z.enum(MeasurementType),
})

const userSchema = z.object({
  type: z.enum(UserType),
  name: z.string().min(1),
  uuid: z.string().min(1),
}).nullable()

const pointSchema = z.tuple([z.number(), z.number()])

const shapeLikeValueSchema = z.discriminatedUnion('shape', [
  z.object({
    shape: z.literal(ShapeType.Point),
    points: z.tuple([pointSchema]),
  }),
  z.object({
    shape: z.literal(ShapeType.Rect),
    points: z.tuple([pointSchema, pointSchema, pointSchema, pointSchema]),
  }),
  z.object({
    shape: z.literal(ShapeType.Polygon),
    points: z.array(pointSchema),
  }),
])

const chartExtraSchema = z.object({
  categories: z.array(z.string()).optional(),
  chart: z.object({
    title: z.string().optional(),
    theme: z.string().optional(),
    language: z.string().optional(),
    repeat: z.object({
      column: z.number().optional(),
      row: z.number().optional(),
    }).optional(),
    marks: z.array(z.object({
      schema: z.enum(SchemaType),
      type: z.enum(markTypes),
      encode: z.record(z.string(), encodeValueSchema),
    })),
  }),
})

/** Runtime shape of one annotation (internal; consumers use `isAnnotationArray`). */
const annotationSchema: z.ZodType<Annotation> = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(AnnotationType.Chart),
    uuid: z.string().min(1),
    subject: z.string().min(1),
    user: userSchema,
    time: z.string().nullable(),
    value: z.intersection(shapeLikeValueSchema, chartExtraSchema),
  }),
  z.object({
    type: z.literal(AnnotationType.Shape),
    uuid: z.string().min(1),
    subject: z.string().min(1),
    user: userSchema,
    time: z.string().nullable(),
    value: z.intersection(
      shapeLikeValueSchema,
      z.object({ category: z.string().min(1) }),
    ),
  }),
  z.object({
    type: z.literal(AnnotationType.MultilabelClassification),
    uuid: z.string().min(1),
    subject: z.string().min(1),
    user: userSchema,
    time: z.string().nullable(),
    value: z.array(z.string()),
  }),
])

const annotationsSchema: z.ZodType<Annotation[]> = z.array(annotationSchema)

export const isAnnotationArray = (value: unknown): value is Annotation[] => (
  annotationsSchema.safeParse(value).success
)
