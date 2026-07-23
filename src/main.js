import { createApp } from 'vue'

import App from './App.vue'

import router from './router'

import vuetify from './plugins/vuetify'

import { createPinia } from "pinia"

import keycloak from './router/keycloak'

import './assets/styles/global.scss'

const app = createApp(App);

app.use(router);
app.use(vuetify);
app.use(createPinia());

app.config.globalProperties.$keycloak = keycloak;
app.provide("keycloak", keycloak);

keycloak.init({
  onLoad: "none",
  checkLoginIframe: false,
  pkceMethod: "S256",
  redirectUri: window.location.origin,
}).then(() => {
  app.mount("#app");
});
