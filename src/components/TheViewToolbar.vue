<script setup lang="ts">
import { BaseToolSingle as BaseToolSingleChart } from '~/packages/label-task-types/chart'
import { BaseToolSingle as BaseToolSingleMultilabel } from '~/packages/label-task-types/multilabel-classification'
</script>

<template>
  <div
    class="flex gap-1"
    border="~ gray-200"
  >
    <div class="text-sm p-1 flex gap-1">
      <div class="i-fa6-solid:toolbox my-auto" />
      <div class="font-bold my-auto">
        Tools
      </div>
    </div>
    <div class="my-1 border-l" />
    <BaseToolSingleChart />
    <div class="my-1 border-l" />
    <BaseToolSingleMultilabel class="my-1" />
    <div class="my-1 border-l" />
  </div>
</template>
