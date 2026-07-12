<template>

<div class="navbar">

    <div class="left">

        <v-btn
            icon="mdi-menu"
            variant="text"
            @click="layout.sidebar = !layout.sidebar"
        />

        <h2>Dashboard</h2>

    </div>

    <div class="right">

        <v-btn
            icon="mdi-bell-outline"
            variant="text"
        />

        <v-avatar>

            <v-img src="https://i.pravatar.cc/100"/>

        </v-avatar>

    </div>

</div>

</template>

<script setup>
import { useLayoutStore } from "@/stores/layout";


const layout = useLayoutStore();
</script>

<style scoped>

.navbar {
    height: 72px;
    background: #1E293B;
    
    /* 1. Eliminamos el border-radius para que quede recta */
    border-radius: 0; 
    
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    
    /* 2. En lugar de un borde completo, le dejamos solo el de abajo 
       para que separe el navbar del contenido, pero se conecte arriba */
    border-bottom: 1px solid #243041;
    
    /* 3. Suavizamos un poco la sombra para que se vea más moderna */
    box-shadow: 0 4px 15px rgba(0,0,0,.10);
}

.left{

    display:flex;

    align-items:center;

    gap:16px;

}

.right{

    display:flex;

    align-items:center;

    gap:12px;

}

h2{

    color:white;

    font-weight:600;

}

</style>