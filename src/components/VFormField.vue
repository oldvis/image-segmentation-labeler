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
    <div class="flex min-w-0 items-center">
      <slot :id="controlId" />
    </div>
  </div>
</template>
