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

const objectsCountLabel = computed(() => {
  const n = annotations.value.length
  return n === 1 ? '1 object' : `${n} objects`
})
</script>

<template>
  <div
    class="h-full min-h-0"
    flex="~ col"
  >
    <div view-header>
      <div class="i-fa6-solid:layer-group text-gray-500" />
      <div strip-label>
        Objects
      </div>
      <div class="grow" />
      <span class="strip-meta">
        <span strip-meta-em>{{ objectsCountLabel }}</span>
      </span>
    </div>
    <div
      data-testid="spans-panel"
      panel-stack
      class="grow min-h-0"
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
