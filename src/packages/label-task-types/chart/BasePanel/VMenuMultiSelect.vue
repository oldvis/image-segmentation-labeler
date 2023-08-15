<script lang="ts">
import { defineComponent, ref } from 'vue'
import type { PropType } from 'vue'
import { onClickOutside } from '@vueuse/core'

export default defineComponent({
  name: 'VMenuMultiSelect',
  props: {
    value: {
      type: Array as PropType<string[]>,
      required: true,
    },
    options: {
      type: Array as PropType<string[]>,
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
    <div class="relative inline-block h-16.8px">
      <button
        icon-btn
        title="add"
        @click="show = true"
      >
        <div class="i-fa6-solid:plus" />
      </button>
      <div
        ref="menu"
        class="absolute z-1 rounded shadow"
        bg="white dark:gray-700"
        :class="!show ? 'hidden' : ''"
      >
        <li
          v-for="d in options"
          :key="d"
          class="flex items-center cursor-pointer gap-1 p-1"
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
