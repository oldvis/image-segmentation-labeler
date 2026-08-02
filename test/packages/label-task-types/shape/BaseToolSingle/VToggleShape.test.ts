import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VToggleShape from '~/packages/label-task-types/shape/BaseToolSingle/VToggleShape.vue'
import { ToolType } from '~/packages/label-task-types/shape/types'

describe('vToggleShape', () => {
  it('marks the active tool with aria-pressed and active class', () => {
    const wrapper = mount(VToggleShape, {
      props: { value: ToolType.ClickCreateRect },
    })
    const buttons = wrapper.findAll('button')
    const active = buttons.find((b) => b.attributes('title') === 'bounding box')
    const inactive = buttons.find((b) => b.attributes('title') === 'bounding polygon')
    expect(active?.attributes('aria-pressed')).toBe('true')
    expect(inactive?.attributes('aria-pressed')).toBe('false')
    expect(active?.classes().join(' ')).toContain('tool-btn-active')
  })
})
