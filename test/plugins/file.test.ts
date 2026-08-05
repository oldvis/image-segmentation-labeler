import { saveAs } from 'file-saver'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveJsonFile, uploadJsonFile } from '~/plugins/file'

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}))

const mockFileInput = () => {
  const click = vi.fn()
  const input = {
    type: '',
    accept: '',
    multiple: true,
    webkitdirectory: false,
    value: '',
    files: null as FileList | null,
    click,
    onchange: null as ((e: Event) => void) | null,
    oncancel: null as (() => void) | null,
  }
  const createElement = vi.spyOn(document, 'createElement').mockReturnValue(
    input as unknown as HTMLInputElement,
  )
  return { input, click, createElement }
}

describe('file plugin', () => {
  beforeEach(() => {
    vi.mocked(saveAs).mockReset()
  })

  it('saveJsonFile stringifies data and saves a blob', () => {
    saveJsonFile({ hello: 'world' }, 'annotation.json')
    expect(saveAs).toHaveBeenCalledTimes(1)
    const [blob, filename] = vi.mocked(saveAs).mock.calls[0]
    expect(filename).toBe('annotation.json')
    expect(blob).toBeInstanceOf(Blob)
    expect((blob as Blob).type).toBe('application/json')
  })

  it('uploadJsonFile sets accept and resolves null on cancel', async () => {
    const { input, click, createElement } = mockFileInput()

    const pending = uploadJsonFile()
    expect(input.type).toBe('file')
    expect(input.accept).toBe('application/json,.json')
    expect(input.multiple).toBe(false)
    expect(click).toHaveBeenCalledTimes(1)

    input.oncancel?.()
    await expect(pending).resolves.toBeNull()

    createElement.mockRestore()
  })

  it('uploadJsonFile parses the selected JSON file', async () => {
    const { input, createElement } = mockFileInput()
    const payload = [{ type: 'MultilabelClassification', value: ['Vis'] }]
    const file = new File([JSON.stringify(payload)], 'annotation.json', {
      type: 'application/json',
    })

    const pending = uploadJsonFile()
    input.onchange?.({
      target: { files: [file] },
    } as unknown as Event)

    await expect(pending).resolves.toEqual(payload)
    createElement.mockRestore()
  })

  it('uploadJsonFile rejects invalid JSON', async () => {
    const { input, createElement } = mockFileInput()
    const file = new File(['{'], 'bad.json', { type: 'application/json' })

    const pending = uploadJsonFile()
    input.onchange?.({
      target: { files: [file] },
    } as unknown as Event)

    await expect(pending).rejects.toThrow()
    createElement.mockRestore()
  })
})
