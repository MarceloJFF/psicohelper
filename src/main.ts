import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useStoreAuth } from '/src/stores/storeAuth'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/main.css'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

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
    defaultTheme: 'light', // ou 'dark', dependendo da sua preferência
    themes: {
      light: {
        dark: false, // define se o tema é escuro ou claro
        colors: {
          // Aqui você pode definir outras cores, se necessário
        },
        variables: {
          // Personalizar variáveis de tema, se necessário
        },
        typography: {
          fontFamily: 'Montserrat, sans-serif',  // Defina a fonte Montserrat aqui
        },
      },
    },
  },
})

app.use(createPinia())
app.use(router)
app.use(vuetify)


const storeAuth = useStoreAuth()
await storeAuth.init()

app.mount('#app')
