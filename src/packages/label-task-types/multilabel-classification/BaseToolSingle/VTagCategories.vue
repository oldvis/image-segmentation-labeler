<script setup lang="ts">
import { categoryTip } from '~/stores/annotation/categoryTips'

const props = defineProps<{
  value: string[]
  categories: string[]
  categoryToColor: (category: string) => string
}>()

const emit = defineEmits<{
  (e: 'update:value', value: string[]): void
}>()

const toggleCategory = (category: string): void => {
  const idx = props.value.findIndex((d) => d === category)
  const newValue: string[] = idx >= 0
    ? [...props.value.slice(0, idx), ...props.value.slice(idx + 1)]
    : [...props.value, category]
  emit('update:value', newValue)
}

const isSelected = (category: string): boolean => {
  return props.value.includes(category)
}
</script>

<template>
  <div class="flex gap-1">
    <button
      v-for="d in categories"
      :key="d"
      type="button"
      :data-testid="`tag-${d}`"
      class="flex gap-1 items-center"
      :class="isSelected(d) ? 'pill-on' : 'pill'"
      :title="categoryTip(d)"
      :aria-pressed="isSelected(d) ? 'true' : 'false'"
      :aria-label="categoryTip(d)"
      @click="toggleCategory(d)"
    >
      <div
        class="i-fa6-solid:square"
        :style="{ color: categoryToColor(d) }"
        aria-hidden="true"
      />
      {{ d }}
    </button>
  </div>
</template>
