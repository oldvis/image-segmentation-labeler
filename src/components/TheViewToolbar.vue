<script setup lang="ts">
import { BaseToolSingle as BaseToolSingleChart } from '~/packages/label-task-types/chart'
import { BaseToolSingle as BaseToolSingleMultilabel } from '~/packages/label-task-types/multilabel-classification'
</script>

<template>
  <!--
    Two peer groups (same weight as Classify “Selectors”):
    Draw = mark category + shape tools; Tags = image-level labels.
  -->
  <div
    status-strip
    border="b gray-200 dark:gray-700"
  >
    <div class="flex shrink-0 gap-1.5 items-center">
      <div class="i-fa6-solid:pen text-gray-500 my-auto" />
      <div strip-label>
        Draw
      </div>
    </div>
    <div class="flex flex-wrap gap-1 min-w-0 items-center">
      <BaseToolSingleChart />
    </div>

    <span
      class="text-gray-300 shrink-0 select-none dark:text-gray-600"
      aria-hidden="true"
    >|</span>

    <div class="flex shrink-0 gap-1.5 items-center">
      <div class="i-fa6-solid:tags text-gray-500 my-auto" />
      <div strip-label>
        Tags
      </div>
    </div>
    <div class="flex flex-wrap gap-1 min-w-0 items-center">
      <BaseToolSingleMultilabel />
    </div>
  </div>
</template>
