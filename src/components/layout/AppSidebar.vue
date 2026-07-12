<script setup>
import { computed } from "vue";
import { useLayoutStore } from "@/stores/layout";
import SidebarItem from "./SidebarItem.vue";

const layout = useLayoutStore();

const collapsed = computed(() => !layout.sidebar);

const menu = [
  {
    title: "Dashboard",
    icon: "mdi-view-dashboard",
    to: "/",
  },
  {
    title: "Detecciones",
    icon: "mdi-image-search",
    to: "/detecciones",
  },
  {
    title: "Cámaras",
    icon: "mdi-camera",
    to: "/camaras",
  },
  {
    title: "Personas",
    icon: "mdi-account-group",
    to: "/personas",
  },

  {
    title: "Mapa",
    icon: "mdi-map-marker",
    to: "/mapa",
  },
  {
    title: "Estadísticas",
    icon: "mdi-chart-box",
    to: "/estadisticas",
  },
  {
    title: "Configuración",
    icon: "mdi-cog",
    to: "/configuracion",
  },
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
          <strong>Andrés</strong>
          <small>Administrador</small>
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
    
    /* Le damos una transición suave al margen y a la opacidad */
    transition: margin-left 0.3s ease, opacity 0.3s ease;
    border-right: 1px solid #253041;
}

.collapsed{

    margin-left: -300px; 
    
    /* Lo desvanecemos para que desaparezca como magia */
    opacity: 0; 
    
    /* Quitamos el padding para que no ocupe espacio invisible */
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

small{

    color:#94A3B8;

}

</style>