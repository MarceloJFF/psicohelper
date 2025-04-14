import {createApp, h} from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import colors from 'vuetify/util/colors'

const app = createApp(App)

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi: {
        component: (props: any) => h('i', { class: `mdi ${props.icon}` }),
      },
    },
  },
  theme: {

    defaultTheme: 'light'
  }
})

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
