<script setup lang="ts">
import { useSignInNotice } from '~/composables/useSignInNotice'

useSignInNotice()
</script>

<template>
  <div
    class="m-1 grow gap-1 overflow-auto"
    flex="~ col"
  >
    <TheViewToolbar />
    <div class="flex grow gap-1 overflow-auto">
      <TheViewLabelSubject class="basis-7/10 overflow-auto" />
      <TheViewLabelResult class="basis-3/10" />
    </div>
    <TheViewLabelProgress />
  </div>
</template>
