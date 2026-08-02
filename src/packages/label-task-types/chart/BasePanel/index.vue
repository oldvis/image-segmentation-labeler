<script setup lang="ts">
import { useAnnotations } from '../composables/annotation'
import VLabelShape from './VLabelShape.vue'

const {
  annotations,
  categories,
  categoryToColor,
  isSelected,
  select,
  update,
  remove,
} = useAnnotations()
</script>

<template>
  <div view-container class="h-full">
    <div view-header>
      <div class="i-fa6-solid:info text-gray-500" />
      <div class="font-semibold">
        Spans
      </div>
    </div>
    <div
      data-testid="spans-panel"
      panel-stack
    >
      <VLabelShape
        v-for="d in annotations"
        :key="d.uuid"
        :annotation="d"
        :categories="categories"
        :category-to-color="categoryToColor"
        :is-selected="isSelected(d)"
        @select="select"
        @update="update"
        @remove="($event) => remove($event.uuid)"
      />
    </div>
  </div>
</template>
