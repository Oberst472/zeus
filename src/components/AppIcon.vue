<script setup>
import {
  Activity,
  Binary,
  BookOpen,
  Boxes,
  Braces,
  ChartNoAxesCombined,
  ChevronRight,
  Clock3,
  Compass,
  Container,
  Database,
  GitBranch,
  Layers3,
  LibraryBig,
  MonitorCog,
  Network,
  RotateCcw,
  Server,
  ServerCog,
  ShieldCheck,
  Workflow,
  Zap
} from '@lucide/vue'

defineProps({
  name: { type: String, default: 'book-open' },
  size: { type: Number, default: 18 }
})

const icons = {
  activity: Activity,
  algorithms: Binary,
  architecture: Workflow,
  'book-open': BookOpen,
  categories: LibraryBig,
  chevron: ChevronRight,
  database: Database,
  devops: ChartNoAxesCombined,
  docker: Container,
  frontend: MonitorCog,
  git: GitBranch,
  javascript: Braces,
  layers: Layers3,
  leadership: Compass,
  nodejs: Server,
  promises: Clock3,
  repeat: RotateCcw,
  security: ShieldCheck,
  server: ServerCog,
  system: Network,
  typescript: Boxes,
  vue: Layers3,
  zap: Zap
}
</script>

<template>
  <component :is="icons[name] || BookOpen" :size="size" :stroke-width="1.8" aria-hidden="true" />
</template>
