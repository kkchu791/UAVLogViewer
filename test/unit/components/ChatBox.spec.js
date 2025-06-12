import { mount } from '@vue/test-utils'
import ChatBox from '@/components/widgets/ChatBox.vue'


// Fake fetch
global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
)

// Fake EventSource
class FakeEventSource {
  constructor() {
    this.onmessage = null
  }
  close() {}
}
global.EventSource = FakeEventSource

describe('ChatBox.vue integration', () => {
  it('shows user message in the DOM after sending', async () => {
    const wrapper = mount(ChatBox)

    // Simulate typing in textarea
    const textarea = wrapper.find('textarea')
    await textarea.setValue('How high did the drone go?')

    // Simulate form submit
    await wrapper.find('form').trigger('submit.prevent')

    // Expect it to appear in DOM
   await wrapper.vm.$nextTick()

    const messages = wrapper.findAll('.user')
    console.log('Found messages:', messages.length)

    expect(messages.length).toBe(1)
    expect(messages.at(0).text()).toContain('How high did the drone go?')
  })
})