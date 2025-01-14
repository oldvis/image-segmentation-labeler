<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{
  value: string[]
  categories: string[]
  categoryToColor: (category: string) => string
}>()

const emit = defineEmits<{
  (e: 'update:value', value: string[]): void
}>()

const show = ref(false)
const menu = ref<HTMLDivElement>()

onClickOutside(menu, () => {
  show.value = false
})

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
  <div flex="~ col">
    <div class="relative inline-block">
      <button
        icon-btn
        class="gap-1 flex items-center"
        title="Set Stroke Color"
        @click="show = true"
      >
        <template v-if="value.length === 0">
          None Selected
        </template>
        <template v-else-if="value.length === 1">
          <div
            class="i-fa6-solid:square"
            :style="{ color: value === null ? 'gray' : categoryToColor(value[0]) }"
          />
          {{ value[0] }}
        </template>
        <template v-else>
          Multi-Label
        </template>
        <div class="i-fa6-solid:caret-down" />
      </button>
      <div
        ref="menu"
        class="absolute z-1 rounded shadow"
        bg="white dark:gray-700"
        :class="!show ? 'hidden' : ''"
      >
        <li
          v-for="d in categories"
          :key="d"
          class="flex items-center cursor-pointer gap-1 p-1"
          bg="hover:gray-100 dark:hover:gray-600"
          @click="toggleCategory(d)"
        >
          <input
            :checked="isSelected(d)"
            type="checkbox"
          >
          <div
            class="i-fa6-solid:square"
            :style="{ color: categoryToColor(d) }"
          />
          {{ d }}
        </li>
      </div>
    </div>
  </div>
</template>
