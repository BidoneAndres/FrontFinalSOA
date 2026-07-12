<template>
  <div class="dashboard-container">
    
    <v-row>
      <v-col cols="12" sm="6" md="3" v-for="i in 4" :key="i">
        <div class="custom-card kpi-card">
          <div class="placeholder-content">KPI {{ i }}</div>
        </div>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="5">
        <div class="custom-card chart-card">
          <h3>Detecciones (últimos 7 días)</h3>
          <div class="placeholder-content chart-placeholder">
            Gráfico de líneas
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="3">
        <div class="custom-card chart-card">
          <h3>Por clase</h3>
          <div class="placeholder-content chart-placeholder">
            Gráfico circular
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <div class="custom-card chart-card">
          <h3>Mapa de detecciones</h3>
          <div class="placeholder-content chart-placeholder">
            Mapa interactivo
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <div class="custom-card bottom-card">
          <h3>Última detección</h3>
          <div class="placeholder-content bottom-placeholder">
            Imagen + Datos
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <div class="custom-card bottom-card">
          <h3>Consultas recientes</h3>
          <div class="placeholder-content bottom-placeholder">
            Tabla de datos
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="4">
        <div class="custom-card bottom-card">
          <h3>Acciones rápidas</h3>
          <div class="placeholder-content bottom-placeholder">
            Lista de botones
          </div>
        </div>
      </v-col>
    </v-row>

  </div>
</template>

<style scoped>
.dashboard-container {
  /* Un poco de padding general para que respire */
  padding: 24px;
}

/* El estilo base para todas las tarjetas del dashboard */
.custom-card {
  background: #1E293B; /* Mismo color que tu Navbar */
  border: 1px solid #243041;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,.10);
  height: 100%; /* Para que las tarjetas de una misma fila midan lo mismo */
  display: flex;
  flex-direction: column;
}

.custom-card h3 {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
}

/* Contenedores falsos (placeholders) donde luego irá tu info del backend */
.placeholder-content {
  background: #111827; /* Mismo color oscuro que tu Sidebar */
  border: 1px dashed #334155;
  border-radius: 8px;
  color: #94A3B8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  flex-grow: 1; /* Ocupa el espacio sobrante de la tarjeta */
}

/* Alturas simuladas para dar la estructura visual */
.kpi-card .placeholder-content {
  min-height: 80px;
}
.chart-placeholder {
  min-height: 250px;
}
.bottom-placeholder {
  min-height: 300px;
}
</style>