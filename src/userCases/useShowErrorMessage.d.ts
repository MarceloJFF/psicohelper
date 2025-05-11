import { Ref } from 'vue'

export interface ShowErrorMessage {
  show: Ref<boolean>
  message: Ref<string>
  color: Ref<string>
  showError: (msg: string) => void
}

export function useShowErrorMessage(): ShowErrorMessage 