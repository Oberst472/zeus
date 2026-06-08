import { readdir, readFile } from 'node:fs/promises'

const directory = new URL('../src/data/', import.meta.url)
const files = (await readdir(directory)).filter(file => file.endsWith('.json'))
const ids = new Set()
const questions = new Set()
const errors = []
let questionCount = 0

for (const file of files) {
  const data = JSON.parse(await readFile(new URL(file, directory), 'utf8'))
  if (!data.name) errors.push(`${file}: missing category name`)
  if (!Array.isArray(data.questions)) errors.push(`${file}: questions must be an array`)
  const targetCount = data.targetCount || 100
  if (data.questions?.length !== targetCount) errors.push(`${file}: expected ${targetCount} questions, found ${data.questions?.length}`)

  for (const [index, question] of (data.questions || []).entries()) {
    const location = `${file} question ${index + 1}`
    if (!question.id) errors.push(`${location}: missing id`)
    if (!question.question) errors.push(`${location}: missing question`)
    if (!question.answer) errors.push(`${location}: missing answer`)
    if ((question.answer || '').length < 120) errors.push(`${location}: answer is too short for a Senior question`)
    if (!question.type) errors.push(`${location}: missing type`)
    if (!['middle', 'senior'].includes(question.level)) errors.push(`${location}: level must be middle or senior`)
    if (!Array.isArray(question.tags) || !question.tags.length) errors.push(`${location}: missing tags`)
    if (ids.has(question.id)) errors.push(`${location}: duplicate id "${question.id}"`)
    if (questions.has(question.question)) errors.push(`${location}: duplicate question "${question.question}"`)
    ids.add(question.id)
    questions.add(question.question)
    questionCount++
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Validated ${questionCount} questions across ${files.length} categories.`)
}
