<template>
  <div class="editor-wrapper">
    <label class="v-label">{{ label }}</label>

    <!-- Toolbar -->
    <div class="toolbar border pa-2">
      <button @click="toggleBold" :class="{ active: isActive('bold') }"><strong>B</strong></button>
      <button @click="toggleItalic" :class="{ active: isActive('italic') }"><em>I</em></button>
      <button @click="toggleBulletList" :class="{ active: isActive('bulletList') }">• Lista</button>
      <button @click="toggleOrderedList" :class="{ active: isActive('orderedList') }">1. Lista</button>
    </div>

    <!-- Editor content -->
    <EditorContent :editor="editor" class="tiptap-styled pa-12" />
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = defineProps({
  modelValue: String,
  label: String
})
const emit = defineEmits(['update:modelValue'])

const initialContent = `
<p>Na sessão de hoje, focamos em compreender melhor a natureza da ansiedade que você tem enfrentado, João, e começamos a explorar estratégias práticas para gerenciá-la de maneira eficaz. Começamos a sessão discutindo seus sintomas de ansiedade e como eles têm afetado sua vida cotidiana. Você compartilhou que tem sentido uma preocupação constante em relação a várias áreas da sua vida, o que tem causado tensão física e mental. Mencionou também dificuldades em relaxar e em concentrar-se em tarefas importantes devido à constante sensação de apreensão.</p>
`

const editor = ref(
  new Editor({
    extensions: [StarterKit],
    content: props.modelValue || initialContent,
  })
)

watch(() => editor.value?.getHTML(), (val) => {
  emit('update:modelValue', val)
})

watch(() => props.modelValue, (val) => {
  if (val !== editor.value?.getHTML()) {
    editor.value?.commands.setContent(val || initialContent)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

// Toolbar actions
const toggleBold = () => editor.value?.chain().focus().toggleBold().run()
const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run()
const toggleBulletList = () => editor.value?.chain().focus().toggleBulletList().run()
const toggleOrderedList = () => editor.value?.chain().focus().toggleOrderedList().run()
const isActive = (format: string) => editor.value?.isActive(format)
</script>

<style scoped>
.editor-wrapper {
  margin-top: 16px;
}

.v-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  display: block;
  margin-bottom: 8px;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.toolbar button {
  background: #f4f4f4;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
}

.toolbar button.active {
  background-color: #d1eaff;
  border-color: #3399ff;
}

.tiptap-styled {
  border: 1px solid #ccc;
  border-radius: 6px;
  min-height: 200px;
  padding: 12px;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}
</style>
