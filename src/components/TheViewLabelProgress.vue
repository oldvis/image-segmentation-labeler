<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { saveJsonFile, uploadJsonFile } from '~/plugins/file'
import {
  parseUploadedAnnotations,
  useStore as useAnnotationStore,
} from '~/stores/annotation'
import { StatusType } from '~/stores/annotation/types'
import { useStore as useMessageStore } from '~/stores/message'

const annotationStore = useAnnotationStore()
const {
  annotations,
  statuses,
  dataObjects,
  labeledCount,
  unsureTaggedCount,
  confidentTaggedCount,
} = storeToRefs(annotationStore)
const { addErrorMessage, addSuccessMessage } = useMessageStore()

/** Labeled = has shape/chart detections or non-empty image tags (O(1)). */
const nLabeled = computed(() => labeledCount.value)
const nSkipped = computed(() => (
  statuses.value.filter((d) => (
    d.value === StatusType.Skipped && !annotationStore.isLabeled(d.uuid)
  )).length
))
const nUnlabeled = computed(() => (
  Math.max(0, dataObjects.value.length - nLabeled.value - nSkipped.value)
))

const nUnsure = computed(() => unsureTaggedCount.value)
const nConfident = computed(() => confidentTaggedCount.value)

const save = (): void => {
  saveJsonFile(annotations.value, 'annotation.json')
}

const upload = async (): Promise<void> => {
  try {
    const data = await uploadJsonFile()
    if (data === null) return
    const knownSubjects = new Set(dataObjects.value.map((d) => d.uuid))
    const parsed = parseUploadedAnnotations(data, knownSubjects)
    if (!parsed.ok) {
      addErrorMessage(parsed.error)
      return
    }
    annotationStore.setAnnotations(parsed.data)
    addSuccessMessage('Annotations uploaded')
  }
  catch {
    addErrorMessage('Upload failed: invalid JSON')
  }
}
</script>

<template>
  <div status-strip>
    <div class="flex shrink-0 gap-1.5 items-center">
      <div class="i-fa6-solid:list-check text-gray-500 my-auto" />
      <div strip-label>
        Progress
      </div>
    </div>
    <div class="strip-meta flex grow flex-wrap gap-x-1.5 gap-y-1 min-w-0 items-center">
      <span>
        Labeled
        <span
          strip-meta-em
          data-testid="progress-labeled-count"
        >{{ nLabeled }}</span>
        /
        <span strip-meta-em>{{ dataObjects.length }}</span>
      </span>
      <span
        strip-sep
        aria-hidden="true"
      >·</span>
      <span>
        Unlabeled
        <span strip-meta-em>{{ nUnlabeled }}</span>
      </span>
      <span
        strip-sep
        aria-hidden="true"
      >·</span>
      <span>
        Skipped
        <span strip-meta-em>{{ nSkipped }}</span>
      </span>
      <span
        strip-sep
        aria-hidden="true"
      >|</span>
      <span>
        Unsure
        <span
          strip-meta-em
          data-testid="progress-unsure-count"
        >{{ nUnsure }}</span>
      </span>
      <span
        strip-sep
        aria-hidden="true"
      >·</span>
      <span>
        Confident
        <span
          strip-meta-em
          data-testid="progress-confident-count"
        >{{ nConfident }}</span>
      </span>
    </div>
    <div class="ml-auto flex shrink-0 gap-1">
      <button
        type="button"
        btn-secondary
        data-testid="annotations-download"
        title="Download annotation.json (not saved in the browser)"
        @click="save"
      >
        Download
      </button>
      <button
        type="button"
        btn-secondary
        data-testid="annotations-upload"
        title="Upload annotation.json (replaces current annotations)"
        @click="upload"
      >
        Upload
      </button>
    </div>
  </div>
</template>
