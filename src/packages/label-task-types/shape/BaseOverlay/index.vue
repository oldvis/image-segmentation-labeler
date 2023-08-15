<script lang="ts">
import { computed, defineComponent, ref, toRefs, watch } from 'vue'
import type { Component, PropType } from 'vue'
import { storeToRefs } from 'pinia'
import type Konva from 'konva'
import { useElementSize, useMousePressed } from '@vueuse/core'
import { useAnnotations } from '../composables/annotation'
import { ToolType, useStore as useToolbarStore } from '../stores/toolbar'
import type { VueKonvaLayer } from './TheLayerShapes/types'
import TheLayerShapes from './TheLayerShapes/index.vue'
import useTransform from './useTransform'
import useKeyboard from './useKeyboard'
import { useRecordPoint, useRecordPoints } from './useRecordPoints'
import useTools from './useTools'
import type { DataObject } from '~/stores/annotation'

type VueKonvaStage = Component & { getNode: () => Konva.Stage }

export default defineComponent({
  name: 'BaseOverlay',
  components: { TheLayerShapes },
  props: {
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
  },
  setup(props) {
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
    const selectedAnnotationUuids = computed(() => (
      annotations.value.filter((d) => isSelected(d)).map((d) => d.uuid)
    ))

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
    } = useRecordPoints(stage, computed(() => !pressed.value))
    const clickCreateMode = computed(() => (
      (
        tool.value === ToolType.ClickCreatePoint
        || tool.value === ToolType.ClickCreateRect
        || tool.value === ToolType.ClickCreatePolygon
      )
      && selectedAnnotationUuids.value.length === 0
      && stroke.value !== null
    ))
    const dragCreateMode = computed(() => (
      tool.value === ToolType.DragCreatePolygon
      && selectedAnnotationUuids.value.length === 0
      && stroke.value !== null
    ))
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
    watch(tool, () => points.value = [])
    // When selecting another annotation, clear the points
    watch(selectedAnnotationUuids, (d) => {
      if (d.length !== 0) points.value = []
    })
    // When selecting another stroke category, clear the points
    watch(stroke, () => points.value = [])

    const isLayerShapesListening = computed(() => points.value.length === 0)

    const onClickStage = (e: Konva.KonvaEventObject<MouseEvent> | MouseEvent) => {
      // Note: because of vue-konva's bug, the click event is emitted twice,
      // once as type Konva.KonvaEventObject<MouseEvent> and
      // once as type MouseEvent.
      // Reference: https://github.com/konvajs/vue-konva/issues/182
      if (!('evt' in e)) return
      if (stage.value === undefined) return
      const isTargetStage = e.target === stage.value.getNode()

      // Deselect the previous selected objects.
      if (isTargetStage) select(null)

      // Only count clicking the stage itself as creating points
      // to avoid creating points when trying to select a shape.
      if (
        (isTargetStage || points.value.length >= 1)
        && clickCreateMode.value
      ) recordClickedPoints(e)
    }

    const {
      point: mousePoint,
      record: recordMousePoint,
    } = useRecordPoint(stage)

    const onMouseMoveStage = (e: Konva.KonvaEventObject<MouseEvent> | MouseEvent) => {
      // Note: because of vue-konva's bug, the click event is emitted twice,
      // once as type Konva.KonvaEventObject<MouseEvent> and
      // once as type MouseEvent.
      // Reference: https://github.com/konvajs/vue-konva/issues/182
      if (!('evt' in e)) return
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
      computed(() => (
        stroke.value === null ? null : categoryToColor.value(stroke.value)
      )),
      layerInteraction,
      tool,
      strokeWidth,
    )

    return {
      container,
      ...useElementSize(container),
      stage,
      ...useTransform(container, contentWidth, contentHeight),
      categoryToColor,
      selectedAnnotationUuids,
      annotations,
      update,
      select,
      strokeWidth,
      editable,
      onClickStage,
      onMouseMoveStage,
      layerInteraction,
      isLayerShapesListening,
    }
  },
})
</script>

<template>
  <div
    ref="container"
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
