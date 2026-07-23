import { createRouter, createWebHistory } from 'vue-router';

import keycloak from "./keycloak";
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import PersonsView from '@/views/PersonsView.vue';
import ImageView from '@/views/ImageView.vue';
import BusquedaView from '@/views/BusquedaView.vue';
import AccessDeniedView from '@/views/AccessDeniedView.vue';

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
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/acceso-denegado',
      name: 'acceso-denegado',
      component: AccessDeniedView,
      meta: { requiresAuth: false }
    },
    {
      path: '/imagenes',
      name: 'imagenes',
      component: ImageView,
      meta: { requiresAuth: true, requiresOperator: true }
    },
    {
      path: '/detecciones',
      name: 'busqueda',
      component: BusquedaView,
      meta: { requiresAuth: true }
    },
    {
      path: '/mapa',
      name: 'mapa',
      component: () => import('@/views/MapaView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/modelos',
      name: 'modelos',
      component: () => import('@/views/ModelosView.vue'),
      meta: { requiresAuth: true }
    }
  ]
});


const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const isAdmin = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  const decoded = parseJwt(token);
  if (!decoded) return false;
  const roles = decoded.realm_access?.roles || [];
  return roles.includes('admin');
};

const isOperatorOrAdmin = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  const decoded = parseJwt(token);
  if (!decoded) return false;
  const roles = decoded.realm_access?.roles || [];
  return roles.includes('admin') || roles.includes('operator');
};

router.beforeEach((to, from, next) => {

    if (to.meta.requiresAuth && !keycloak.authenticated) {
        next("/");
        return;
    }

    if (to.meta.requiresAdmin && !isAdmin()) {
        next("/acceso-denegado");
        return;
    }

    if (to.meta.requiresOperator && !isOperatorOrAdmin()) {
        next("/acceso-denegado");
        return;
    }

    if (to.name === "login" && keycloak.authenticated) {
        next("/dashboard");
        return;
    }

    next();
});

export default router;