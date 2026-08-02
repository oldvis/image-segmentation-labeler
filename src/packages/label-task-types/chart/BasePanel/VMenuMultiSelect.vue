<script setup lang="ts" generic="T">
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{
  value: T[]
  options: T[]
}>()

const emit = defineEmits<{
  (e: 'update:value', value: T[]): void
}>()

const show = ref(false)
const menu = ref<HTMLDivElement>()

onClickOutside(menu, () => {
  show.value = false
})

const toggleCategory = (category: T): void => {
  const idx = props.value.findIndex((d) => d === category)
  const newValue: T[] = idx >= 0
    ? [...props.value.slice(0, idx), ...props.value.slice(idx + 1)]
    : [...props.value, category]
  emit('update:value', newValue)
}

const isSelected = (category: T): boolean => {
  return props.value.includes(category)
}
</script>

<template>
  <div flex="~ col">
    <div class="h-16.8px inline-block relative">
      <button
        icon-btn
        title="add"
        @click="show = true"
      >
        <div class="i-fa6-solid:plus" />
      </button>
      <div
        ref="menu"
        class="rounded shadow absolute z-1"
        bg="white dark:gray-700"
        :class="!show ? 'hidden' : ''"
      >
        <li
          v-for="(d, i) in options"
          :key="i"
          class="p-1 flex gap-1 cursor-pointer items-center"
          bg="hover:gray-100 dark:hover:gray-600"
          @click="toggleCategory(d)"
        >
          <input
            :checked="isSelected(d)"
            type="checkbox"
          >
          {{ d }}
        </li>
      </div>
    </div>
  </div>
</template>
