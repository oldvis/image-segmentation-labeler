<script setup lang="ts">
const props = defineProps<{
  title: string
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const toggle = (): void => {
  emit('update:open', !props.open)
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <button
      type="button"
      class="icon-btn text-sm text-gray-800 font-medium flex gap-1 items-center dark:text-gray-200 !opacity-100"
      :aria-expanded="open ? 'true' : 'false'"
      @click="toggle"
    >
      <div :class="open ? 'i-fa6-solid:chevron-down' : 'i-fa6-solid:chevron-right'" />
      <span>{{ title }}</span>
      <slot name="actions" />
    </button>
    <div v-if="open" class="pl-1">
      <slot />
    </div>
  </div>
</template>
