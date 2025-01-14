<script setup lang="ts">
import type { Component, PropType } from 'vue'
import { computed } from 'vue'
import { AnnotationType } from '~/stores/annotation'
import VMenuCategories from '../../components/VMenuCategories.vue'
import { useAnnotations } from '../composables/annotation'
import VTagCategories from './VTagCategories.vue'

const { disabled, component } = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  component: {
    type: String as PropType<'Menu' | 'Tags'>,
    default: 'Tags',
  },
})

const {
  dataObject,
  multilabel,
  categories,
  categoryToColor,
  update,
  add,
} = useAnnotations()
const onUpdate = (value: string[]): void => {
  if (dataObject.value === null) throw new Error('Data object does not exist')
  if (multilabel.value === null) {
    add({
      type: AnnotationType.MultilabelClassification,
      subject: dataObject.value.uuid,
      value,
    })
  }
  else {
    update({ ...multilabel.value, value })
  }
}
const element = computed((): Component => {
  if (component === 'Menu') return VMenuCategories
  if (component === 'Tags') return VTagCategories
  throw new TypeError(`Invalid component type ${component}`)
})
const value = computed((): string[] => {
  if (multilabel.value === null) return []
  return multilabel.value.value
})
</script>

<template>
  <component
    :is="element"
    :value="value"
    :categories="categories"
    :category-to-color="categoryToColor"
    :disabled="disabled"
    @update:value="onUpdate"
  />
</template>
