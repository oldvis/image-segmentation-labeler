<script setup lang="ts" generic="T">
import { onClickOutside } from '@vueuse/core'

const { value, options } = defineProps<{
  value: T
  options: T[]
}>()
const emit = defineEmits<{
  (e: 'update:value', value: T): void
}>()
const show = ref(false)
const menu = ref<HTMLDivElement>()
onClickOutside(menu, () => {
  show.value = false
})
</script>

<template>
  <div flex="~ col">
    <div class="relative inline-block">
      <button
        class="border rounded px-1 flex"
        type="button"
        @click="show = true"
      >
        {{ value }}
        <div class="grow" />
        <div class="i-fa6-solid:sort-down" />
      </button>
      <div
        ref="menu"
        class="absolute z-1 rounded shadow"
        bg="white dark:gray-700"
        :class="!show ? 'hidden' : ''"
      >
        <ul>
          <li
            v-for="(d, i) in options"
            :key="i"
            class="p-1 cursor-pointer"
            bg="hover:gray-100 dark:hover:gray-600"
            @click="emit('update:value', d); show = false;"
          >
            {{ d }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
