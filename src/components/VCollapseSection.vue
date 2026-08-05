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
  <div class="flex flex-col">
    <button
      type="button"
      class="text-sm text-gray-800 font-medium flex gap-1 h-6 w-full items-center dark:text-gray-200 hover:text-teal-600"
      :title="open ? `Collapse ${title}` : `Expand ${title}`"
      :aria-expanded="open ? 'true' : 'false'"
      @click="toggle"
    >
      <div
        class="i-fa6-solid:chevron-right text-[10px] text-gray-500 shrink-0 h-3 w-3 transition-transform"
        :class="open ? 'rotate-90' : ''"
        aria-hidden="true"
      />
      <span class="text-left grow">{{ title }}</span>
      <span
        class="flex shrink-0 items-center"
        @click.stop
      >
        <slot name="actions" />
      </span>
    </button>
    <div
      v-if="open"
      class="pb-1 flex flex-col gap-1"
    >
      <slot />
    </div>
  </div>
</template>
