<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import QuestionItem from './QuestionItem.vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  questions: { type: Array, required: true },
  getProgress: { type: Function, required: true }
})

defineEmits(['rate', 'status'])

const session = ref([])
const current = ref(0)
const seconds = ref(0)
const running = ref(false)
const answerOpen = ref(false)
let timer

const item = computed(() => session.value[current.value] || null)
const time = computed(() => `${String(Math.floor(seconds.value / 60)).padStart(2, '0')}:${String(seconds.value % 60).padStart(2, '0')}`)

function start() {
  session.value = [...props.questions].sort(() => Math.random() - 0.5).slice(0, 10)
  current.value = 0
  seconds.value = 0
  running.value = true
  answerOpen.value = false
  clearInterval(timer)
  timer = setInterval(() => seconds.value++, 1000)
}

function next() {
  if (current.value < session.value.length - 1) {
    current.value++
    answerOpen.value = false
  } else {
    running.value = false
    clearInterval(timer)
  }
}

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <section class="interview">
    <div v-if="!session.length" class="welcome">
      <span class="eyebrow">Mock interview</span>
      <h2>10 random Senior questions</h2>
      <p>Answer out loud first: clarify requirements, discuss trade-offs and risks, and explain how you would validate the result. Only then reveal the reference answer.</p>
      <button class="primary" @click="start">Start interview</button>
    </div>

    <template v-else>
      <div class="session-head">
        <div>
          <span class="eyebrow">Question {{ current + 1 }} of {{ session.length }}</span>
          <h2><AppIcon :name="item.categoryIcon" :size="24" /> {{ item.categoryName }}</h2>
        </div>
        <div class="timer">{{ time }}</div>
      </div>

      <QuestionItem
        :key="item.id"
        :item="item"
        :open="answerOpen"
        :progress="getProgress(item.id)"
        @toggle="answerOpen = !answerOpen"
        @rate="$emit('rate', item.id, $event)"
        @status="$emit('status', item.id, $event)"
      />

      <div class="session-actions">
        <button class="secondary" @click="start">New session</button>
        <button class="primary" @click="next">{{ current < session.length - 1 ? 'Next question' : 'Finish' }}</button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.interview { max-width: 900px; margin: 48px auto; }
.welcome { padding: 48px; text-align: center; background: var(--panel); border: 1px solid var(--border); border-radius: 14px; }
.welcome h2, .session-head h2 { margin: 6px 0 10px; }
.session-head h2 { display: flex; align-items: center; gap: 7px; }
.welcome p { max-width: 650px; margin: 0 auto 24px; color: var(--muted); line-height: 1.7; }
.eyebrow { color: var(--accent); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.session-head, .session-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.session-actions { margin-top: 20px; }
.timer { font-family: 'SF Mono', monospace; font-size: 22px; color: var(--accent); }
button { padding: 9px 16px; border-radius: 7px; cursor: pointer; font: inherit; }
.primary { color: #0f1115; background: var(--accent); border: 1px solid var(--accent); font-weight: 700; }
.secondary { color: var(--text); background: var(--panel); border: 1px solid var(--border); }
</style>
