<script setup lang="ts">
import { storeToRefs } from 'pinia'
import VMenuCategories from '../../components/VMenuCategories.vue'
import VToggleShape from '../../shape/BaseToolSingle/VToggleShape.vue'
import { useAnnotations } from '../composables/annotation'
import { useStore as useToolbarStore } from '../stores/toolbar'

const { categories, categoryToColor } = useAnnotations()
const toolbarStore = useToolbarStore()
const { stroke, tool } = storeToRefs(toolbarStore)
const { setStroke, setOperation } = toolbarStore

// Select the first category as the default stroke
if (categories.value.length !== 0) {
  setStroke([categories.value[0]])
}
</script>

<template>
  <div class="flex gap-1 items-center">
    <!-- stroke color menu -->
    <VMenuCategories
      :value="stroke"
      :categories="categories"
      :category-to-color="categoryToColor"
      @update:value="setStroke"
    />
    <!-- object shape toggle -->
    <VToggleShape
      :value="tool"
      :disabled="categories.length === 0"
      @update:value="setOperation"
    />
  </div>
</template>
