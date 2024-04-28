<script setup lang="ts">
import { ToolType } from '../stores/toolbar'

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
const emit = defineEmits(['update:value'])

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
      icon-btn
      :title="btn.title"
      :disabled="disabled"
      :class="value === btn.value ? 'selected' : 'opacity-50'"
      @click="emit('update:value', btn.value)"
    >
      <div :class="btn.icon" />
    </button>
  </div>
</template>
