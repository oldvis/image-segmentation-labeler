<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { saveJsonFile, uploadJsonFile } from '~/plugins/file'
import { isAnnotationArray, StatusType, useStore as useAnnotationStore } from '~/stores/annotation'
import { useStore as useMessageStore } from '~/stores/message'

const annotationStore = useAnnotationStore()
const { annotations, statuses } = storeToRefs(annotationStore)
const { addErrorMessage, addSuccessMessage } = useMessageStore()

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
  try {
    const data = await uploadJsonFile()
    if (data === null) return
    if (!isAnnotationArray(data)) {
      addErrorMessage('Upload failed: file is not an annotations array')
      return
    }
    annotations.value = data
    addSuccessMessage('Annotations uploaded')
  }
  catch {
    addErrorMessage('Upload failed: invalid JSON')
  }
}
</script>

<template>
  <div
    class="px-1 flex gap-1"
    border="~ gray-200"
  >
    <div class="text-sm flex gap-1">
      <div class="i-fa6-solid:list-check my-auto" />
      <div class="font-bold my-auto">
        Progress
      </div>
    </div>
    <div class="grow" />
    <div class="text-sm flex gap-1">
      <template
        v-for="(d, i) in [
          { title: '#Not-Yet-Labeled:', value: nUnlabeled },
          { title: '#Labeled:', value: nLabeled },
          { title: '#Skipped:', value: nSkipped },
        ]" :key="d.title"
      >
        <div v-if="i === 0" class="my-1 border-l" />
        <div class="my-auto flex gap-1">
          {{ d.title }}
          <div
            class="font-bold"
            :data-testid="d.title === '#Labeled:' ? 'progress-labeled-count' : undefined"
          >
            {{ d.value }}
          </div>
        </div>
        <div class="my-1 border-l" />
      </template>
      <div class="my-1 flex gap-1">
        <button
          btn
          data-testid="annotations-download"
          @click="save"
        >
          download
        </button>
        <button
          btn
          data-testid="annotations-upload"
          @click="upload"
        >
          upload
        </button>
      </div>
    </div>
  </div>
</template>
