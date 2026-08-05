<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { categoryTip } from '~/stores/annotation/categoryTips'

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

const MAX_TRIGGER_CATEGORIES = 3

const triggerCategories = computed(() => (
  props.value.slice(0, MAX_TRIGGER_CATEGORIES)
))

const triggerOverflow = computed(() => (
  Math.max(0, props.value.length - MAX_TRIGGER_CATEGORIES)
))

const isSelected = (category: string): boolean => {
  return props.value.includes(category)
}
</script>

<template>
  <div
    class="inline-block relative"
  >
    <button
      type="button"
      btn-secondary
      class="flex gap-1 items-center"
      title="Mark category for new shapes"
      :aria-expanded="show ? 'true' : 'false'"
      :aria-haspopup="true"
      @click="show = !show"
    >
      <template v-if="value.length === 0">
        None
      </template>
      <template v-else>
        <span
          v-for="d in triggerCategories"
          :key="d"
          class="flex gap-1 items-center"
        >
          <div
            class="i-fa6-solid:square"
            :style="{ color: categoryToColor(d) }"
            aria-hidden="true"
          />
          {{ d }}
        </span>
        <span
          v-if="triggerOverflow > 0"
          class="text-gray-500 dark:text-gray-400"
        >+{{ triggerOverflow }}</span>
      </template>
      <div
        class="i-fa6-solid:caret-down text-xs opacity-70"
        aria-hidden="true"
      />
    </button>
    <div
      v-show="show"
      ref="menu"
      role="listbox"
      class="mt-1 border border-gray-200 rounded min-w-36 shadow-md absolute z-10 overflow-hidden dark:border-gray-600"
      bg="white dark:gray-800"
    >
      <button
        v-for="d in categories"
        :key="d"
        type="button"
        role="option"
        class="text-sm px-2 py-1.5 flex gap-1.5 w-full cursor-pointer items-center hover:bg-gray-100 dark:hover:bg-gray-700"
        :class="isSelected(d) ? 'font-medium text-gray-900 dark:text-gray-100' : ''"
        :title="categoryTip(d)"
        :aria-selected="isSelected(d) ? 'true' : 'false'"
        @click="toggleCategory(d)"
      >
        <div
          class="i-fa6-solid:check text-xs shrink-0 w-3"
          :class="isSelected(d) ? 'opacity-80' : 'opacity-0'"
          aria-hidden="true"
        />
        <div
          class="i-fa6-solid:square"
          :style="{ color: categoryToColor(d) }"
          aria-hidden="true"
        />
        {{ d }}
      </button>
    </div>
  </div>
</template>
