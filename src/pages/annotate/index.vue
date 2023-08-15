<script setup lang="ts">
import { useSignInNotice } from '~/composables/useSignInNotice'

useSignInNotice()
</script>

<template>
  <div
    class="grow overflow-auto m-1 gap-1"
    flex="~ col"
  >
    <TheViewToolbar />
    <div class="grow flex overflow-auto gap-1">
      <TheViewLabelSubject class="basis-7/10 overflow-auto" />
      <TheViewLabelResult class="basis-3/10" />
    </div>
    <TheViewLabelProgress />
  </div>
</template>
