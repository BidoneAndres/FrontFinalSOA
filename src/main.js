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
  onLoad: "check-sso",
  checkLoginIframe: false,
  pkceMethod: "S256",
})
  .then(async (authenticated) => {
    if (authenticated) {
      localStorage.setItem("token", keycloak.token);
      await router.push("/dashboard");
    }
    app.mount("#app");
  })
  .catch((error) => {
    console.warn("Keycloak init failed:", error);
    app.mount("#app");
  });
