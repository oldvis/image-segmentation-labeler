import type { Annotation, AnnotationType } from '~/stores/annotation/types'

/** The classification annotation. */
export interface AnnotationMultilabelClassification extends Annotation {
  /** The type of the annotation. */
  type: AnnotationType.MultilabelClassification
  /** The content of the annotation. */
  value: string[]
}
