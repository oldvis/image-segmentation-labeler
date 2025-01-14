import type { MaybeRef } from '@vueuse/core'
import type Konva from 'konva'
import type { Component, Ref } from 'vue'
import { ref, unref } from 'vue'

type VueKonvaStage = Component & { getNode: () => Konva.Stage }
type Point = [number, number]

const getNode = (d: VueKonvaStage): Konva.Stage | undefined => (
  d.getNode() ?? undefined
)

const xyOffsetToStage = (
  stage: VueKonvaStage,
  x: number,
  y: number,
): { x: number, y: number } => {
  // transform the position from unscaled mouse position (offsetX, offsetY)
  // to the position in the scaled coordinate of the canvas
  const node = getNode(stage)
  if (node === undefined) return { x, y }
  const xScaled = (x - node.x()) / node.scaleX()
  const yScaled = (y - node.y()) / node.scaleY()
  return { x: xScaled, y: yScaled }
}

/**
 * @param stage The Konva stage on which mouse points are recorded.
 * @param freeze Whether to freeze the recording.
 */
export const useRecordPoints = (
  stage: Ref<VueKonvaStage | undefined>,
  freeze: MaybeRef<boolean> = false,
) => {
  const points: Ref<Point[]> = ref([])

  /** Record the mouse position given the event. */
  const record = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (stage.value === undefined || unref(freeze)) return

    const { offsetX, offsetY } = e.evt
    const { x, y } = xyOffsetToStage(stage.value, offsetX, offsetY)
    points.value = [...points.value, [x, y]]
  }
  return { points, record }
}

/**
 * @param stage The Konva stage on which mouse position is recorded.
 * @param freeze Whether to freeze the recording.
 */
export const useRecordPoint = (
  stage: Ref<VueKonvaStage | undefined>,
  freeze: MaybeRef<boolean> = false,
) => {
  const point: Ref<Point | null> = ref(null)

  /** Record the mouse position given the event. */
  const record = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (stage.value === undefined || unref(freeze)) return

    const { offsetX, offsetY } = e.evt
    const { x, y } = xyOffsetToStage(stage.value, offsetX, offsetY)
    point.value = [x, y]
  }
  return { point, record }
}
