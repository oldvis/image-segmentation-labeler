<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'VTagCategories',
  props: {
    value: {
      type: Object as PropType<string[]>,
      required: true,
    },
    categories: {
      type: Array as PropType<string[]>,
      required: true,
    },
    categoryToColor: {
      type: Function as PropType<((category: string) => string)>,
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
  methods: {
    toggleCategory(category: string): void {
      const { value } = this
      const idx = value.findIndex((d) => d === category)
      const newValue: string[] = idx >= 0
        ? [...value.slice(0, idx), ...value.slice(idx + 1)]
        : [...value, category]
      this.$emit('update:value', newValue)
    },
    isSelected(category: string): boolean {
      return this.value.includes(category)
    },
  },
})
</script>

<template>
  <div class="flex gap-1">
    <button
      v-for="d in categories"
      :key="d"
      icon-btn
      class="flex border rounded items-center px-1 gap-1"
      :class="isSelected(d) ? 'selected' : ''"
      @click="toggleCategory(d)"
    >
      <div
        class="i-fa6-solid:square"
        :style="{ color: categoryToColor(d) }"
      />
      {{ d }}
    </button>
  </div>
</template>
