<script setup lang="ts">
import { BaseToolSingle as BaseToolSingleShape } from '~/packages/label-task-types/chart'
import { BaseToolSingle as BaseToolSingleMultilabel } from '~/packages/label-task-types/multilabel-classification'
</script>

<template>
  <div
    class="flex gap-1"
    border="~ gray-200"
  >
    <div class="p-1 flex gap-1 text-sm">
      <div class="i-fa6-solid:toolbox my-auto" />
      <div class="font-bold my-auto">
        Tools
      </div>
    </div>
    <div class="border-l my-1" />
    <BaseToolSingleShape />
    <div class="border-l my-1" />
    <BaseToolSingleMultilabel class="my-1" />
    <div class="border-l my-1" />
  </div>
</template>
