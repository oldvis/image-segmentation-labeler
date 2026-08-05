<script setup lang="ts" generic="T">
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{
  value: T[]
  options: T[]
  id?: string
  /** Placeholder when nothing is selected. */
  emptyLabel?: string
}>()

const emit = defineEmits<{
  (e: 'update:value', value: T[]): void
}>()

const show = ref(false)
const root = ref<HTMLDivElement>()

onClickOutside(root, () => {
  show.value = false
})

const summary = computed(() => {
  if (props.value.length === 0) return null
  return props.value.map(String).join(', ')
})

const toggleOption = (option: T): void => {
  const idx = props.value.findIndex((d) => d === option)
  const next: T[] = idx >= 0
    ? [...props.value.slice(0, idx), ...props.value.slice(idx + 1)]
    : [...props.value, option]
  emit('update:value', next)
}

const isSelected = (option: T): boolean => props.value.includes(option)
</script>

<template>
  <div
    ref="root"
    class="inline-flex max-w-full relative"
  >
    <button
      :id="id"
      type="button"
      menu-trigger
      :title="summary ?? emptyLabel ?? 'None'"
      :aria-expanded="show ? 'true' : 'false'"
      :aria-haspopup="true"
      @click="show = !show"
    >
      <span
        v-if="summary === null"
        class="text-gray-400 min-w-0 truncate dark:text-gray-500"
      >{{ emptyLabel ?? 'None' }}</span>
      <span
        v-else
        class="text-left min-w-0 truncate"
      >{{ summary }}</span>
      <div
        class="i-fa6-solid:caret-down text-xs opacity-70 shrink-0"
        aria-hidden="true"
      />
    </button>
    <div
      v-show="show"
      role="listbox"
      menu-panel
    >
      <button
        v-for="(d, i) in options"
        :key="i"
        type="button"
        role="option"
        :class="isSelected(d) ? 'menu-item-on' : 'menu-item'"
        :title="String(d)"
        :aria-selected="isSelected(d) ? 'true' : 'false'"
        @click="toggleOption(d)"
      >
        <div
          class="i-fa6-solid:check text-xs shrink-0 w-3"
          :class="isSelected(d) ? 'opacity-80' : 'opacity-0'"
          aria-hidden="true"
        />
        <span class="truncate">{{ d }}</span>
      </button>
    </div>
  </div>
</template>
