import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { AnnotationType, StatusType, useStore as useAnnotationStore } from '~/stores/annotation'
import { useStore as useUserStore } from '~/stores/user'

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
      value: { shape: 'Rect', points: [[0, 0], [0, 1], [1, 1], [1, 0]], chart: { marks: [] } },
    })

    expect(store.annotations).toHaveLength(before + 1)
    const created = store.annotations.at(-1)!
    expect(created.uuid).toMatch(/^[0-9a-f-]{36}$/i)
    expect(created.user).toEqual(user.user)
    expect(created.time).toEqual(expect.any(String))
    expect(created.subject).toBe('img-1')
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
    user.trySignIn('bob')

    store.update({ ...created, value: ['Vis', 'Confident'] })

    const updated = store.annotations.find((d) => d.uuid === created.uuid)!
    expect(updated.value).toEqual(['Vis', 'Confident'])
    expect(updated.user?.name).toBe('bob')
    expect(updated.time).toEqual(expect.any(String))
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

  it('isLabeled follows StatusType.Labeled', () => {
    const store = useAnnotationStore()
    store.statuses = store.statuses.map((d) => (
      d.uuid === 'img-1' ? { ...d, value: StatusType.Labeled } : d
    ))
    expect(store.isLabeled('img-1')).toBe(true)
    expect(store.isLabeled('img-2')).toBe(false)
    expect(store.isLabeled('missing')).toBe(false)
  })

  it('categoryToColor is stable for known categories', () => {
    const store = useAnnotationStore()
    const a = store.categoryToColor('Rect')
    const b = store.categoryToColor('Rect')
    expect(a).toBe(b)
    expect(a).toMatch(/^#[0-9a-f]{6}$/i)
  })
})
