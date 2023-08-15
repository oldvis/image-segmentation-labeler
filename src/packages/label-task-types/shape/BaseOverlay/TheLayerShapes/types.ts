import type Konva from 'konva'
import type { Component } from 'vue'

export type VueKonvaLayer = Component & { getNode: () => Konva.Layer }

export interface IEditableShape {
  /** Get whether the circle is editable. */
  editable(): boolean
  /** Set whether the circle is editable. */
  editable(value: boolean): this

  /** Get the shape node. */
  getNode(): Konva.Node

  /** Set the circle to be in the editing state. */
  startEdit(): void

  /** Set the circle to be not in the editing state. */
  endEdit(): void

  /** Set the callback when the circle position is updated. */
  setOnUpdatePosition(value: (d: IEditableShape) => void): this

  /** Set the callback when the circle is clicked. */
  setOnClick(value: (d: IEditableShape) => void): this
}
