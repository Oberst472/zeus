<script setup>
import { computed, ref, watch } from 'vue'
import QuestionItem from './QuestionItem.vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  category: { type: Object, default: null },
  level: { type: String, default: 'all' },
  getProgress: { type: Function, required: true }
})

defineEmits(['rate', 'status'])

const search = ref('')
const openIds = ref(new Set())

watch(() => props.category?.slug, () => {
  search.value = ''
  openIds.value = new Set()
})

const filtered = computed(() => {
  const list = props.category?.questions ?? []
  const q = search.value.trim().toLowerCase()
  return list.filter(item => {
    const matchesLevel = props.level === 'all' || item.level === props.level
    const matchesSearch = !q ||
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q)
    return matchesLevel && matchesSearch
  })
})

function toggle(id) {
  const next = new Set(openIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openIds.value = next
}

function expandAll() {
  openIds.value = new Set(filtered.value.map(q => q.id))
}

function collapseAll() {
  openIds.value = new Set()
}
</script>

<template>
  <section v-if="category" class="qlist">
    <div class="qlist-header">
      <div>
        <h2>
          <AppIcon class="icon" :name="category.icon" :size="24" />
          {{ category.name }}
        </h2>
        <p class="meta">{{ filtered.length }} / {{ category.questions.length }} questions</p>
      </div>

      <div class="actions">
        <input
          v-model="search"
          class="search"
          type="search"
          aria-label="Search questions and answers"
          placeholder="Search…"
        />
        <button class="btn ghost" @click="expandAll">Expand all</button>
        <button class="btn ghost" @click="collapseAll">Collapse</button>
      </div>
    </div>

    <ul v-if="filtered.length" class="items">
      <QuestionItem
        v-for="item in filtered"
        :key="item.id"
        :item="item"
        :open="openIds.has(item.id)"
        :progress="getProgress(item.id)"
        @toggle="toggle(item.id)"
        @rate="$emit('rate', item.id, $event)"
        @status="$emit('status', item.id, $event)"
      />
    </ul>
    <div v-else class="empty">
      <template v-if="search">Nothing matches "{{ search }}".</template>
      <template v-else>This category has no questions yet.</template>
    </div>
  </section>

  <section v-else class="empty-state">
    <p>Pick a category from the sidebar →</p>
  </section>
</template>

<style scoped>
.qlist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

h2 {
  display: flex;
  align-items: center;
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.icon { margin-right: 6px; color: var(--accent); }

.meta {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search {
  width: 200px;
  padding: 7px 10px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 13px;
  outline: none;
}

.search:focus {
  border-color: var(--accent);
}

.btn {
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text);
  transition: background 0.12s ease;
}

.btn.ghost:hover {
  background: var(--hover);
}

.items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty, .empty-state {
  padding: 40px 0;
  color: var(--muted);
  text-align: center;
}
</style>
