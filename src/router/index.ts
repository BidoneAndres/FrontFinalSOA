import { createRouter, createWebHistory } from 'vue-router';
import { components } from 'vuetify/dist/vuetify.js';

import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import PersonsView from '@/views/PersonsView.vue';
import ImageView from '@/views/ImageView.vue';
import BusquedaView from '@/views/BusquedaView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      
      meta: { requiresAuth: false } 
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      
      meta: { requiresAuth: true } 
    },
    {
      path: '/personas',
      name: 'personas',
      component: PersonsView,
    },
    {
      path: '/imagenes',
      name: 'imagenes',
      component: ImageView,
    },
    {
      path: '/detecciones',
      name: 'busqueda',
      component: BusquedaView,
    }
  ]
});


router.beforeEach((to, from, next) => {

  const token = localStorage.getItem('token');

  
  if (to.meta.requiresAuth && !token) {
    
    next({ name: 'login' });
  } 
  
  else if (to.name === 'login' && token) {
    
    next({ name: 'dashboard' });
  } 
  
  else {
    next();
  }
});

export default router;