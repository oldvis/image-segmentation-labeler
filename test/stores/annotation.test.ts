import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import seedAnnotations from '~/data/annotations.json'
import { ShapeType } from '~/packages/label-task-types/shape/types'
import {
  AnnotationType,
  isAnnotationArray,
  parseUploadedAnnotations,
  StatusType,
  useStore as useAnnotationStore,
} from '~/stores/annotation'
import { useStore as useUserStore } from '~/stores/user'
import { makeChartAnnotation, makeMultilabelAnnotation } from '../helpers/fixtures'

describe('annotation store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('maps seed data objects and starts them as New', () => {
    const store = useAnnotationStore()
    expect(store.dataObjects).toHaveLength(2)
    expect(store.dataObjects[0]).toMatchObject({
      uuid: 'img-1',
      value: { width: 200, height: 100, filename: 'img-1.jpg' },
    })
    expect(store.statuses.every((d) => d.value === StatusType.New)).toBe(true)
    expect(store.isLabeled('img-1')).toBe(false)
  })

  it('add fills uuid/user/time and appends Chart annotation', () => {
    const user = useUserStore()
    user.trySignIn('alice')
    const store = useAnnotationStore()
    const before = store.annotations.length

    store.add({
      type: AnnotationType.Chart,
      subject: 'img-1',
      value: {
        shape: ShapeType.Rect,
        points: [[0, 0], [0, 1], [1, 1], [1, 0]],
        chart: { marks: [] },
      },
    })

    expect(store.annotations).toHaveLength(before + 1)
    const created = store.annotations.at(-1)!
    expect(created.uuid).toMatch(/^[0-9a-f-]{36}$/i)
    expect(created.user).toEqual(user.user)
    expect(created.time).toEqual(expect.any(String))
    expect(created.subject).toBe('img-1')
    expect(created.type).toBe(AnnotationType.Chart)
  })

  it('update rewrites matching uuid and refreshes user/time', () => {
    const user = useUserStore()
    user.trySignIn('alice')
    const store = useAnnotationStore()
    store.add({
      type: AnnotationType.MultilabelClassification,
      subject: 'img-1',
      value: ['Vis'],
    })
    const created = store.annotations.at(-1)!
    if (created.type !== AnnotationType.MultilabelClassification) {
      throw new Error('expected multilabel annotation')
    }
    user.trySignIn('bob')

    store.update({ ...created, value: ['Vis', 'Confident'] })

    const updated = store.annotations.find((d) => d.uuid === created.uuid)!
    expect(updated.type).toBe(AnnotationType.MultilabelClassification)
    if (updated.type === AnnotationType.MultilabelClassification) {
      expect(updated.value).toEqual(['Vis', 'Confident'])
    }
    expect(updated.user).toEqual(user.user)
  })

  it('remove deletes by uuid and throws for missing uuid', () => {
    const store = useAnnotationStore()
    store.add({
      type: AnnotationType.MultilabelClassification,
      subject: 'img-1',
      value: ['Vis'],
    })
    const uuid = store.annotations.at(-1)!.uuid
    store.remove(uuid)
    expect(store.annotations.find((d) => d.uuid === uuid)).toBeUndefined()
    expect(() => store.remove(uuid)).toThrow(/non-existing annotation/)
  })

  it('removeBulk deletes only listed uuids', () => {
    const store = useAnnotationStore()
    store.add({ type: AnnotationType.MultilabelClassification, subject: 'img-1', value: ['Vis'] })
    store.add({ type: AnnotationType.MultilabelClassification, subject: 'img-2', value: ['Not Vis'] })
    const [a, b] = store.annotations.slice(-2)
    store.removeBulk([a.uuid])
    expect(store.annotations.map((d) => d.uuid)).toContain(b.uuid)
    expect(store.annotations.map((d) => d.uuid)).not.toContain(a.uuid)
  })

  it('isLabeled follows detection shapes or non-empty tags, not StatusType alone', () => {
    const store = useAnnotationStore()
    store.setAnnotations([])
    store.statuses = store.statuses.map((d) => (
      d.uuid === 'img-1' ? { ...d, value: StatusType.Labeled } : d
    ))
    expect(store.isLabeled('img-1')).toBe(false)

    store.add({
      type: AnnotationType.MultilabelClassification,
      subject: 'img-1',
      value: ['Vis'],
    })
    expect(store.isLabeled('img-1')).toBe(true)
    expect(store.statuses.find((d) => d.uuid === 'img-1')?.value).toBe(StatusType.Labeled)

    store.add({
      type: AnnotationType.MultilabelClassification,
      subject: 'img-2',
      value: [],
    })
    expect(store.isLabeled('img-2')).toBe(false)

    store.add({
      type: AnnotationType.Chart,
      subject: 'img-2',
      value: {
        shape: ShapeType.Rect,
        points: [[0, 0], [0, 1], [1, 1], [1, 0]],
        chart: { marks: [] },
      },
    })
    expect(store.isLabeled('img-2')).toBe(true)
    expect(store.isLabeled('missing')).toBe(false)
  })

  it('remove clears labeled status when no labels remain', () => {
    const store = useAnnotationStore()
    store.setAnnotations([])
    store.add({
      type: AnnotationType.MultilabelClassification,
      subject: 'img-1',
      value: ['Confident'],
    })
    const uuid = store.annotations.at(-1)!.uuid
    store.remove(uuid)
    expect(store.isLabeled('img-1')).toBe(false)
    expect(store.statuses.find((d) => d.uuid === 'img-1')?.value).toBe(StatusType.Viewed)
  })

  it('isAnnotationArray accepts well-formed rows and rejects junk', () => {
    expect(isAnnotationArray([{
      type: AnnotationType.Chart,
      uuid: 'a1',
      subject: 's1',
      value: {
        shape: ShapeType.Point,
        points: [[1, 2]],
        chart: { marks: [] },
      },
      user: null,
      time: null,
    }])).toBe(true)
    expect(isAnnotationArray({ nope: true })).toBe(false)
    expect(isAnnotationArray([{ uuid: 'a1' }])).toBe(false)
  })

  it('isAnnotationArray rejects unknown annotation types', () => {
    expect(isAnnotationArray([{
      type: 'Classification',
      uuid: 'a',
      subject: 's',
      value: 'Vis',
      user: null,
      time: null,
    }])).toBe(false)
  })

  it('isAnnotationArray accepts seed annotations.json', () => {
    expect(isAnnotationArray(seedAnnotations)).toBe(true)
  })

  it('parseUploadedAnnotations accepts known subjects and rejects unknown / bad shape / duplicate uuid', () => {
    const known = new Set(['img-1', 'img-2'])
    const ok = parseUploadedAnnotations([
      makeChartAnnotation({ uuid: 'c1', subject: 'img-1' }),
      makeMultilabelAnnotation({ uuid: 'm1', subject: 'img-2', value: ['Vis'] }),
    ], known)
    expect(ok).toEqual({ ok: true, data: expect.any(Array) })
    if (ok.ok) expect(ok.data).toHaveLength(2)

    expect(parseUploadedAnnotations({ nope: true }, known)).toEqual({
      ok: false,
      error: 'Upload failed: file is not an annotations array',
    })
    expect(parseUploadedAnnotations([
      makeChartAnnotation({ uuid: 'c1', subject: 'missing' }),
    ], known)).toEqual({
      ok: false,
      error: 'Upload failed: annotation subject is not in the dataset',
    })
    expect(parseUploadedAnnotations([
      makeChartAnnotation({ uuid: 'dup', subject: 'img-1' }),
      makeMultilabelAnnotation({ uuid: 'dup', subject: 'img-2' }),
    ], known)).toEqual({
      ok: false,
      error: 'Upload failed: duplicate annotation uuid',
    })
  })

  it('parseUploadedAnnotations rejects duplicate multilabel rows for one subject', () => {
    const known = new Set(['img-1'])
    expect(parseUploadedAnnotations([
      makeMultilabelAnnotation({ uuid: 'm1', subject: 'img-1', value: ['Vis'] }),
      makeMultilabelAnnotation({ uuid: 'm2', subject: 'img-1', value: ['Not Vis'] }),
    ], known)).toEqual({
      ok: false,
      error: 'Upload failed: duplicate multilabel annotation for the same subject',
    })
  })

  it('setAnnotations replaces rows and marks subjects with annotations as Labeled', () => {
    const store = useAnnotationStore()
    store.statuses = store.statuses.map((d) => (
      d.uuid === 'img-2' ? { ...d, value: StatusType.Skipped } : d
    ))
    store.selectedAnnotations = [makeChartAnnotation({ uuid: 'old', subject: 'img-1' })]

    store.setAnnotations([
      makeChartAnnotation({ uuid: 'c1', subject: 'img-1' }),
    ])

    expect(store.annotations).toHaveLength(1)
    expect(store.annotations[0]?.uuid).toBe('c1')
    expect(store.statuses).toEqual([
      { uuid: 'img-1', value: StatusType.Labeled },
      { uuid: 'img-2', value: StatusType.New },
    ])
    expect(store.isLabeled('img-1')).toBe(true)
    expect(store.isLabeled('img-2')).toBe(false)
    expect(store.selectedAnnotations).toEqual([])
  })
})
