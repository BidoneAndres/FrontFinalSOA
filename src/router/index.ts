import { createRouter, createWebHistory } from 'vue-router';

import keycloak from "./keycloak";
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import PersonsView from '@/views/PersonsView.vue';
import ImageView from '@/views/ImageView.vue';
import BusquedaView from '@/views/BusquedaView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/personas',
      name: 'personas',
      component: PersonsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/imagenes',
      name: 'imagenes',
      component: ImageView,
      meta: { requiresAuth: true }
    },
    {
      path: '/detecciones',
      name: 'busqueda',
      component: BusquedaView,
      meta: { requiresAuth: true }
    },
    {
      path: '/modelos',
      name: 'modelos',
      component: () => import('@/views/MapaView.vue'),
      meta: { requiresAuth: true }
    }
  ]
});


router.beforeEach((to, from, next) => {

    if (to.meta.requiresAuth && !keycloak.authenticated) {
        next("/");
        return;
    }

    if (to.name === "login" && keycloak.authenticated) {
        next("/dashboard");
        return;
    }

    next();
});

export default router;