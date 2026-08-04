import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'
import { useStore as useMessageStore } from '~/stores/message'
import { useStore as useUserStore } from '~/stores/user'

export const SIGN_IN_NOTICE = 'Set a name if you want it recorded on new annotations.'

/**
 * Show/hide the local-name notice when the component mounts and when
 * signed-in status updates.
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
