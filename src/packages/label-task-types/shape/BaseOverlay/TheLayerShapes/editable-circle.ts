import type { IEditableShape } from './types'
import Konva from 'konva'

export interface IEditableCircle extends IEditableShape {
  /** Get/Set circle center point. */
  point: (() => { x: number, y: number }) & ((value: { x: number, y: number }) => this)

  /** Get/Set whether the circle is editable. */
  editable: (() => boolean) & ((value: boolean) => this)

  /** Set the circle to be in the editing state. */
  startEdit: () => void

  /** Set the circle to be not in the editing state. */
  endEdit: () => void

  /** Get the circle object. */
  getNode: () => Konva.Circle

  /** Set the callback when the circle position is updated. */
  setOnUpdatePosition: (value: (d: IEditableCircle) => void) => this

  /** Set the callback when the circle is clicked. */
  setOnClick: (value: (d: IEditableCircle) => void) => this
}

export default class EditableCircle implements IEditableCircle {
  /** The state of whether the circle is editable. */
  #editable: boolean

  /** The stroke width. */
  #strokeWidth: number

  /** The circle. */
  #circle: Konva.Circle

  /** The callback when the circle position is updated. */
  #onUpdatePoint: ((d: EditableCircle) => void) | null = null

  /** The callback when the circle is clicked. */
  #onClick: ((d: EditableCircle) => void) | null = null

  startEdit(): void {
    const circle = this.#circle

    circle.fill('rgba(0,0,0,0.5)')
    circle.draggable(true)
  }

  endEdit(): void {
    const circle = this.#circle

    circle.fill('')
    circle.draggable(false)
  }

  private enableEdit(): void {
    const circle = this.#circle

    circle.on('mousedown', () => {
      this.startEdit()
      if (this.#onClick !== null) {
        this.#onClick(this)
      }
    })
    circle.on('mouseover', () => {
      circle.strokeWidth(this.#strokeWidth * 2)
    })
    circle.on('mouseout', () => {
      circle.strokeWidth(this.#strokeWidth)
    })
  }

  private disableEdit(): void {
    const circle = this.#circle

    this.endEdit()
    circle.off('click')
    circle.off('mouseover')
    circle.off('mouseout')
    circle.draggable(false)
  }

  point(): { x: number, y: number }

  point(value: { x: number, y: number }): this

  point(value?: { x: number, y: number }): { x: number, y: number } | this {
    const circle = this.#circle
    if (value === undefined) {
      return { x: circle.x(), y: circle.y() }
    }
    const { x, y } = value
    circle.x(x).y(y)
    return this
  }

  editable(): boolean

  editable(value: boolean): this

  editable(value?: boolean): boolean | this {
    if (value === undefined) return this.#editable

    if (value !== this.#editable) {
      if (value === true) {
        this.enableEdit()
      }
      else {
        this.disableEdit()
      }
    }

    this.#editable = value
    return this
  }

  getNode(): Konva.Circle {
    return this.#circle
  }

  setOnUpdatePosition(value: (d: EditableCircle) => void): this {
    this.#onUpdatePoint = value
    return this
  }

  setOnClick(value: (d: EditableCircle) => void): this {
    this.#onClick = value
    return this
  }

  constructor(
    point: { x: number, y: number },
    editable = true,
    strokeWidth = 1,
  ) {
    this.#editable = editable
    this.#strokeWidth = strokeWidth

    const circle = new Konva.Circle({
      x: point.x,
      y: point.y,
      radius: strokeWidth * 2,
      stroke: 'black',
      strokeWidth,
      opacity: 1,
    })
    circle.on('dragend', () => {
      circle.x(Math.floor(circle.x()))
      circle.y(Math.floor(circle.y()))

      if (this.#onUpdatePoint !== null) {
        this.#onUpdatePoint(this)
      }
    })

    this.#circle = circle

    if (editable) {
      this.enableEdit()
    }
  }
}
