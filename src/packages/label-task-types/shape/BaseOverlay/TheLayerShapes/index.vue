<script lang="ts">
import type { PropType } from 'vue'
import type { AnnotationShape } from '../../types'
import type { VueKonvaLayer } from './types'
import type { Annotation } from '~/stores/annotation'
import { defineComponent, onMounted, ref, toRefs, watch } from 'vue'
import useKonvaShape from './useKonvaShape'

export default defineComponent({
  name: 'TheLayerShapes',
  props: {
    shapes: {
      type: Array as PropType<AnnotationShape[]>,
      default: () => [],
    },
    selectedAnnotationUuids: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    categoryToColor: {
      type: Function as PropType<(category: string) => string>,
      required: true,
    },
    listening: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    editable: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    strokeWidth: {
      type: Number as PropType<number>,
      default: 5,
    },
  },
  emits: {
    editAnnotation: null,
    selectAnnotation: null,
  },
  setup(props, { emit }) {
    const {
      shapes,
      categoryToColor,
      editable,
      selectedAnnotationUuids,
      strokeWidth,
    } = toRefs(props)
    const layer = ref<VueKonvaLayer>()
    const { redrawShapes, drawEditHandle, moveToTop } = useKonvaShape(
      layer,
      shapes,
      categoryToColor,
      editable,
      (d: Annotation) => emit('editAnnotation', d),
      (d: Annotation) => emit('selectAnnotation', d),
      strokeWidth,
    )

    onMounted(() => {
      redrawShapes()
      drawEditHandle(selectedAnnotationUuids.value)
    })
    watch(shapes, () => {
      // TODO: avoid redrawing everything to accelerate
      redrawShapes()
      drawEditHandle(selectedAnnotationUuids.value)
    })
    watch(editable, () => {
      redrawShapes()
    })
    watch(selectedAnnotationUuids, () => {
      const uuids = selectedAnnotationUuids.value
      uuids.forEach((d) => moveToTop(d))
      drawEditHandle(uuids)
    })

    return { layer }
  },
})
</script>

<template>
  <v-layer
    ref="layer"
    :config="{
      listening,
      imageSmoothingEnabled: false,
    }"
    style="image-rendering: pixelated"
  />
</template>
