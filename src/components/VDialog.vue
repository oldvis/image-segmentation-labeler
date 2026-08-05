<script setup lang="ts">
const { dialog } = defineProps<{ dialog: boolean }>()
</script>

<template>
  <slot name="activator" />
  <Teleport to="#app">
    <div
      v-if="dialog"
      dialog-backdrop
    >
      <slot>
        <div dialog-panel />
      </slot>
    </div>
  </Teleport>
</template>
