import { computed, ref } from 'vue'

const STORAGE_KEY = 'zeus.progress.v1'
const DAY = 24 * 60 * 60 * 1000

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

const progress = ref(loadProgress())

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress.value))
  } catch {
    // Progress remains available for the current session.
  }
}

function reviewDelay(confidence) {
  return [0, 0, 1, 3, 7, 14][confidence] * DAY
}

export function useProgress(allQuestions) {
  function getProgress(id) {
    return progress.value[id] || { status: 'new', confidence: 0, reviews: 0 }
  }

  function setStatus(id, status) {
    progress.value = {
      ...progress.value,
      [id]: { ...getProgress(id), status, updatedAt: Date.now() }
    }
    save()
  }

  function rate(id, confidence) {
    const status = confidence >= 4 ? 'known' : 'learning'
    progress.value = {
      ...progress.value,
      [id]: {
        ...getProgress(id),
        status,
        confidence,
        reviews: getProgress(id).reviews + 1,
        updatedAt: Date.now(),
        nextReview: Date.now() + reviewDelay(confidence)
      }
    }
    save()
  }

  function isDue(id) {
    const item = getProgress(id)
    return item.status !== 'new' && (!item.nextReview || item.nextReview <= Date.now())
  }

  const stats = computed(() => {
    const items = allQuestions.value
    const known = items.filter(item => getProgress(item.id).status === 'known').length
    const learning = items.filter(item => getProgress(item.id).status === 'learning').length
    const due = items.filter(item => isDue(item.id)).length
    return { total: items.length, known, learning, due }
  })

  return { getProgress, setStatus, rate, isDue, stats }
}
