<script setup lang="ts">
import { ToolType } from '../types'

defineProps({
  value: {
    type: String as PropType<ToolType>,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits<{
  (e: 'update:value', value: ToolType): void
}>()

const btns = [
  {
    title: 'bounding polygon',
    icon: 'i-mdi:vector-polygon-variant',
    value: ToolType.ClickCreatePolygon,
  },
  {
    title: 'bounding box',
    icon: 'i-mdi:vector-square',
    value: ToolType.ClickCreateRect,
  },
  {
    title: 'critical point',
    icon: 'i-mdi:vector-circle-variant',
    value: ToolType.ClickCreatePoint,
  },
  {
    title: 'free-form contour',
    icon: 'i-fa6-solid:pen',
    value: ToolType.DragCreatePolygon,
  },
]
</script>

<template>
  <div class="flex gap-1">
    <button
      v-for="btn in btns"
      :key="btn.value"
      type="button"
      :data-testid="`tool-${btn.value}`"
      :title="btn.title"
      :aria-label="btn.title"
      :aria-pressed="value === btn.value ? 'true' : 'false'"
      :disabled="disabled"
      :class="value === btn.value ? 'tool-btn-active' : 'tool-btn opacity-60'"
      @click="emit('update:value', btn.value)"
    >
      <div :class="btn.icon" />
    </button>
  </div>
</template>
