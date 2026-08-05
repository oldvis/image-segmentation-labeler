import type { User } from '../user/types'
import type { Annotation, ImageDataObject, Status } from './types'
import type { AnnotationChart } from '~/packages/label-task-types/chart/types'
import type { AnnotationMultilabelClassification } from '~/packages/label-task-types/multilabel-classification/types'
import type { AnnotationShape } from '~/packages/label-task-types/shape/types'
import { scaleOrdinal, schemeCategory10 } from 'd3'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { computed, markRaw, reactive, ref, shallowRef } from 'vue'
import annotationsSeed from '~/data/annotations.json'
import rawDataObjects from '~/data/data-objects.json'
import { useStore as useUserStore } from '../user'
import { categories, polarityCategoryColors } from './categories'
import { AnnotationType, Category, StatusType } from './types'

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

/** True when a single annotation contributes to “labeled” for its subject. */
const annotationCountsAsLabel = (annotation: Annotation): boolean => {
  if (annotation.type === AnnotationType.MultilabelClassification) {
    return annotation.value.length > 0
  }
  return (
    annotation.type === AnnotationType.Chart
    || annotation.type === AnnotationType.Shape
  )
}

/**
 * An entry is labeled when it has detection shapes (Chart/Shape) or at least
 * one image-level tag (non-empty MultilabelClassification).
 */
const subjectHasLabels = (
  annotations: readonly Annotation[],
  subjectUuid: string,
): boolean => (
  annotations.some((annotation) => (
    annotation.subject === subjectUuid && annotationCountsAsLabel(annotation)
  ))
)

const toRawAnnotations = (next: Annotation[]): Annotation[] => (
  markRaw(next.map((annotation) => markRaw(annotation)))
)

/** O(1) remove from the raw annotations list (order is not significant). */
const removeAnnotationAt = (
  list: Annotation[],
  uuidToIndex: Map<string, number>,
  annIndex: number,
  uuid: string,
): void => {
  const last = list.length - 1
  if (annIndex !== last) {
    const moved = list[last]!
    list[annIndex] = moved
    uuidToIndex.set(moved.uuid, annIndex)
  }
  list.pop()
  uuidToIndex.delete(uuid)
}

const clearRecord = (record: Record<string, unknown>): void => {
  for (const key of Object.keys(record)) {
    delete record[key]
  }
}

