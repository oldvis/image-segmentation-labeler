<script lang="ts">
import type { PropType } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'VMenuCategories',
  props: {
    value: {
      type: Array as PropType<string[]>,
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
  setup() {
    const show = ref(false)
    const menu = ref<HTMLDivElement>()
    onClickOutside(menu, () => {
      show.value = false
    })
    return { show, menu }
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
