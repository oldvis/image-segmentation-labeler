<script lang="ts">
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'
import VMenuCategory from '../components/VMenuCategory.vue'
import { useAnnotations } from '../composables/annotation'
import { useStore as useToolbarStore } from '../stores/toolbar'
import VToggleShape from './VToggleShape.vue'

export default defineComponent({
  name: 'BaseToolSingle',
  components: {
    VMenuCategory,
    VToggleShape,
  },
  setup() {
    const { categories, categoryToColor } = useAnnotations()
    const toolbarStore = useToolbarStore()
    const { stroke, tool } = storeToRefs(toolbarStore)

    // Select the first category as the default stroke
    if (categories.value.length !== 0) {
      toolbarStore.setStroke(categories.value[0])
    }

    return {
      categories,
      categoryToColor,
      stroke,
      tool,
      setStroke: toolbarStore.setStroke,
      setOperation: toolbarStore.setOperation,
    }
  },
})
</script>

<template>
  <div class="flex">
    <!-- object shape toggle -->
    <VToggleShape
      class="px-1"
      :value="tool"
      :disabled="categories.length === 0"
      @update:value="setOperation"
    />

    <div class="border-l border-gray-200" />

    <!-- stroke color menu -->
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
