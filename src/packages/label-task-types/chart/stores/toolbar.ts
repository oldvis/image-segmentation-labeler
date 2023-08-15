import { acceptHMRUpdate, defineStore } from 'pinia'

export enum ToolType {
  ClickCreatePolygon = 'ClickCreatePolygon',
  ClickCreateRect = 'ClickCreateRect',
  ClickCreatePoint = 'ClickCreatePoint',
  DragCreatePolygon = 'DragCreatePolygon',
}

/** The store of toolbar state. */
export const useStore = defineStore('toolbar-chart', {
  state: () => ({
    /** The categories associated with the stroke */
    stroke: [] as string[],
    tool: ToolType.ClickCreateRect as ToolType,
  }),
  actions: {
    setStroke(categories: string[]): void {
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
