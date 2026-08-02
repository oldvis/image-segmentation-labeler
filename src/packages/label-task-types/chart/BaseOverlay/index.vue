<script setup lang="ts">
import type Konva from 'konva'
import type { Component, PropType } from 'vue'
import type { ImageDataObject } from '~/stores/annotation'
import { useElementSize, useMousePressed } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import useKeyboard from '../../shape/BaseOverlay/useKeyboard'
import { useRecordPoint, useRecordPoints } from '../../shape/BaseOverlay/useRecordPoints'
import useTransform from '../../shape/BaseOverlay/useTransform'
import { useAnnotations } from '../composables/annotation'
import { ToolType, useStore as useToolbarStore } from '../stores/toolbar'
import TheLayerShapes from './TheLayerShapes/index.vue'
import useTools from './useTools'

type VueKonvaLayer = Component & { getNode: () => Konva.Layer }
type VueKonvaStage = Component & { getNode: () => Konva.Stage }

const props = defineProps({
  dataObject: {
    type: Object as PropType<ImageDataObject>,
    required: true,
  },
  /**
   * The original width of the content.
   * Transformation is needed to fit it into the canvas.
   */
  contentWidth: {
    type: Number as PropType<number | null>,
    default: null,
  },
  /**
   * The original height of the content.
   * Transformation is needed to fit it into the canvas.
   */
  contentHeight: {
    type: Number as PropType<number | null>,
    default: null,
  },
})

const {
  annotations,
  categoriesToColor,
  isSelected,
  select,
  add,
  update,
  removeBulk,
} = useAnnotations()
const strokeWidth = 5

const container = ref<HTMLDivElement>()
const { dataObject, contentWidth, contentHeight } = toRefs(props)
const selectedAnnotationUuids = computed(() =>
  annotations.value.filter((d) => isSelected(d)).map((d) => d.uuid),
)

useKeyboard(
  annotations,
  selectedAnnotationUuids,
  add,
  select,
  removeBulk,
)

const toolbarStore = useToolbarStore()
const { tool, stroke } = storeToRefs(toolbarStore)
const editable = true

const stage = ref<VueKonvaStage>()
const {
  points: clickedPoints,
  record: recordClickedPoints,
} = useRecordPoints(stage)
const { pressed } = useMousePressed()
// Freeze the recording when mouse is not pressed.
const {
  points: draggedPoints,
  record: recordDraggedPoints,
} = useRecordPoints(
  stage,
  computed(() => !pressed.value),
)
const clickCreateMode = computed(() =>
  (
    tool.value === ToolType.ClickCreatePoint
    || tool.value === ToolType.ClickCreateRect
    || tool.value === ToolType.ClickCreatePolygon
  )
  && selectedAnnotationUuids.value.length === 0
  && stroke.value.length !== 0,
)
const dragCreateMode = computed(() =>
  tool.value === ToolType.DragCreatePolygon
  && selectedAnnotationUuids.value.length === 0
  && stroke.value.length !== 0,
)
const points = computed({
  get: () => {
    if (clickCreateMode.value) return clickedPoints.value
    if (dragCreateMode.value) return draggedPoints.value
    return []
  },
  set: (v) => {
    if (clickCreateMode.value) clickedPoints.value = v
    if (dragCreateMode.value) draggedPoints.value = v
  },
})

// When switching to another tool, clear the points
watch(tool, () => (points.value = []))
// When selecting another annotation, clear the points
watch(selectedAnnotationUuids, (d) => {
  if (d.length !== 0) points.value = []
})
// When selecting another stroke category, clear the points
watch(stroke, () => (points.value = []))

const isLayerShapesListening = computed(() => points.value.length === 0)

/**
 * Record create-tool points on mousedown (not `@click`).
 *
 * Why not click: Konva only fires `click` when mousedown and mouseup hit the
 * same shape *instance*. After the first corner, the rubber-band preview on
 * `layerInteraction` sits under the cursor and is destroy/recreate'd on every
 * mousemove, so the second corner often never got a `click`. Mousedown commits
 * the point on press and does not depend on that pairing.
 *
 * Also keep `layerInteraction` / preview nodes at `listening: false` so the
 * preview never becomes the hit target (defense in depth).
 */
const onMouseDownStage = (e: Konva.KonvaEventObject<MouseEvent>) => {
  if (stage.value === undefined) return
  const isTargetStage = e.target === stage.value.getNode()

  // Deselect the previous selected objects.
  if (isTargetStage) select(null)

  // Only count pressing the stage itself as creating points
  // to avoid creating points when trying to select a shape.
  if (
    (isTargetStage || points.value.length >= 1)
    && clickCreateMode.value
  ) {
    recordClickedPoints(e)
  }
}

const {
  point: mousePoint,
  record: recordMousePoint,
} = useRecordPoint(stage)

const onMouseMoveStage = (e: Konva.KonvaEventObject<MouseEvent>) => {
  if (stage.value === undefined) return

  recordMousePoint(e)
  if (dragCreateMode.value) recordDraggedPoints(e)
}

const layerInteraction = ref<VueKonvaLayer>()
useTools(
  points,
  stroke,
  dataObject,
  add,
  mousePoint,
  computed(() => categoriesToColor.value(stroke.value)),
  layerInteraction,
  tool,
  strokeWidth,
)

const { width, height } = useElementSize(container)
const { scale, position } = useTransform(container, contentWidth, contentHeight)
</script>

<template>
  <div
    ref="container"
    data-testid="chart-stage"
    class="border border-gray-200"
  >
    <!-- Set position absolute to allow container to have responsive resize
      (when a suitable style is set, e.g., flex layout),
      instead of having to be the same size as the stage. -->
    <v-stage
      ref="stage"
      :config="{
        width,
        height,
        scale,
        position,
      }"
      style="position: absolute"
      :style="selectedAnnotationUuids.length === 0 ? 'cursor: crosshair' : ''"
      @mousedown="onMouseDownStage"
      @mousemove="onMouseMoveStage"
    >
      <!--
        Rubber-band previews only. listening:false so they never steal hits from
        the stage (preview nodes are rebuilt on mousemove; if they listened,
        Konva click pairing would drop the next create corner.
      -->
      <v-layer
        ref="layerInteraction"
        :config="{ imageSmoothingEnabled: false, listening: false }"
        style="image-rendering: pixelated"
      />
      <TheLayerShapes
        :annotations="annotations"
        :selected-annotation-uuids="selectedAnnotationUuids"
        :categories-to-color="categoriesToColor"
        :listening="isLayerShapesListening"
        :editable="editable"
        :stroke-width="strokeWidth"
        @edit-annotation="update"
        @select-annotation="select"
      />
    </v-stage>
  </div>
</template>
