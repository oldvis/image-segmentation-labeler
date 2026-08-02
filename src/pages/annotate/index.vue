<script setup lang="ts">
import { useSignInNotice } from '~/composables/useSignInNotice'

useSignInNotice()
</script>

<template>
  <div
    class="workspace-gap m-2 grow overflow-auto"
    flex="~ col"
  >
    <TheViewToolbar />
    <div class="workspace-gap flex grow min-h-0 overflow-auto">
      <TheViewLabelSubject class="basis-7/10 min-w-0 overflow-auto" />
      <TheViewLabelResult class="basis-3/10 min-w-0" />
    </div>
    <TheViewLabelProgress />
  </div>
</template>
