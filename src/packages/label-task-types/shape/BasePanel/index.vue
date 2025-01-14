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
  <div class="flex flex-col">
    <div class="border-b border-gray-200 flex items-center gap-2 px-2">
      <div class="i-fa6-solid:info" />
      <div>Spans</div>
    </div>
    <!-- A list of spans. -->
    <div class="flex-1 flex flex-col gap-1 p-1 overflow-auto">
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
