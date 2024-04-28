import Konva from 'konva'
import type { IEditableShape } from './types'

interface BBox {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

const getBBox = (points: [number, number][]): BBox => {
  const xMin = Math.min(...points.map((d) => d[0]))
  const xMax = Math.max(...points.map((d) => d[0]))
  const yMin = Math.min(...points.map((d) => d[1]))
  const yMax = Math.max(...points.map((d) => d[1]))
  return { xMin, xMax, yMin, yMax }
}

export interface IEditableRect extends IEditableShape {
  /** Get/Set rect contour points. */
  points: (() => [number, number][]) & ((value: [number, number][]) => this)

  /** Get/Set whether the rect is editable. */
  editable: (() => boolean) & ((value: boolean) => this)

  /** Set the rect to be in the editing state. */
  startEdit: () => void

  /** Set the rect to be not in the editing state. */
  endEdit: () => void

  /** Get the group object. */
  getNode: () => Konva.Group

  /** Get the rect object. */
  getRect: () => Konva.Rect

  /** Get the anchor objects. */
  getAnchors: () => Record<string, Konva.Circle>

  /** Set the callback when the rect position is updated. */
  setOnUpdatePosition: (value: (d: IEditableRect) => void) => this

  /** Set the callback when the rect is clicked. */
  setOnClick: (value: (d: IEditableRect) => void) => this
}

enum ControlPointType {
  TopLeft = 'TopLeft',
  TopMiddle = 'TopMiddle',
  TopRight = 'TopRight',
  MiddleLeft = 'MiddleLeft',
  MiddleRight = 'MiddleRight',
  BottomLeft = 'BottomLeft',
  BottomMiddle = 'BottomMiddle',
  BottomRight = 'BottomRight',
}

export default class EditableRect implements IEditableRect {
  /** The state of whether the rect is editable. */
  #editable: boolean

  /** The stroke width. */
  #strokeWidth: number

  /** The group containing the rect and anchors. */
  #group: Konva.Group

  /** The rect. */
  #rect: Konva.Rect

  /** The anchors of rect control points. */
  #anchors: Record<string, Konva.Circle>

  /** The callback when the rect position is updated. */
  #onUpdatePoints: ((d: EditableRect) => void) | null = null

  /** The callback when the rect is clicked. */
  #onClick: ((d: EditableRect) => void) | null = null

  /** Redraw the polygon and anchors with the position update of an anchor. */
  private onDragRedraw(anchor: Konva.Circle, controlPointType: ControlPointType): void {
    const rect = this.#rect
    const anchors = this.#anchors

    let topY = anchors[ControlPointType.TopLeft].y()
    let bottomY = anchors[ControlPointType.BottomRight].y()
    let leftX = anchors[ControlPointType.TopLeft].x()
    let rightX = anchors[ControlPointType.BottomRight].x()
    if (controlPointType === ControlPointType.TopLeft) {
      topY = anchor.y()
      leftX = anchor.x()
    }
    else if (controlPointType === ControlPointType.TopMiddle) {
      topY = anchor.y()
    }
    else if (controlPointType === ControlPointType.TopRight) {
      topY = anchor.y()
      rightX = anchor.x()
    }
    else if (controlPointType === ControlPointType.MiddleLeft) {
      leftX = anchor.x()
    }
    else if (controlPointType === ControlPointType.MiddleRight) {
      rightX = anchor.x()
    }
    else if (controlPointType === ControlPointType.BottomLeft) {
      bottomY = anchor.y()
      leftX = anchor.x()
    }
    else if (controlPointType === ControlPointType.BottomMiddle) {
      bottomY = anchor.y()
    }
    else if (controlPointType === ControlPointType.BottomRight) {
      bottomY = anchor.y()
      rightX = anchor.x()
    }
    anchors[ControlPointType.TopLeft].x(leftX).y(topY)
    anchors[ControlPointType.TopMiddle].x((leftX + rightX) / 2).y(topY)
    anchors[ControlPointType.TopRight].x(rightX).y(topY)
    anchors[ControlPointType.MiddleLeft].x(leftX).y((topY + bottomY) / 2)
    anchors[ControlPointType.MiddleRight].x(rightX).y((topY + bottomY) / 2)
    anchors[ControlPointType.BottomLeft].x(leftX).y(bottomY)
    anchors[ControlPointType.BottomMiddle].x((leftX + rightX) / 2).y(bottomY)
    anchors[ControlPointType.BottomRight].x(rightX).y(bottomY)

    const xMin = Math.min(leftX, rightX)
    const xMax = Math.max(leftX, rightX)
    const yMin = Math.min(topY, bottomY)
    const yMax = Math.max(topY, bottomY)
    const width = xMax - xMin
    const height = yMax - yMin
    rect.x(xMin).y(yMin).width(width).height(height)
  }

