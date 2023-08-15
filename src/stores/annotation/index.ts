import { acceptHMRUpdate, defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { scaleOrdinal, schemeCategory10 } from 'd3'
import { useStore as useUserStore } from '../user'
import { StatusType } from './types'
import type { Annotation, DataObject, Status } from './types'
import { categories } from './categories'
import rawDataObjects from '~/data/data-objects.json'
import annotations from '~/data/annotations.json'

export * from './types'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

const dataObjects: DataObject[] = rawDataObjects.map((d) => (
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
    selectedDataObjects: [] as DataObject[],
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
    add(partial: Optional<Annotation, 'uuid' | 'user' | 'time'>) {
      const userStore = useUserStore()
      const annotation: Annotation = {
        // Create uuid if not provided in partial.
        uuid: uuidv4(),
        ...partial,
        user: userStore.user,
        time: new Date().toISOString(),
      }
      this.annotations.push(annotation)
    },
    /** Update an annotation. */
    update(updated: Annotation): void {
      const index = this.annotations.findIndex((d) => (d.uuid === updated.uuid))
      const userStore = useUserStore()
      this.annotations[index] = {
        ...updated,
        user: userStore.user,
        time: new Date().toISOString(),
      }
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
  },
  persist: true,
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}
