<script setup>
import { computed } from 'vue'
import { renderMarkdown } from '../utils/markdown.js'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  item: { type: Object, required: true },
  open: { type: Boolean, default: false },
  progress: { type: Object, default: () => ({ status: 'new', confidence: 0 }) }
})

defineEmits(['toggle', 'rate', 'status'])

const html = computed(() => props.open ? renderMarkdown(props.item.answer) : '')
</script>

<template>
  <li class="item" :class="{ open }">
    <button class="head" :aria-expanded="open" @click="$emit('toggle')">
      <AppIcon class="chevron" :class="{ rotated: open }" name="chevron" :size="15" />
      <span class="q">
        <span v-if="item.categoryName" class="context"><AppIcon :name="item.categoryIcon" :size="12" /> {{ item.categoryName }} · {{ item.level }} · {{ item.type }}</span>
        {{ item.question }}
      </span>
      <span class="status" :class="progress.status">{{ progress.status }}</span>
    </button>
    <div v-show="open" class="body">
      <div class="markdown" v-html="html" />
      <div class="review">
        <span>How confident was your answer?</span>
        <button
          v-for="score in 5"
          :key="score"
          :class="{ active: progress.confidence === score }"
          :aria-label="`Confidence ${score} out of 5`"
          @click="$emit('rate', score)"
        >{{ score }}</button>
        <button class="later" @click="$emit('status', 'learning')">Review later</button>
      </div>
    </div>
  </li>
</template>

<style scoped>
.item {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.12s ease;
}

.item.open {
  border-color: var(--accent-border);
}

.head {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 13px 16px;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 15px;
  text-align: left;
  cursor: pointer;
  font-weight: 500;
}

.head:hover {
  background: var(--hover);
}

.chevron {
  color: var(--muted);
  transition: transform 0.15s ease;
  display: inline-block;
  flex-shrink: 0;
}

.chevron.rotated {
  transform: rotate(90deg);
}

.q {
  flex: 1;
}
.context { display: flex; align-items: center; gap: 4px; margin-bottom: 3px; color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
.status { padding: 2px 7px; border-radius: 10px; color: var(--muted); background: var(--hover); font-size: 10px; text-transform: uppercase; }
.status.known { color: #9ece6a; }
.status.learning { color: #e0af68; }

.body {
  padding: 4px 18px 18px 38px;
  border-top: 1px solid var(--border);
  background: var(--panel-deep);
}

.markdown :deep(p) { margin: 10px 0; line-height: 1.6; }
.markdown :deep(ul), .markdown :deep(ol) { padding-left: 22px; line-height: 1.6; }
.markdown :deep(li) { margin: 4px 0; }
.markdown :deep(code) {
  background: var(--hover);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
}
.markdown :deep(pre) {
  background: #0d1117;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px 14px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
}
.markdown :deep(pre code) {
  background: transparent;
  padding: 0;
  font-size: inherit;
  color: #c9d1d9;
}
.markdown :deep(blockquote) {
  border-left: 3px solid var(--accent-border);
  margin: 12px 0;
  padding: 4px 14px;
  color: var(--muted);
}
.markdown :deep(a) { color: var(--accent); text-decoration: none; }
.markdown :deep(a:hover) { text-decoration: underline; }
.markdown :deep(table) {
  border-collapse: collapse;
  margin: 12px 0;
}
.markdown :deep(th), .markdown :deep(td) {
  border: 1px solid var(--border);
  padding: 6px 10px;
}
.review { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border); color: var(--muted); font-size: 12px; }
.review button { min-width: 28px; padding: 4px 8px; border: 1px solid var(--border); border-radius: 5px; color: var(--text); background: var(--panel); cursor: pointer; }
.review button.active { border-color: var(--accent); color: var(--accent); }
.review .later { margin-left: auto; }
</style>
