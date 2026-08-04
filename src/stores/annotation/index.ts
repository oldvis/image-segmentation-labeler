import type { User } from '../user/types'
import type { Annotation, ImageDataObject, Status } from './types'
import type { AnnotationChart } from '~/packages/label-task-types/chart/types'
import type { AnnotationMultilabelClassification } from '~/packages/label-task-types/multilabel-classification/types'
import type { AnnotationShape } from '~/packages/label-task-types/shape/types'
import { scaleOrdinal, schemeCategory10 } from 'd3'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import annotations from '~/data/annotations.json'
import rawDataObjects from '~/data/data-objects.json'
import { useStore as useUserStore } from '../user'
import { categories } from './categories'
import { StatusType } from './types'

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
const statuses: Status[] = dataObjects.map((d) => ({ uuid: d.uuid, value: StatusType.New }))

export const useStore = defineStore('annotation', {
  state: () => ({
    dataObjects,
    annotations: annotations as Annotation[],
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
      const { categories } = this
      const scale = scaleOrdinal(schemeCategory10).domain(categories.map((d) => d.value))
      return (category: string): string => scale(category)
    },
  },
  actions: {
    /** Check if a data entry is labeled */
    isLabeled(uuid: string): boolean {
      const { uuidToStatus } = this
      return (uuid in uuidToStatus) && (uuidToStatus[uuid] === StatusType.Labeled)
    },
    add(partial: AnnotationCreate): void {
      const userStore = useUserStore()
      this.annotations.push(withAnnotationMeta(
        partial,
        partial.uuid ?? uuidv4(),
        userStore.user,
        new Date().toISOString(),
      ))
    },
    /** Update an annotation. */
    update(updated: Annotation): void {
      const index = this.annotations.findIndex((d) => (d.uuid === updated.uuid))
      if (index < 0) throw new Error(`Update non-existing annotation with uuid: ${updated.uuid}`)
      const userStore = useUserStore()
      this.annotations[index] = withAnnotationMeta(
        updated,
        updated.uuid,
        userStore.user,
        new Date().toISOString(),
      )
    },
    /** Remove an annotation. */
    remove(uuid: string): void {
      const index = this.annotations.findIndex((d) => (d.uuid === uuid))
      if (index < 0) throw new Error(`Remove non-existing annotation with uuid: ${uuid}`)
      this.annotations.splice(index, 1)
    },
    /** Remove multiple annotations. */
    removeBulk(uuids: string[]): void {
      const toRemove = new Set(uuids)
      this.annotations = this.annotations.filter((d) => !(toRemove.has(d.uuid)))
    },
    /**
     * Cold path (load/upload): replace annotations and rebuild statuses.
     * Subjects with ≥1 annotation → Labeled; others → New (clears Skipped/Viewed).
     */
    setAnnotations(next: Annotation[]): void {
      this.annotations = next
      const labeledSubjects = new Set(next.map((d) => d.subject))
      this.statuses = this.dataObjects.map((d) => ({
        uuid: d.uuid,
        value: labeledSubjects.has(d.uuid) ? StatusType.Labeled : StatusType.New,
      }))
      const keep = new Set(next.map((d) => d.uuid))
      this.selectedAnnotations = this.selectedAnnotations.filter((d) => keep.has(d.uuid))
    },
  },
  persist: true,
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}
