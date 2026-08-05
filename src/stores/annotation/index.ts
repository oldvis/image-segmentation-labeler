import type { User } from '../user/types'
import type { Annotation, ImageDataObject, Status } from './types'
import type { AnnotationChart } from '~/packages/label-task-types/chart/types'
import type { AnnotationMultilabelClassification } from '~/packages/label-task-types/multilabel-classification/types'
import type { AnnotationShape } from '~/packages/label-task-types/shape/types'
import { scaleOrdinal, schemeCategory10 } from 'd3'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import annotationsSeed from '~/data/annotations.json'
import rawDataObjects from '~/data/data-objects.json'
import { useStore as useUserStore } from '../user'
import { categories, polarityCategoryColors } from './categories'
import { AnnotationType, StatusType } from './types'

export { categories } from './categories'
export { categoryTip, categoryTips } from './categoryTips'
export { isAnnotationArray, parseUploadedAnnotations } from './schema'
export * from './types'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

/**
 * Argument to the annotation store's `add` action. `uuid`, `user`, and `time`
 * are optional — if omitted, that action sets them (new uuid, current user,
 * current time).
 *
 * Declared as an explicit union so narrowing on `type` still works
 * (`Optional<Annotation, …>` on the merged union does not).
 */
export type AnnotationCreate
  = Optional<AnnotationChart, 'uuid' | 'user' | 'time'>
    | Optional<AnnotationShape, 'uuid' | 'user' | 'time'>
    | Optional<AnnotationMultilabelClassification, 'uuid' | 'user' | 'time'>

/** Fill uuid/user/time. Generic keeps the Chart/Shape/Multilabel variant. */
const withAnnotationMeta = <T extends AnnotationCreate>(
  partial: T,
  uuid: string,
  user: User | null,
  time: string,
): T & Pick<Annotation, 'uuid' | 'user' | 'time'> => ({
  ...partial,
  uuid,
  user,
  time,
})

/**
 * An entry is labeled when it has detection shapes (Chart/Shape) or at least
 * one image-level tag (non-empty MultilabelClassification).
 */
const subjectHasLabels = (
  annotations: readonly Annotation[],
  subjectUuid: string,
): boolean => (
  annotations.some((annotation) => {
    if (annotation.subject !== subjectUuid) return false
    if (annotation.type === AnnotationType.MultilabelClassification) {
      return annotation.value.length > 0
    }
    return (
      annotation.type === AnnotationType.Chart
      || annotation.type === AnnotationType.Shape
    )
  })
)

const dataObjects: ImageDataObject[] = rawDataObjects.map((d) => (
  {
    uuid: d.uuid,
    value: {
      url: d.downloadUrl,
      width: d.width,
      height: d.height,
      filename: `${d.uuid}.jpg`,
    },
  }
))

const annotations = annotationsSeed as Annotation[]

const statuses: Status[] = dataObjects.map((d) => ({
  uuid: d.uuid,
  value: subjectHasLabels(annotations, d.uuid) ? StatusType.Labeled : StatusType.New,
}))

export const useStore = defineStore('annotation', {
  state: () => ({
    dataObjects,
    annotations,
    /** The label statuses of the data objects. */
    statuses,
    categories,
    /** The selected data objects. */
    selectedDataObjects: [] as ImageDataObject[],
    /** The selected annotations. */
    selectedAnnotations: [] as Annotation[],
  }),
  getters: {
    uuidToStatus(): Record<string, StatusType> {
      return Object.fromEntries(this.statuses.map((d) => [d.uuid, d.value]))
    },
    categoryToColor(): ((category: string) => string) {
      const markDomain = this.categories
        .map((d) => d.value)
        .filter((value) => !(value in polarityCategoryColors))
      const scale = scaleOrdinal(schemeCategory10).domain(markDomain)
      return (category: string): string => (
        polarityCategoryColors[category] ?? scale(category)
      )
    },
  },
  actions: {
    /**
     * True when the entry has shape/chart annotations or image-level tags.
     * Skipped is tracked separately via `statuses`.
     */
    isLabeled(uuid: string): boolean {
      return subjectHasLabels(this.annotations, uuid)
    },
    /** Keep status in sync after annotation edits (preserves Skipped). */
    syncSubjectStatus(uuid: string): void {
      const index = this.statuses.findIndex((d) => d.uuid === uuid)
      if (index < 0) return
      if (this.statuses[index]!.value === StatusType.Skipped) return
      this.statuses[index] = {
        uuid,
        value: this.isLabeled(uuid) ? StatusType.Labeled : StatusType.Viewed,
      }
    },
    add(partial: AnnotationCreate): void {
      const userStore = useUserStore()
      this.annotations.push(withAnnotationMeta(
        partial,
        partial.uuid ?? uuidv4(),
        userStore.user,
        new Date().toISOString(),
      ))
      this.syncSubjectStatus(partial.subject)
    },
    /** Update an annotation. */
    update(updated: Annotation): void {
      const index = this.annotations.findIndex((d) => (d.uuid === updated.uuid))
      if (index < 0) throw new Error(`Update non-existing annotation with uuid: ${updated.uuid}`)
      const userStore = useUserStore()
      const previousSubject = this.annotations[index]!.subject
      this.annotations[index] = withAnnotationMeta(
        updated,
        updated.uuid,
        userStore.user,
        new Date().toISOString(),
      )
      this.syncSubjectStatus(previousSubject)
      if (updated.subject !== previousSubject) {
        this.syncSubjectStatus(updated.subject)
      }
    },
    /** Remove an annotation. */
    remove(uuid: string): void {
      const index = this.annotations.findIndex((d) => (d.uuid === uuid))
      if (index < 0) throw new Error(`Remove non-existing annotation with uuid: ${uuid}`)
      const subject = this.annotations[index]!.subject
      this.annotations.splice(index, 1)
      this.syncSubjectStatus(subject)
    },
    /** Remove multiple annotations. */
    removeBulk(uuids: string[]): void {
      const toRemove = new Set(uuids)
      const subjects = new Set(
        this.annotations.filter((d) => toRemove.has(d.uuid)).map((d) => d.subject),
      )
      this.annotations = this.annotations.filter((d) => !(toRemove.has(d.uuid)))
      subjects.forEach((subject) => this.syncSubjectStatus(subject))
    },
    /**
     * Cold path (load/upload): replace annotations and rebuild statuses.
     * Subjects with detection or tag labels → Labeled; others → New (clears Skipped/Viewed).
     */
    setAnnotations(next: Annotation[]): void {
      this.annotations = next
      this.statuses = this.dataObjects.map((d) => ({
        uuid: d.uuid,
        value: subjectHasLabels(next, d.uuid) ? StatusType.Labeled : StatusType.New,
      }))
      const keep = new Set(next.map((d) => d.uuid))
      this.selectedAnnotations = this.selectedAnnotations.filter((d) => keep.has(d.uuid))
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}
