<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { StatusType, useStore as useAnnotationStore } from '~/stores/annotation'
import type { Annotation } from '~/stores/annotation'
import { saveJsonFile, uploadJsonFile } from '~/plugins/file'

const annotationStore = useAnnotationStore()
const { annotations, statuses } = storeToRefs(annotationStore)

const nUnlabeled = computed(() => (
  statuses.value.filter((d) => [StatusType.New, StatusType.Viewed].includes(d.value)).length
))
const nSkipped = computed(() => (
  statuses.value.filter((d) => d.value === StatusType.Skipped).length
))
const nLabeled = computed(() => (
  statuses.value.filter((d) => d.value === StatusType.Labeled).length
))

const save = () => {
  saveJsonFile(annotations.value, 'annotation.json')
}
const upload = async () => {
  annotations.value = (await uploadJsonFile()) as Annotation[]
}
</script>

<template>
  <div
    class="flex gap-1 px-1"
    border="~ gray-200"
  >
    <div class="flex gap-1 text-sm">
      <div class="i-fa6-solid:list-check my-auto" />
      <div class="font-bold my-auto">
        Progress
      </div>
    </div>
    <div class="grow" />
    <div class="flex gap-1 text-sm">
      <template
        v-for="(d, i) in [
          { title: '#Not-Yet-Labeled:', value: nUnlabeled },
          { title: '#Labeled:', value: nLabeled },
          { title: '#Skipped:', value: nSkipped },
        ]" :key="d.title"
      >
        <div v-if="i === 0" class="border-l my-1" />
        <div class="flex gap-1 my-auto">
          {{ d.title }}
          <div class="font-bold">
            {{ d.value }}
          </div>
        </div>
        <div class="border-l my-1" />
      </template>
      <div class="flex gap-1 my-1">
        <button btn @click="save">
          download
        </button>
        <button btn @click="upload">
          upload
        </button>
      </div>
    </div>
  </div>
</template>