const dataObjectsSeed: ImageDataObject[] = rawDataObjects.map((d) => (
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

/**
 * Annotation store (setup form).
 *
 * Hot-path design for large catalogs (see `e2e/label-latency.spec.ts`):
 * - flat `annotations` is markRaw + shallowRef (export/download only)
 * - reactive `annotationsBySubject` feeds Objects / tools UI
 * - labeled / Unsure / Confident progress counts are O(1) Set sizes
 * - remove uses uuid→index swap-pop
 * - setAnnotations is the cold path (O(n) rebuild on load/upload)
 */
export const useStore = defineStore('annotation', () => {
  /** Catalog is fixed for the session (seed / future async load). */
  const dataObjects = shallowRef(dataObjectsSeed)
  const annotations = shallowRef<Annotation[]>(markRaw([]))
  const statuses = ref<Status[]>(dataObjectsSeed.map((d) => ({
    uuid: d.uuid,
    value: StatusType.New,
  })))
  const selectedDataObjects = ref<ImageDataObject[]>([])
  const selectedAnnotations = ref<Annotation[]>([])
  /** Static category catalog (shallow so storeToRefs works). */
  const categoryList = shallowRef(categories)

  /** Per-subject rows for overlay / Objects panel (reactive). */
  const annotationsBySubject = reactive<Record<string, Annotation[]>>({})
  const labeledSubjectUuids = reactive(new Set<string>())
  const unsureTaggedSubjects = reactive(new Set<string>())
  const confidentTaggedSubjects = reactive(new Set<string>())
  /** Internal flat-list index — never returned. */
  let uuidToIndex: Map<string, number> = markRaw(new Map())

  const labeledCount = computed(() => labeledSubjectUuids.size)
  const unsureTaggedCount = computed(() => unsureTaggedSubjects.size)
  const confidentTaggedCount = computed(() => confidentTaggedSubjects.size)

  const uuidToStatus = computed((): Record<string, StatusType> => (
    Object.fromEntries(statuses.value.map((d) => [d.uuid, d.value]))
  ))

  const categoryToColor = computed((): ((category: string) => string) => {
    const markDomain = categoryList.value
      .map((d) => d.value)
      .filter((value) => !(value in polarityCategoryColors))
    const scale = scaleOrdinal(schemeCategory10).domain(markDomain)
    return (category: string): string => (
      polarityCategoryColors[category] ?? scale(category)
    )
  })

  const isLabeled = (uuid: string): boolean => labeledSubjectUuids.has(uuid)

  const syncTagSetsForSubject = (
    subject: string,
    subjectRows: readonly Annotation[],
  ): void => {
    const multilabel = subjectRows.find((d) => (
      d.type === AnnotationType.MultilabelClassification
    ))
    const tags = (
      multilabel !== undefined
      && multilabel.type === AnnotationType.MultilabelClassification
    )
      ? multilabel.value
      : []
    if (tags.includes(Category.Unsure)) unsureTaggedSubjects.add(subject)
    else unsureTaggedSubjects.delete(subject)
    if (tags.includes(Category.Confident)) confidentTaggedSubjects.add(subject)
    else confidentTaggedSubjects.delete(subject)
  }

  const syncLabeledForSubject = (
    subject: string,
    subjectRows: readonly Annotation[],
  ): void => {
    if (subjectRows.some(annotationCountsAsLabel)) {
      labeledSubjectUuids.add(subject)
    }
    else {
      labeledSubjectUuids.delete(subject)
    }
    syncTagSetsForSubject(subject, subjectRows)
  }

  /** Keep status in sync after annotation edits (preserves Skipped). */
  const syncSubjectStatus = (uuid: string): void => {
    const index = statuses.value.findIndex((d) => d.uuid === uuid)
    if (index < 0) return
    if (statuses.value[index]!.value === StatusType.Skipped) return
    statuses.value[index] = {
      uuid,
      value: isLabeled(uuid) ? StatusType.Labeled : StatusType.Viewed,
    }
  }

  const rebuildIndexes = (raw: Annotation[]): void => {
    clearRecord(annotationsBySubject)
    labeledSubjectUuids.clear()
    unsureTaggedSubjects.clear()
    confidentTaggedSubjects.clear()
    uuidToIndex = markRaw(new Map())

    for (let i = 0; i < raw.length; i += 1) {
      const annotation = raw[i]!
      uuidToIndex.set(annotation.uuid, i)
      const list = annotationsBySubject[annotation.subject]
      if (list === undefined) {
        annotationsBySubject[annotation.subject] = [annotation]
      }
      else {
        list.push(annotation)
      }
    }

    for (const subject of Object.keys(annotationsBySubject)) {
      syncLabeledForSubject(subject, annotationsBySubject[subject]!)
    }
  }

  /** Derive New/Labeled from annotations (Viewed/Skipped are session-only). */
  const rebuildStatusesFromAnnotations = (raw: readonly Annotation[]): void => {
    statuses.value = dataObjects.value.map((d) => ({
      uuid: d.uuid,
      value: subjectHasLabels(raw, d.uuid) ? StatusType.Labeled : StatusType.New,
    }))
  }

  /**
   * Cold path (load/upload): replace annotations and rebuild statuses.
   * Subjects with detection or tag labels → Labeled; others → New (clears Skipped/Viewed).
   */
  const setAnnotations = (next: Annotation[]): void => {
    const raw = toRawAnnotations(next)
    annotations.value = raw
    rebuildIndexes(raw)
    rebuildStatusesFromAnnotations(raw)
    const keep = new Set(raw.map((d) => d.uuid))
    selectedAnnotations.value = selectedAnnotations.value.filter((d) => keep.has(d.uuid))
  }

  const add = (partial: AnnotationCreate): void => {
    const userStore = useUserStore()
    const annotation = markRaw(withAnnotationMeta(
      partial,
      partial.uuid ?? uuidv4(),
      userStore.user,
      new Date().toISOString(),
    )) as Annotation

    annotations.value.push(annotation)
    uuidToIndex.set(annotation.uuid, annotations.value.length - 1)

    const subject = annotation.subject
    const prev = annotationsBySubject[subject] ?? []
    annotationsBySubject[subject] = [...prev, annotation]
    syncLabeledForSubject(subject, annotationsBySubject[subject]!)
    syncSubjectStatus(subject)
  }

  const update = (updated: Annotation): void => {
    const annIndex = uuidToIndex.get(updated.uuid)
    if (annIndex === undefined) {
      throw new Error(`Update non-existing annotation with uuid: ${updated.uuid}`)
    }
    const userStore = useUserStore()
    const previous = annotations.value[annIndex]!
    const previousSubject = previous.subject
    const next = markRaw(withAnnotationMeta(
      updated,
      updated.uuid,
      userStore.user,
      new Date().toISOString(),
    )) as Annotation

    annotations.value[annIndex] = next

    const prevList = annotationsBySubject[previousSubject] ?? []
    const without = prevList.filter((d) => d.uuid !== updated.uuid)
    if (updated.subject === previousSubject) {
      annotationsBySubject[previousSubject] = [...without, next]
      syncLabeledForSubject(previousSubject, annotationsBySubject[previousSubject]!)
      syncSubjectStatus(previousSubject)
      return
    }

    if (without.length === 0) delete annotationsBySubject[previousSubject]
    else annotationsBySubject[previousSubject] = without
    syncLabeledForSubject(previousSubject, annotationsBySubject[previousSubject] ?? [])
    syncSubjectStatus(previousSubject)

    const dest = annotationsBySubject[updated.subject] ?? []
    annotationsBySubject[updated.subject] = [...dest, next]
    syncLabeledForSubject(updated.subject, annotationsBySubject[updated.subject]!)
    syncSubjectStatus(updated.subject)
  }

  const remove = (uuid: string): void => {
    const annIndex = uuidToIndex.get(uuid)
    if (annIndex === undefined) {
      throw new Error(`Remove non-existing annotation with uuid: ${uuid}`)
    }
    const subject = annotations.value[annIndex]!.subject
    removeAnnotationAt(annotations.value, uuidToIndex, annIndex, uuid)

    const prevList = annotationsBySubject[subject] ?? []
    const nextList = prevList.filter((d) => d.uuid !== uuid)
    if (nextList.length === 0) delete annotationsBySubject[subject]
    else annotationsBySubject[subject] = nextList
    syncLabeledForSubject(subject, annotationsBySubject[subject] ?? [])
    syncSubjectStatus(subject)
  }

  const removeBulk = (uuids: string[]): void => {
    const toRemove = new Set(uuids)
    const subjects = new Set<string>()
    for (const uuid of toRemove) {
      const annIndex = uuidToIndex.get(uuid)
      if (annIndex === undefined) continue
      subjects.add(annotations.value[annIndex]!.subject)
    }
    // Rebuild flat list once (bulk is not the single-click hot path).
    const next = annotations.value.filter((d) => !toRemove.has(d.uuid))
    annotations.value = toRawAnnotations(next)
    rebuildIndexes(annotations.value)
    subjects.forEach((subject) => syncSubjectStatus(subject))
  }

  // Cold init from seed (same as previous module-scope status bootstrap).
  setAnnotations(annotationsSeed as Annotation[])

  return {
    dataObjects,
    annotations,
    statuses,
    categories: categoryList,
    selectedDataObjects,
    selectedAnnotations,
    annotationsBySubject,
    labeledCount,
    unsureTaggedCount,
    confidentTaggedCount,
    uuidToStatus,
    categoryToColor,
    isLabeled,
    syncSubjectStatus,
    add,
    update,
    remove,
    removeBulk,
    setAnnotations,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}
