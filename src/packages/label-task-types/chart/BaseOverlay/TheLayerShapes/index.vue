<script setup lang="ts">
import type { PropType } from 'vue'
import type { VueKonvaLayer } from '../../../shape/BaseOverlay/TheLayerShapes/types'
import type { AnnotationChart } from '../../types'
import type { Annotation } from '~/stores/annotation'
import { onMounted, ref, toRefs, watch } from 'vue'
import useKonvaShape from './useKonvaShape'

const props = defineProps({
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
})

const emit = defineEmits<{
  (e: 'editAnnotation', annotation: Annotation): void
  (e: 'selectAnnotation', annotation: Annotation): void
}>()

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
