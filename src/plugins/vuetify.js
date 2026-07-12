import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  components,
  directives,

  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },

  theme: {
    defaultTheme: 'visionDark',

    themes: {
      visionDark: {
        dark: true,

        colors: {
          background: '#0F172A',
          surface: '#1E293B',
          primary: '#3B82F6',
        },
      },
    },
  },
})