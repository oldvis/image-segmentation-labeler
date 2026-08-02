<script setup lang="ts">
import { BaseToolSingle as BaseToolSingleChart } from '~/packages/label-task-types/chart'
import { BaseToolSingle as BaseToolSingleMultilabel } from '~/packages/label-task-types/multilabel-classification'
</script>

<template>
  <div
    class="workspace-band flex flex-wrap items-stretch"
    workspace-gap
  >
    <div toolbar-group>
      <div class="i-fa6-solid:toolbox text-gray-500" />
      <div toolbar-label>
        Tools
      </div>
    </div>
    <div class="my-1 border-l border-gray-200 dark:border-gray-700" />
    <div toolbar-group class="min-w-0">
      <div toolbar-label>
        Draw
      </div>
      <BaseToolSingleChart />
    </div>
    <div class="my-1 border-l border-gray-200 dark:border-gray-700" />
    <div toolbar-group class="min-w-0">
      <div toolbar-label>
        Tags
      </div>
      <BaseToolSingleMultilabel />
    </div>
  </div>
</template>
