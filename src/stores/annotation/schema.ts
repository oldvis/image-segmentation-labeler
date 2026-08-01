import type { Annotation } from './types'
import { z } from 'zod'
import { UserType } from '../user/types'
import { AnnotationType } from './types'

export const annotationSchema = z.object({
  type: z.enum(AnnotationType),
  uuid: z.string().min(1),
  subject: z.string().min(1),
  value: z.unknown(),
  user: z.object({
    type: z.enum(UserType),
    name: z.string().min(1),
    uuid: z.string().min(1),
  }).nullable(),
  time: z.string().nullable(),
})

export const annotationsSchema = z.array(annotationSchema)

export const isAnnotationArray = (value: unknown): value is Annotation[] => (
  annotationsSchema.safeParse(value).success
)
