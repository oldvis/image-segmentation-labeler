<script setup lang="ts">
import type Konva from 'konva'
import type { VueKonvaLayer } from './TheLayerShapes/types'
import type { DataObject } from '~/stores/annotation'
import { useElementSize, useMousePressed } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useAnnotations } from '../composables/annotation'
import { ToolType, useStore as useToolbarStore } from '../stores/toolbar'
import TheLayerShapes from './TheLayerShapes/index.vue'
import useKeyboard from './useKeyboard'
import { useRecordPoint, useRecordPoints } from './useRecordPoints'
import useTools from './useTools'
import useTransform from './useTransform'

type VueKonvaStage = Component & { getNode: () => Konva.Stage }

const props = defineProps({
  dataObject: {
    type: Object as PropType<DataObject>,
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
  categoryToColor,
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
  && stroke.value !== null,
)

const dragCreateMode = computed(() =>
  tool.value === ToolType.DragCreatePolygon
  && selectedAnnotationUuids.value.length === 0
  && stroke.value !== null,
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

const onClickStage = (e: Konva.KonvaEventObject<MouseEvent>) => {
  if (stage.value === undefined) return
  const isTargetStage = e.target === stage.value.getNode()

  // Deselect the previous selected objects.
  if (isTargetStage) select(null)

  // Only count clicking the stage itself as creating points
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
  computed(() => (stroke.value === null ? null : categoryToColor.value(stroke.value))),
  layerInteraction,
  tool,
  strokeWidth,
)

const { width, height } = useElementSize(container)
const { scale, position } = useTransform(container, contentWidth, contentHeight)
</script>

<template>
  <div ref="container" class="border border-gray-200">
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
      @click="onClickStage"
      @mousemove="onMouseMoveStage"
    >
      <v-layer
        ref="layerInteraction"
        :config="{ imageSmoothingEnabled: false }"
        style="image-rendering: pixelated"
      />
      <TheLayerShapes
        :annotations="annotations"
        :selected-annotation-uuids="selectedAnnotationUuids"
        :category-to-color="categoryToColor"
        :listening="isLayerShapesListening"
        :editable="editable"
        :stroke-width="strokeWidth"
        @edit-annotation="update"
        @select-annotation="select"
      />
    </v-stage>
  </div>
</template>
