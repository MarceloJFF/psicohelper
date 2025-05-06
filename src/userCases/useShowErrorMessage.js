// src/composables/useShowErrorMessage.js
import { ref } from 'vue'

const show = ref(false)
const message = ref('')
const color = ref('error')

export function useShowErrorMessage() {
  const showError = (msg) => {
    message.value = msg
    color.value = 'error'
    show.value = true
  }

  return {
    show,
    message,
    color,
    showError
  }
}
