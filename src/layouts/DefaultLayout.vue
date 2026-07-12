<script setup>
import { ref } from 'vue'
import AppNavbar from '../components/layout/AppNavbar.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'

const drawer = ref(true)
</script>

<template>
  <div class="layout">

    <AppSidebar />

    <main class="main">

      <AppNavbar />

      <div class="content">

        <router-view />

      </div>

    </main>

  </div>
</template>

<style scoped>

.layout{

    display:flex;

    height:100vh;

    background:#0F172A;

    padding:16px;

    gap:16px;

}

.main{

    flex:1;

    display:flex;

    flex-direction:column;

    gap:16px;

    overflow:hidden;

}

.content{

    flex:1;

    background:#1E293B;

    border-radius:20px;

    padding:24px;

    overflow:auto;

}

</style>