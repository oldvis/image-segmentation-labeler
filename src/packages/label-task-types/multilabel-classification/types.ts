import type { AnnotationBase, AnnotationType } from '~/stores/annotation/types'

/** The multilabel classification annotation. */
export interface AnnotationMultilabelClassification extends AnnotationBase {
  type: AnnotationType.MultilabelClassification
  value: string[]
}
