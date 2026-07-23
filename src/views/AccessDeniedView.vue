<template>
  <div class="access-denied-page">
    <div class="access-denied-card">
      <div class="icon-circle">
        <v-icon size="64" color="white">mdi-lock</v-icon>
      </div>
      <h1>403</h1>
      <h2>Acceso Denegado</h2>
      <p>No tenés permisos para acceder a esta página.</p>
      <v-btn
        color="primary"
        rounded="xl"
        prepend-icon="mdi-home"
        variant="tonal"
        @click="$router.push('/dashboard')"
      >
        Volver al Dashboard
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.access-denied-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 40px);
}

.access-denied-card {
  text-align: center;
  padding: 48px;
}

.icon-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #ef4444;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 24px;
}

h1 {
  font-size: 72px;
  font-weight: 800;
  color: #ef4444;
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin: 8px 0 12px;
}

p {
  color: #94a3b8;
  font-size: 16px;
  margin-bottom: 32px;
}
</style>
