import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'
import { useStore as useMessageStore } from '~/stores/message'
import { useStore as useUserStore } from '~/stores/user'

export const SIGN_IN_NOTICE = 'Please sign in if you want to save your name in the annotations.'

/**
 * Show/Hide sign in notice
 * when the component is mounted and when sign in status updates.
 */
export const useSignInNotice = () => {
  const messageStore = useMessageStore()
  const { isSignedIn } = storeToRefs(useUserStore())

  const updateSignInNotice = () => {
    messageStore.removeByContent(SIGN_IN_NOTICE)
    if (isSignedIn.value) return
    messageStore.addErrorMessage(SIGN_IN_NOTICE, Number.POSITIVE_INFINITY)
  }

  onMounted(updateSignInNotice)
  watch(isSignedIn, updateSignInNotice)
}