  private showAnchors(): this {
    const anchors = Object.values(this.#anchors)
    anchors.forEach((anchor) => anchor.visible(true))
    return this
  }

  private hideAnchors(): this {
    const anchors = Object.values(this.#anchors)
    anchors.forEach((anchor) => anchor.visible(false))
    return this
  }

  private buildAnchor(
    x: number,
    y: number,
    controlPointType: ControlPointType,
  ): Konva.Circle {
    const anchor = new Konva.Circle({
      x,
      y,
      radius: this.#strokeWidth * 2,
      stroke: '#666',
      fill: '#ddd',
      strokeWidth: this.#strokeWidth / 2,
      draggable: true,
    })
    anchor.on('mouseover', () => {
      anchor.strokeWidth(this.#strokeWidth)
    })
    anchor.on('mouseout', () => {
      anchor.strokeWidth(this.#strokeWidth / 2)
    })

    anchor.on('dragmove', () => {
      this.onDragRedraw(anchor, controlPointType)
    })
    anchor.on('dragend', () => {
      anchor.x(Math.floor(anchor.x()))
      anchor.y(Math.floor(anchor.y()))
      this.onDragRedraw(anchor, controlPointType)
      if (this.#onUpdatePoints !== null) {
        this.#onUpdatePoints(this)
      }
    })
    return anchor
  }

  private buildAnchors(
    bbox: BBox,
  ): Record<ControlPointType, Konva.Circle> {
    const { xMin, xMax, yMin, yMax } = bbox
    const anchors: Record<ControlPointType, Konva.Circle> = {
      [ControlPointType.TopLeft]: this.buildAnchor(
        xMin,
        yMin,
        ControlPointType.TopLeft,
      ),
      [ControlPointType.TopMiddle]: this.buildAnchor(
        (xMin + xMax) / 2,
        yMin,
        ControlPointType.TopMiddle,
      ),
      [ControlPointType.TopRight]: this.buildAnchor(
        xMax,
        yMin,
        ControlPointType.TopRight,
      ),
      [ControlPointType.MiddleLeft]: this.buildAnchor(
        xMin,
        (yMin + yMax) / 2,
        ControlPointType.MiddleLeft,
      ),
      [ControlPointType.MiddleRight]: this.buildAnchor(
        xMax,
        (yMin + yMax) / 2,
        ControlPointType.MiddleRight,
      ),
      [ControlPointType.BottomLeft]: this.buildAnchor(
        xMin,
        yMax,
        ControlPointType.BottomLeft,
      ),
      [ControlPointType.BottomMiddle]: this.buildAnchor(
        (xMin + xMax) / 2,
        yMax,
        ControlPointType.BottomMiddle,
      ),
      [ControlPointType.BottomRight]: this.buildAnchor(
        xMax,
        yMax,
        ControlPointType.BottomRight,
      ),
    }
    return anchors
  }

  private buildGroup(): Konva.Group {
    const group = new Konva.Group({ draggable: false })
    group.on('dragend', () => {
      const rect = this.#rect
      const anchors = this.#anchors
      const dx = Math.round(group.x())
      const dy = Math.round(group.y())
      rect.x(rect.x() + dx)
        .y(rect.y() + dy)
      Object.values(anchors).forEach((d) => {
        d.x(d.x() + dx)
        d.y(d.y() + dy)
      })
      group.x(0).y(0)

      if (this.#onUpdatePoints !== null) {
        this.#onUpdatePoints(this)
      }
    })
    return group
  }

  startEdit(): void {
    this.#rect.fill('rgba(0,0,0,0.5)')
    this.#group.draggable(true)
    this.showAnchors()
  }

  endEdit(): void {
    this.#rect.fill('')
    this.#group.draggable(false)
    this.hideAnchors()
  }

  private enableEdit(): void {
    this.#group.on('mousedown', () => {
      this.startEdit()
      if (this.#onClick !== null) {
        this.#onClick(this)
      }
    })
  }

  private disableEdit(): void {
    const group = this.#group
    this.endEdit()
    group.off('click')
    group.draggable(false)
  }

  points(): [[number, number], [number, number]]

  points(value: [number, number][]): this

  points(value?: [number, number][]): [[number, number], [number, number]] | this {
    const rect = this.#rect
    const anchors = this.#anchors
    if (value === undefined) {
      const x = rect.x()
      const y = rect.y()
      const width = rect.width()
      const height = rect.height()
      return [
        [x, y],
        [x + width, y + height],
      ]
    }

    const { xMin, xMax, yMin, yMax } = getBBox(value)
    const width = xMax - xMin
    const height = yMax - yMin

    anchors[ControlPointType.TopLeft].x(xMin).y(yMin)
    anchors[ControlPointType.TopMiddle].x((xMin + xMax) / 2).y(yMin)
    anchors[ControlPointType.TopRight].x(xMax).y(yMin)
    anchors[ControlPointType.MiddleLeft].x(xMin).y((yMin + yMax) / 2)
    anchors[ControlPointType.MiddleRight].x(xMax).y((yMin + yMax) / 2)
    anchors[ControlPointType.BottomLeft].x(xMin).y(yMax)
    anchors[ControlPointType.BottomMiddle].x((xMin + xMax) / 2).y(yMax)
    anchors[ControlPointType.BottomRight].x(xMax).y(yMax)

    rect.x(xMin).y(yMin).width(width).height(height)
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

  getNode(): Konva.Group {
    return this.#group
  }

  getRect(): Konva.Rect {
    return this.#rect
  }

  getAnchors(): Record<string, Konva.Circle> {
    return this.#anchors
  }

  setOnUpdatePosition(value: (d: EditableRect) => void): this {
    this.#onUpdatePoints = value
    return this
  }

  setOnClick(value: (d: EditableRect) => void): this {
    this.#onClick = value
    return this
  }

  constructor(
    points: [number, number][],
    editable = true,
    strokeWidth = 1,
  ) {
    this.#editable = editable
    this.#strokeWidth = strokeWidth

    const { xMin, xMax, yMin, yMax } = getBBox(points)
    const width = xMax - xMin
    const height = yMax - yMin

    const anchors = this.buildAnchors({ xMin, xMax, yMin, yMax })
    const rect = new Konva.Rect({
      x: xMin,
      y: yMin,
      width,
      height,
      stroke: 'black',
      strokeWidth,
      opacity: 1,
    })
    const group = this.buildGroup()
    group.add(rect, ...Object.values(anchors))

    this.#group = group
    this.#rect = rect
    this.#anchors = anchors

    this.hideAnchors()
    if (editable) {
      this.enableEdit()
    }
  }
}
