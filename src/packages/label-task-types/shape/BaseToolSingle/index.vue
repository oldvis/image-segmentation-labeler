<script setup lang="ts">
import { storeToRefs } from 'pinia'
import VMenuCategory from '../components/VMenuCategory.vue'
import { useAnnotations } from '../composables/annotation'
import { useStore as useToolbarStore } from '../stores/toolbar'
import VToggleShape from './VToggleShape.vue'

const { categories, categoryToColor } = useAnnotations()

const toolbarStore = useToolbarStore()
const { stroke, tool } = storeToRefs(toolbarStore)
const { setStroke, setOperation } = toolbarStore

// Select the first category as the default stroke if available
if (categories.value.length !== 0) {
  setStroke(categories.value[0])
}
</script>

<template>
  <div class="flex">
    <!-- Object shape toggle -->
    <VToggleShape
      class="px-1"
      :value="tool"
      :disabled="categories.length === 0"
      @update:value="setOperation"
    />

    <div class="border-l border-gray-200" />

    <!-- Stroke color menu -->
    <VMenuCategory
      class="px-1"
      :value="stroke"
      :categories="categories"
      :category-to-color="categoryToColor"
      @update:value="setStroke"
    />
    <div class="border-l border-gray-200" />
  </div>
</template>
