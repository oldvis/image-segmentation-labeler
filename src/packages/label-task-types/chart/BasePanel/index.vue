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
  <div view-container>
    <div view-header>
      <div class="i-fa6-solid:info" />
      <div class="font-bold">
        Spans
      </div>
    </div>
    <div
      class="gap-1 p-1 overflow-auto"
      flex="~ col"
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
