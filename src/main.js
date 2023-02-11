/* eslint-disable import/order */
import '@/@iconify/icons-bundle'
import layoutsPlugin from '@/plugins/layouts'
import vuetify from '@/plugins/vuetify'
import { loadFonts } from '@/plugins/webfontloader'
import router from '@/router'
import '@core/scss/template/index.scss'
import '@styles/styles.scss'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

loadFonts()

const host = 'mq.dev.responsetech.ltd'
const port = 61619
const protocol = 'wss'

import mqttVueHook from 'mqtt-vue-hook'

// app.use(mqttVueHook, options)
// Create vue app
createApp(App)
  .use(vuetify).use(createPinia()).use(router).use(layoutsPlugin).use(mqttVueHook, `${protocol}://${host}:${port}`, {
    clean: false,
    keepalive: 60,
    clientId: `mqtt_client_${Math.random().toString(16).substring(2, 10)}`,
    connectTimeout: 4000,
    username: 'telemetry', password: 'UWOeDZGUlbd3Q5sWn9xqEG0A',
  }).mount('#app')
