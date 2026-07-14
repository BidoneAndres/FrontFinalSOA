<script setup>
import DefaultLayout from "@/layouts/DefaultLayout.vue";
</script>

<template>
  <DefaultLayout v-if="$route.name !== 'login'" />
  
  <router-view v-else />
</template>