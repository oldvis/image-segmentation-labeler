<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  labelClass?: string
}>(), {
  labelClass: 'w-20',
})

const controlId = useId()
</script>

<template>
  <div class="flex gap-2 items-center">
    <label
      :for="controlId"
      class="text-sm text-gray-700 font-medium shrink-0 dark:text-gray-300"
      :class="labelClass"
    >
      {{ label }}
    </label>
    <div class="grow min-w-0">
      <slot :id="controlId" />
    </div>
  </div>
</template>
