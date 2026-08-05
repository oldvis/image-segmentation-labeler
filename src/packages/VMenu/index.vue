<script setup lang="ts" generic="T">
import { onClickOutside } from '@vueuse/core'
import { categoryTip } from '~/stores/annotation/categoryTips'

defineProps<{
  value: T
  options: T[]
  id?: string
}>()

const emit = defineEmits<{
  (e: 'update:value', value: T): void
}>()

const show = ref(false)
const root = ref<HTMLDivElement>()

onClickOutside(root, () => {
  show.value = false
})

const onPick = (option: T): void => {
  emit('update:value', option)
  show.value = false
}

const tipFor = (option: T): string => (
  typeof option === 'string' ? categoryTip(option) : String(option)
)
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
      :title="tipFor(value)"
      :aria-expanded="show ? 'true' : 'false'"
      :aria-haspopup="true"
      @click="show = !show"
    >
      <span class="min-w-0 truncate">{{ value }}</span>
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
        :class="d === value ? 'menu-item-on' : 'menu-item'"
        :title="tipFor(d)"
        :aria-selected="d === value ? 'true' : 'false'"
        @click="onPick(d)"
      >
        <div
          class="i-fa6-solid:check text-xs shrink-0 w-3"
          :class="d === value ? 'opacity-80' : 'opacity-0'"
          aria-hidden="true"
        />
        <span class="truncate">{{ d }}</span>
      </button>
    </div>
  </div>
</template>
