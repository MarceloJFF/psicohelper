<template>
  <div class="editor-wrapper">
    <div v-if="editor" class="editor-toolbar">
      <!-- Botões existentes -->
      <v-btn
        size="small"
        icon
        @click="editor.chain().focus().toggleBold().run()"
        :color="editor.isActive('bold') ? 'primary' : 'grey lighten-1'"
      >
        <v-icon>mdi-format-bold</v-icon>
      </v-btn>
      <v-btn
        size="small"
        icon
        @click="editor.chain().focus().toggleItalic().run()"
        :color="editor.isActive('italic') ? 'primary' : 'grey lighten-1'"
      >
        <v-icon>mdi-format-italic</v-icon>
      </v-btn>
      <v-btn
        size="small"
        icon
        @click="editor.chain().focus().toggleBulletList().run()"
        :color="editor.isActive('bulletList') ? 'primary' : 'grey lighten-1'"
      >
        <v-icon>mdi-format-list-bulleted</v-icon>
      </v-btn>

      <!-- Divisor visual -->
      <v-divider vertical class="mx-2"></v-divider>

      <!-- Novos botões de alinhamento -->
      <v-btn
        size="small"
        icon
        @click="editor.chain().focus().setTextAlign('left').run()"
        :color="editor.isActive({ textAlign: 'left' }) ? 'primary' : 'grey lighten-1'"
      >
        <v-icon>mdi-format-align-left</v-icon>
      </v-btn>
      <v-btn
        size="small"
        icon
        @click="editor.chain().focus().setTextAlign('center').run()"
        :color="editor.isActive({ textAlign: 'center' }) ? 'primary' : 'grey lighten-1'"
      >
        <v-icon>mdi-format-align-center</v-icon>
      </v-btn>
      <v-btn
        size="small"
        icon
        @click="editor.chain().focus().setTextAlign('right').run()"
        :color="editor.isActive({ textAlign: 'right' }) ? 'primary' : 'grey lighten-1'"
      >
        <v-icon>mdi-format-align-right</v-icon>
      </v-btn>
      <v-btn
        size="small"
        icon
        @click="editor.chain().focus().setTextAlign('justify').run()"
        :color="editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'grey lighten-1'"
      >
        <v-icon>mdi-format-align-justify</v-icon>
      </v-btn>
    </div>

    <editor-content
      :editor="editor"
      class="editor-content"
      :style="{ minHeight: `${rows * 24}px` }"
    />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  rows: { type: Number, default: 5 },
  label: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'blur'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: true,
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    }),
  ],
  editorProps: {
    attributes: {
      class: 'v-textarea-style',
      'aria-label': props.label,
    },
  },
  onUpdate: () => emit('update:modelValue', editor.value.getHTML()),
  onBlur: () => emit('blur'),
})

watch(() => props.modelValue, (value) => {
  if (editor.value?.getHTML() !== value) {
    editor.value?.commands.setContent(value, false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.editor-wrapper {
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
  transition: border 0.3s;
}

.editor-wrapper:focus-within {
  border-color: var(--v-primary-base);
  border-width: 2px;
}

.editor-toolbar {
  display: flex;
  gap: 4px;
  padding: 8px;
  background-color: #f0f4ff;
  border-bottom: 1px solid #d3d3d3;
  flex-wrap: wrap;
}

.editor-content {
  padding: 12pt;
  min-height: 120px;
  font-size: 16px;
}

/* Estilos para o conteúdo alinhado */
.editor-content :deep(p) {
  margin: 0 0 10px;
  line-height: 1.6;
}

.editor-content :deep(ul) {
  padding-left: 24px;
  margin: 0 0 10px;
}

.editor-content :deep(li) {
  margin-bottom: 6px;
}

.editor-content :deep(.ProseMirror) {
  outline: none !important;
  transition: box-shadow 0.2s ease;
  border-radius: 4px;
  padding: 8px;
}

.editor-content :deep(.ProseMirror:focus) {
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
}

/* Estilos específicos para alinhamento */
.editor-content :deep(p[style*="text-align: left"]) {
  text-align: left;
}

.editor-content :deep(p[style*="text-align: center"]) {
  text-align: center;
}

.editor-content :deep(p[style*="text-align: right"]) {
  text-align: right;
}

.editor-content :deep(p[style*="text-align: justify"]) {
  text-align: justify;
}
</style>
