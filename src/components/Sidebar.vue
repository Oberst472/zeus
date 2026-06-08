<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  categories: { type: Array, required: true },
  selectedSlug: { type: String, default: null },
  scope: { type: String, default: 'category' },
  stats: { type: Object, required: true }
})

defineEmits(['select', 'scope'])
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">Categories</div>
    <nav class="cat-list">
      <button class="cat-btn" :class="{ active: scope === 'all' }" @click="$emit('scope', 'all')">
        <AppIcon class="cat-icon" name="categories" /><span class="cat-name">All topics</span><span class="cat-count">{{ stats.total }}</span>
      </button>
      <button class="cat-btn" :class="{ active: scope === 'due' }" @click="$emit('scope', 'due')">
        <AppIcon class="cat-icon" name="repeat" /><span class="cat-name">Review</span><span class="cat-count">{{ stats.due }}</span>
      </button>
      <div class="divider" />
      <button
        v-for="cat in categories"
        :key="cat.slug"
        class="cat-btn"
        :class="{ active: scope === 'category' && cat.slug === selectedSlug }"
        @click="$emit('select', cat.slug)"
      >
        <AppIcon class="cat-icon" :name="cat.icon" />
        <span class="cat-name">{{ cat.name }}</span>
        <span class="cat-count">{{ cat.questions.length }}</span>
      </button>
    </nav>

    <div v-if="!categories.length" class="empty">
      No categories yet. Add a JSON file to <code>src/data/</code>.
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  border-right: 1px solid var(--border);
  background: var(--panel);
  padding: 24px 14px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin: 0 8px 12px;
  font-weight: 600;
}

.cat-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.divider { height: 1px; margin: 8px 4px; background: var(--border); }

.cat-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease;
}

.cat-btn:hover {
  background: var(--hover);
}

.cat-btn.active {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 500;
}

.cat-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.cat-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cat-count {
  font-size: 12px;
  color: var(--muted);
  background: var(--hover);
  padding: 1px 7px;
  border-radius: 10px;
  flex-shrink: 0;
}

.cat-btn.active .cat-count {
  background: rgba(255, 255, 255, 0.12);
  color: var(--accent);
}

.empty {
  padding: 14px;
  color: var(--muted);
  font-size: 13px;
}

.empty code {
  background: var(--hover);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
}

@media (max-width: 720px) {
  .sidebar {
    position: static;
    height: auto;
    padding: 10px;
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }
  .sidebar-header { display: none; }
  .cat-list { flex-direction: row; overflow-x: auto; }
  .cat-btn { width: auto; min-width: max-content; }
  .cat-count, .divider { display: none; }
}
</style>
