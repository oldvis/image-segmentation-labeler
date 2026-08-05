<script setup lang="ts">
import { onMounted } from 'vue'
import { useSignInNotice } from '~/composables/useSignInNotice'

const { notifyIfUnsigned } = useSignInNotice()
onMounted(() => {
  notifyIfUnsigned()
})
</script>

<template>
  <div
    class="grow min-h-0 overflow-hidden"
    flex="~ col"
  >
    <TheViewToolbar class="shrink-0" />
    <div
      view-container
      class="border-t-0 rounded-t-none grow min-h-0"
      flex="~ row"
    >
      <TheViewLabelSubject class="basis-7/10 min-h-0 min-w-0" />
      <TheViewLabelResult class="border-l border-gray-200 basis-3/10 min-h-0 min-w-0 dark:border-gray-700" />
    </div>
    <TheViewLabelProgress class="shrink-0" />
  </div>
</template>
