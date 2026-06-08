import { computed, ref, shallowRef } from 'vue'

const modules = import.meta.glob('../data/*.json', { eager: true, import: 'default' })

function slugFromPath(path) {
  return path.split('/').pop().replace(/\.json$/, '')
}

const rawCategories = Object.entries(modules)
  .map(([path, data]) => {
    const slug = slugFromPath(path)
    return {
      slug,
      name: data.name || slug,
      icon: data.icon || 'book-open',
      order: data.order ?? 100,
      questions: (data.questions || []).map((q, i) => ({
        id: q.id || `${slug}-${i}`,
        categorySlug: slug,
        categoryName: data.name || slug,
        categoryIcon: data.icon || 'book-open',
        question: String(q.question || ''),
        answer: String(q.answer || ''),
        type: q.type || 'knowledge',
        level: q.level || 'senior',
        tags: Array.isArray(q.tags) ? q.tags : []
      }))
    }
  })
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

const STORAGE_KEY = 'zeus.selectedCategory'
let initial = null
try {
  initial = localStorage.getItem(STORAGE_KEY)
} catch {
  // Storage may be unavailable in privacy-restricted environments.
}
const fallback = rawCategories[0]?.slug ?? null
const selectedSlug = ref(rawCategories.some(c => c.slug === initial) ? initial : fallback)

export function useCategories() {
  const categories = shallowRef(rawCategories)
  const allQuestions = computed(() => categories.value.flatMap(category => category.questions))

  const selectedCategory = computed(() =>
    categories.value.find(c => c.slug === selectedSlug.value) || null
  )

  function selectCategory(slug) {
    selectedSlug.value = slug
    try {
      localStorage.setItem(STORAGE_KEY, slug)
    } catch {
      // Selection still works for the current session.
    }
  }

  return {
    categories,
    allQuestions,
    selectedSlug,
    selectedCategory,
    selectCategory
  }
}
