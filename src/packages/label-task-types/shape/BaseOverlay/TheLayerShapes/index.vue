<script setup lang="ts">
import type { AnnotationShape } from '../../types'
import type { VueKonvaLayer } from './types'
import type { Annotation } from '~/stores/annotation'
import useKonvaShape from './useKonvaShape'

const props = defineProps({
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
})

const emit = defineEmits<{
  (e: 'editAnnotation', annotation: Annotation): void
  (e: 'selectAnnotation', annotation: Annotation): void
}>()

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
