<template>
  <div class="chatbox">
    <div class="messages" ref="chatMessages">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="msg.role"
      >
        <strong>{{ msg.role }}:</strong> {{ msg.content }}
      </div>
    </div>
    <form @submit.prevent="sendMessage">
      <input
        v-model="userInput"
        type="text"
        placeholder="Ask something about the flight..."
      />
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
    },
    methods: {
        async sendMessage () {
            if (!this.userInput.trim()) return

            const question = this.userInput
            this.messages.push({ role: 'user', content: question })
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

                const data = await res.json()
                this.sessionId = data.session_id
                this.messages.push({ role: 'assistant', content: data.answer })
            } catch (err) {
                this.messages.push({
                    role: 'assistant',
                    content: 'Error reaching backend.'
                })
                console.error(err)
            }
        },
        scrollToBottom () {
            this.$nextTick(() => {
                const container = this.$refs.chatMessages
                if (container) {
                    container.scrollTop = container.scrollHeight
                }
            })
        }
    }
}
</script>

<style scoped>
.chatbox {
  border-top: 1px solid #ccc;
  padding: 10px;
  background: #f9f9f9;
  height: 300px;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  margin-bottom: 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.message {
  margin-bottom: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  max-width: 80%;
  word-wrap: break-word;
  padding: 10px;
}

.user {
  background-color: #d0ebff;
  align-self: flex-end;
  text-align: right;
}

.assistant {
  background-color: #e6ffe6;
  align-self: flex-start;
  text-align: left;
}

form {
  display: flex;
  gap: 8px;
}

input {
  flex: 1;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
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
