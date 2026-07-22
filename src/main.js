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

keycloak
  .init({
    onLoad: "check-sso",
    checkLoginIframe: false,
    pkceMethod: "S256",
  })
  .then(async (authenticated) => {
    console.log("Authenticated:", authenticated);

    if (authenticated) {
      localStorage.setItem("token", keycloak.token);

      console.log("Antes del push");

      await router.push("/dashboard");

      console.log("Después del push");
      console.log(router.currentRoute.value.fullPath);
    }

    app.mount("#app");
  });