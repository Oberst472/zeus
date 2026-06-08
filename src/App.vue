<script setup>
import { computed, ref } from 'vue'
import { useCategories } from './composables/useCategories.js'
import { useProgress } from './composables/useProgress.js'
import Sidebar from './components/Sidebar.vue'
import QuestionList from './components/QuestionList.vue'
import InterviewMode from './components/InterviewMode.vue'
import AppIcon from './components/AppIcon.vue'

const { categories, allQuestions, selectedSlug, selectedCategory, selectCategory } = useCategories()
const { getProgress, setStatus, rate, isDue, stats } = useProgress(allQuestions)
const mode = ref('study')
const scope = ref('category')
const level = ref('all')

const visibleCategory = computed(() => {
  if (scope.value === 'all') {
    return { slug: 'all', name: 'All topics', icon: 'categories', questions: allQuestions.value }
  }
  if (scope.value === 'due') {
    return { slug: 'due', name: 'Due for review', icon: 'repeat', questions: allQuestions.value.filter(item => isDue(item.id)) }
  }
  return selectedCategory.value
})

function selectScope(next) {
  scope.value = next
  mode.value = 'study'
}

function selectTopic(slug) {
  selectCategory(slug)
  selectScope('category')
}
</script>

<template>
  <div class="layout">
    <Sidebar
      :categories="categories"
      :selected-slug="selectedSlug"
      :scope="scope"
      :stats="stats"
      @select="selectTopic"
      @scope="selectScope"
    />

    <main class="main">
      <header class="topbar">
        <div>
          <h1><AppIcon class="logo" name="zap" :size="22" /> Zeus <span class="subtitle">— Middle &amp; Senior Full Stack prep</span></h1>
          <div class="stats">
            <span>{{ stats.total }} questions</span>
            <span class="known">{{ stats.known }} mastered</span>
            <span class="learning">{{ stats.learning }} learning</span>
            <span>{{ stats.due }} due for review</span>
          </div>
        </div>
        <div class="controls">
          <div class="modes">
            <button :class="{ active: level === 'all' }" @click="level = 'all'">All levels</button>
            <button :class="{ active: level === 'middle' }" @click="level = 'middle'">Middle</button>
            <button :class="{ active: level === 'senior' }" @click="level = 'senior'">Senior</button>
          </div>
          <div class="modes">
            <button :class="{ active: mode === 'study' }" @click="mode = 'study'">Study</button>
            <button :class="{ active: mode === 'interview' }" @click="mode = 'interview'">Mock interview</button>
          </div>
        </div>
      </header>

      <QuestionList
        v-if="mode === 'study'"
        :category="visibleCategory"
        :level="level"
        :get-progress="getProgress"
        @rate="rate"
        @status="setStatus"
      />
      <InterviewMode
        v-else
        :questions="allQuestions"
        :get-progress="getProgress"
        @rate="rate"
        @status="setStatus"
      />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}

.main {
  min-width: 0;
  padding: 28px 36px 64px;
  overflow-y: auto;
}

.topbar {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.topbar h1 {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.logo { margin-right: 4px; color: var(--accent); }

.subtitle {
  color: var(--muted);
  font-weight: 400;
  font-size: 16px;
  margin-left: 6px;
}
.stats { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; color: var(--muted); font-size: 12px; }
.stats .known { color: #9ece6a; }
.stats .learning { color: #e0af68; }
.controls { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.modes { display: flex; gap: 5px; padding: 4px; background: var(--panel); border: 1px solid var(--border); border-radius: 8px; }
.modes button { padding: 6px 10px; border: 0; border-radius: 5px; color: var(--muted); background: transparent; cursor: pointer; }
.modes button.active { color: var(--text); background: var(--hover); }

@media (max-width: 720px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .main { padding: 20px; }
  .subtitle { display: none; }
}
</style>
