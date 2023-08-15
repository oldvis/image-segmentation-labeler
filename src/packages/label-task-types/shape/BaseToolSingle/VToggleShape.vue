<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { ToolType } from '../stores/toolbar'

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

export default defineComponent({
  name: 'VToggleShape',
  props: {
    value: {
      type: String as PropType<ToolType>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'update:value': null,
  },
  data() {
    return { btns }
  },
})
</script>

<template>
  <div class="flex gap-1" role="group">
    <button
      v-for="btn in btns"
      :key="btn.value"
      :title="btn.title"
      :disabled="disabled"
      class="icon-btn"
      :class="value === btn.value ? 'selected' : 'opacity-50'"
      @click="$emit('update:value', btn.value)"
    >
      <div :class="btn.icon" />
    </button>
  </div>
</template>
