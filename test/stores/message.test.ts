import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { MessageType, useStore as useMessageStore } from '~/stores/message'

describe('message store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('addInfoMessage uses defaults', () => {
    const store = useMessageStore()
    store.addInfoMessage('note')
    expect(store.messages[0]).toMatchObject({
      content: 'note',
      type: MessageType.Info,
      timeout: 3000,
    })
  })

  it('removeMessage deletes by uuid', () => {
    const store = useMessageStore()
    store.addSuccessMessage('ok')
    const uuid = store.messages[0].uuid
    store.removeMessage(uuid)
    expect(store.messages).toHaveLength(0)
  })

  it('removeByContent removes matching messages', () => {
    const store = useMessageStore()
    store.addErrorMessage('Please sign in if you want to save your name in the annotations.', Number.POSITIVE_INFINITY)
    store.addSuccessMessage('other')
    store.removeByContent('Please sign in if you want to save your name in the annotations.')
    expect(store.messages.map((d) => d.content)).toEqual(['other'])
  })
})
