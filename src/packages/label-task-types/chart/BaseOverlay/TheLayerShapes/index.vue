<script lang="ts">
import { defineComponent, onMounted, ref, toRefs, watch } from 'vue'
import type { PropType } from 'vue'
import type { AnnotationChart } from '../../types'
import type { VueKonvaLayer } from '../../../shape/BaseOverlay/TheLayerShapes/types'
import useKonvaShape from './useKonvaShape'
import type { Annotation } from '~/stores/annotation'

export default defineComponent({
  name: 'TheLayerShapes',
  props: {
    annotations: {
      type: Array as PropType<AnnotationChart[]>,
      default: () => [],
    },
    selectedAnnotationUuids: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    categoriesToColor: {
      type: Function as PropType<(categories: string[]) => string>,
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
      annotations,
      categoriesToColor,
      editable,
      selectedAnnotationUuids,
      strokeWidth,
    } = toRefs(props)
    const layer = ref<VueKonvaLayer>()
    const { redrawShapes, drawEditHandle, moveToTop } = useKonvaShape(
      layer,
      annotations,
      categoriesToColor,
      editable,
      (d: Annotation) => emit('editAnnotation', d),
      (d: Annotation) => emit('selectAnnotation', d),
      strokeWidth,
    )

    onMounted(() => {
      redrawShapes()
      drawEditHandle(selectedAnnotationUuids.value)
    })
    watch(annotations, () => {
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
