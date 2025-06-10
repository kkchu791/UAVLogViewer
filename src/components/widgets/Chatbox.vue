<template>
  <div class="chatbox">
    <div class="messages" ref="chatMessages">
      <div v-for="(msg, index) in messages" :key="index" :class="msg.role">
        <strong>{{ msg.role }}:</strong>
        <div>{{msg.content}}</div>
      </div>
    </div>
    <form @submit.prevent="sendMessage">
      <textarea
        v-model="userInput"
        placeholder="Ask me something about this flight..."
        rows="1"
        @input="autoResize"
        @keydown.enter.exact.prevent="sendMessage"
      ></textarea>
      <button type="submit">Send</button>
    </form>
  </div>
</template>

<script>
export default {
    name: 'ChatBox',
    data () {
        return {
            userInput: '',
            messages: [],
            sessionId: null
        }
    },
    mounted () {
        const savedSession = localStorage.getItem('session_id')
        if (savedSession) {
            this.sessionId = savedSession
        } else {
            this.sessionId = crypto.randomUUID()
            localStorage.setItem('session_id', this.sessionId)
        }
        this.eventSource = new EventSource(`/api/stream?sessionId=${this.sessionId}`)
        this.eventSource.onmessage = this.handleStream
    },
    unmounted () {
        if (this.eventSource) {
            this.eventSource.close()
        }
    },
    methods: {
        async sendMessage () {
            if (!this.userInput.trim()) return

            const question = this.userInput
            this.messages.push({ role: 'user', content: question })
            this.scrollToBottom()
            this.userInput = ''

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question,
                        sessionId: this.sessionId
                    })
                })

                if (res) {
                    console.log('/api/chat is finished')
                } else {
                    console.log('something errored')
                }

                // const data = await res.json()
                // this.sessionId = data.session_id
                // this.messages.push({ role: 'Copilot Goose', content: data.answer })
            } catch (err) {
                this.messages.push({
                    role: 'assistant',
                    content: 'Error reaching backend.'
                })
                console.error(err)
            }
        },
        handleStream (event) {
            let chunk = event.data

            if (!chunk) return

            if (chunk === '[DONE]') {
                console.log('Assistant response complete')
                return
            }

            const lastMessage = this.messages[this.messages.length - 1]
            if (!lastMessage || lastMessage.role !== 'assistant') {
                this.messages.push({ role: 'assistant', content: chunk })
                this.scrollToBottom()
            } else {
                if (chunk[0].match(/[a-zA-Z0-9]/)) {
                    chunk = ' ' + chunk
                }
                lastMessage.content += chunk
            }
        },
        scrollToBottom () {
            this.$nextTick(() => {
                const container = this.$refs.chatMessages
                if (container) {
                    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
                }
            })
        },
        autoResize (event) {
            console.log('autosizing actually happening?')
            const el = event.target
            el.style.height = 'auto'
            el.style.height = (el.scrollHeight) + 'px'
        }
    }
}
</script>

<style scoped>
.chatbox {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 500px;
  height: 600px;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  padding: 12px;
  z-index: 9999;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  margin-bottom: 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.user {
  background-color: #d0ebff;
  align-self: flex-end;
  text-align: right;
  margin: 4px 0;
  padding: 6px 10px;
  border-radius: 6px;
}

.assistant {
  background-color: #e6ffe6;
  align-self: flex-start;
  text-align: left;
  margin: 4px 0;
  padding: 6px 10px;
  border-radius: 6px;
}

form {
  display: flex;
  gap: 8px;
}

textarea {
  flex: 1;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  resize: none;
  overflow-y: hidden;
  min-height: 36px;
  font-family: inherit;
}

button {
  padding: 8px 12px;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
