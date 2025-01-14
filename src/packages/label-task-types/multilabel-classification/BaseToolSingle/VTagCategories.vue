<script setup lang="ts">
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
