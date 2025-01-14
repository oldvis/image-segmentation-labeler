<script lang="ts">
import type { PropType } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'VMenuCategory',
  props: {
    value: {
      type: String as PropType<string | null>,
      required: true,
    },
    categories: {
      type: Array as PropType<string[]>,
      required: true,
    },
    categoryToColor: {
      type: Function as PropType<(category: string) => string>,
      required: true,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
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
})
</script>

<template>
  <div class="relative inline-block">
    <button
      class="icon-btn gap-1 flex items-center"
      title="Select category"
      @click="show = true"
    >
      <div
        class="i-fa6-solid:square"
        :style="{ color: value === null ? 'gray' : categoryToColor(value) }"
      />
      {{ value }}
      <div class="grow" />
      <div class="i-fa6-solid:caret-down" />
    </button>
    <div
      ref="menu"
      role="menu"
      class="origin-top-right absolute z-1 bg-white rounded shadow dark:bg-gray-700"
      :class="!show ? 'hidden' : ''"
    >
      <ul class="text-gray-700 dark:text-gray-200">
        <li
          v-for="d in categories"
          :key="d"
          class="flex items-center cursor-pointer gap-1 block p-1 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
          @click="$emit('update:value', d); show = false;"
        >
          <div
            class="i-fa6-solid:square"
            :style="{ color: categoryToColor(d) }"
          />
          {{ d }}
        </li>
      </ul>
    </div>
  </div>
</template>
