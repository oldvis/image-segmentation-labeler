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

const stats = computed(() => ([
  { title: 'Unlabeled', value: nUnlabeled.value },
  { title: 'Labeled', value: nLabeled.value },
  { title: 'Skipped', value: nSkipped.value },
]))

const save = (): void => {
  saveJsonFile(annotations.value, 'annotation.json')
}

const upload = async (): Promise<void> => {
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
  <div class="workspace-band px-2 py-1.5 flex flex-wrap gap-2 items-center">
    <div class="text-sm flex gap-2 items-center">
      <div class="i-fa6-solid:list-check text-gray-500" />
      <div class="font-semibold">
        Progress
      </div>
    </div>
    <div class="grow" />
    <div class="text-sm flex flex-wrap gap-3 items-center">
      <div
        v-for="d in stats"
        :key="d.title"
        class="flex gap-1 items-center"
      >
        <span class="text-gray-500">{{ d.title }}</span>
        <span
          class="font-semibold tabular-nums"
          :data-testid="d.title === 'Labeled' ? 'progress-labeled-count' : undefined"
        >
          {{ d.value }}
        </span>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          btn-secondary
          data-testid="annotations-download"
          @click="save"
        >
          Download
        </button>
        <button
          type="button"
          btn-secondary
          data-testid="annotations-upload"
          @click="upload"
        >
          Upload
        </button>
      </div>
    </div>
  </div>
</template>
