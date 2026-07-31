import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { MessageType, useStore as useMessageStore } from '~/stores/message'

describe('message store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('addSuccessMessage / addErrorMessage use defaults', () => {
    const store = useMessageStore()
    store.addSuccessMessage('ok')
    store.addErrorMessage('bad')
    expect(store.messages).toHaveLength(2)
    expect(store.messages[0]).toMatchObject({ content: 'ok', type: MessageType.Success, timeout: 3000 })
    expect(store.messages[1]).toMatchObject({ content: 'bad', type: MessageType.Error, timeout: 3000 })
  })

  it('removeMessage deletes by uuid', () => {
    const store = useMessageStore()
    store.addSuccessMessage('ok')
    const uuid = store.messages[0].uuid
    store.removeMessage(uuid)
    expect(store.messages).toHaveLength(0)
  })
})
