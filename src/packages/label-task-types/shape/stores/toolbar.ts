import { acceptHMRUpdate, defineStore } from 'pinia'

export enum ToolType {
  ClickCreatePolygon = 'ClickCreatePolygon',
  ClickCreateRect = 'ClickCreateRect',
  ClickCreatePoint = 'ClickCreatePoint',
  DragCreatePolygon = 'DragCreatePolygon',
}

/** The store of toolbar state. */
export const useStore = defineStore('toolbar-shape', {
  state: () => ({
    stroke: null as string | null,
    tool: ToolType.ClickCreateRect as ToolType,
  }),
  actions: {
    setStroke(category: string): void {
      this.stroke = category
    },
    setOperation(tool: ToolType): void {
      this.tool = tool
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}
