import type { MarkType } from '../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ToolType } from '../../shape/types'

export { ToolType }

/** The store of toolbar state. */
export const useStore = defineStore('toolbar-chart', {
  state: () => ({
    /** The mark categories associated with the stroke */
    stroke: [] as MarkType[],
    tool: ToolType.ClickCreateRect,
  }),
  actions: {
    setStroke(categories: MarkType[]): void {
      this.stroke = categories
    },
    setOperation(tool: ToolType): void {
      this.tool = tool
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}
