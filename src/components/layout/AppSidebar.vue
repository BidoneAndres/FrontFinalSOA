<script setup>
import { computed, ref, onMounted } from "vue";
import { useLayoutStore } from "@/stores/layout";
import SidebarItem from "./SidebarItem.vue";

const layout = useLayoutStore();

const collapsed = computed(() => !layout.sidebar);

// 1. Variables reactivas para el usuario y su rol/cargo
const userName = ref("Invitado");
const userRole = ref("Usuario");

// 2. Función nativa para decodificar el JWT
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

onMounted(() => {
  const token = localStorage.getItem('token');
  
  if (token) {
    const decodedToken = parseJwt(token);
    
    if (decodedToken) {
      // Keycloak suele guardar el nombre en 'preferred_username' o 'name'
      userName.value = decodedToken.name || decodedToken.preferred_username || "Usuario";
      
      // Si configuraste roles en Keycloak, suelen venir en 'realm_access.roles'
      // Esto es un ejemplo por si querés mostrar si es Admin o no:
      const roles = decodedToken.realm_access?.roles || [];
      if (roles.includes("admin") || roles.includes("ADMIN")) {
        userRole.value = "Administrador";
      } else {
        userRole.value = "Operador"; // Rol por defecto si no es admin
      }
    }
  }
});

const menu = [
  {
    title: "Dashboard",
    icon: "mdi-view-dashboard",
    to: "/",
  },
  {
    title: "Detecciones",
    icon: "mdi-target",
    to: "/detecciones",
  },
  {
    title: "Consultas",
    icon: "mdi-magnify",
    to: "/consultas",
  },
  {
    title: "Personas",
    icon: "mdi-account-group",
    to: "/personas",
  },
  {
    title: "Modelos",
    icon: "mdi-brain", // Un ícono de cerebro queda genial para IA/Modelos
    to: "/modelos",
  },
  {
    title: "Subir Imagen",
    icon: "mdi-cloud-upload",
    to: "/imagenes",
  },
  {
    title: "Monitoreo",
    icon: "mdi-monitor-dashboard",
    to: "/monitoreo",
  },
  {
    title: "Configuración",
    icon: "mdi-cog",
    to: "/configuracion",
  }
];
</script>

<template>
  <aside
    class="sidebar"
    :class="{ collapsed }"
  >
    <div class="logo">
      <div class="logo-circle">
        AI
      </div>
      <Transition name="fade">
        <h2 v-if="!collapsed">
          VisionAI
        </h2>
      </Transition>
    </div>

    <div class="menu">
      <SidebarItem
        v-for="item in menu"
        :key="item.title"
        v-bind="item"
        :collapsed="collapsed"
      />
    </div>

    <div class="user">
      <v-avatar size="40">
        <v-img src="https://i.pravatar.cc/100"></v-img>
      </v-avatar>

      <Transition name="fade">
        <div
          v-if="!collapsed"
          class="user-info"
        >
          <strong class="user-name">{{ userName }}</strong>
          <small>{{ userRole }}</small>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<style scoped>
.sidebar{
    width: 260px;
    height: 100vh;
    background: #111827;
    display: flex;
    flex-direction: column;
    padding: 18px;
    transition: margin-left 0.3s ease, opacity 0.3s ease;
    border-right: 1px solid #253041;
}

.collapsed{
    margin-left: -300px; 
    opacity: 0; 
    padding: 0;
}

.logo{
    display:flex;
    align-items:center;
    gap:14px;
    margin-bottom:40px;
}

.logo-circle{
    width:46px;
    height:46px;
    border-radius:14px;
    background:#3B82F6;
    display:flex;
    justify-content:center;
    align-items:center;
    color:white;
    font-weight:bold;
}

.logo h2{
    color:white;
}

.menu{
    flex:1;
    display:flex;
    flex-direction:column;
    gap:6px;
}

.user{
    display:flex;
    align-items:center;
    gap:12px;
    border-top:1px solid #263244;
    padding-top:18px;
}

.user-info{
    display:flex;
    flex-direction:column;
    color:white;
}

/* Estilo para que el nombre empiece con mayúscula */
.user-name {
    text-transform: capitalize;
}

small{
    color:#94A3B8;
}
</style>