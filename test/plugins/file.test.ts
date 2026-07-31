import { saveAs } from 'file-saver'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { parseCsvFile, parseJsonFile, saveJsonFile } from '~/plugins/file'

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}))

describe('file helpers', () => {
  beforeEach(() => {
    vi.mocked(saveAs).mockClear()
  })

  it('parseJsonFile reads JSON text', async () => {
    const file = new File([JSON.stringify({ a: 1 })], 'a.json', { type: 'application/json' })
    await expect(parseJsonFile(file)).resolves.toEqual({ a: 1 })
  })

  it('parseCsvFile parses rows', async () => {
    const file = new File(['name,age\nalice,1\n'], 'a.csv', { type: 'text/csv' })
    const rows = await parseCsvFile(file) as Array<Record<string, string>>
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ name: 'alice', age: '1' })
  })

  it('saveJsonFile stringifies and saves a blob', () => {
    saveJsonFile({ hello: 'world' }, 'out.json')
    expect(saveAs).toHaveBeenCalledTimes(1)
    const [blob, filename] = vi.mocked(saveAs).mock.calls[0]
    expect(filename).toBe('out.json')
    expect(blob).toBeInstanceOf(Blob)
  })
})
