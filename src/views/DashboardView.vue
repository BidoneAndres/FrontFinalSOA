<template>
  <v-container fluid class="px-6 py-8">
    <h1 class="text-h4 font-weight-bold text-white mb-6">Dashboard</h1>

    <!-- FILA 1: KPIs (Métricas principales) -->
    <v-row>
      <v-col cols="12" sm="6" md="3" v-for="kpi in kpis" :key="kpi.title">
        <v-card theme="dark" class="rounded-xl border-slate padded-card" elevation="2">
          <div class="d-flex align-center">
            <v-avatar :color="kpi.color" size="48" class="mr-4">
              <v-icon color="white">{{ kpi.icon }}</v-icon>
            </v-avatar>
            <div>
              <p class="text-caption text-grey-lighten-1 mb-0">{{ kpi.title }}</p>
              <h2 class="text-h5 font-weight-bold text-white mb-0">{{ kpi.value }}</h2>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- FILA 2: Gráficos y Mapa -->
    <v-row class="mt-4">
      <!-- Gráfico de Líneas -->
      <v-col cols="12" md="8">
        <v-card theme="dark" class="rounded-xl border-slate padded-card h-100">
          <h3 class="text-h6 font-weight-medium text-white mb-4">Detecciones (últimos 7 días)</h3>
          <div style="height: 280px; position: relative;">
            <Line :data="lineData" :options="lineOptions" />
          </div>
        </v-card>
      </v-col>
      
      <!-- Gráfico de Dona -->
      <v-col cols="12" md="4">
        <v-card theme="dark" class="rounded-xl border-slate padded-card h-100">
          <h3 class="text-h6 font-weight-medium text-white mb-4">Detecciones por clase</h3>
          <div class="d-flex justify-center" style="height: 280px; position: relative;">
            <Doughnut :data="doughnutData" :options="doughnutOptions" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- FILA 3: Última detección, Consultas y Acciones -->
    <v-row class="m-4">
      <!-- Última Detección -->
      <v-col cols="12" md="4">
        <v-card theme="dark" class="rounded-xl border-slate padded-card h-100">
          <h3 class="text-h6 font-weight-medium text-white mb-4">Última Detección</h3>
          <v-img
            src="https://via.placeholder.com/400x250"
            height="180"
            cover
            class="rounded-lg mb-4"
          ></v-img>
          <div>
            <p class="mb-1"><strong class="text-blue-lighten-2">Fecha:</strong> 17/07/2026 15:23</p>
            <p class="mb-0"><strong class="text-blue-lighten-2">Ubicación:</strong> -34.6037, -58.3816</p>
          </div>
        </v-card>
      </v-col>

      <!-- Consultas Recientes -->
      <v-col cols="12" md="5">
        <v-card theme="dark" class="rounded-xl border-slate padded-card h-100">
          <h3 class="text-h6 font-weight-medium text-white mb-4">Consultas Recientes</h3>
          <v-table theme="dark" density="compact" class="bg-transparent">
            <thead>
              <tr>
                <th class="text-left text-grey">Fecha</th>
                <th class="text-left text-grey">Filtro</th>
                <th class="text-left text-grey">Resultados</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 3" :key="i">
                <td class="py-2">17/07/2026</td>
                <td class="py-2">Clase: Persona, lat: -34</td>
                <td class="py-2">124</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <!-- Acciones Rápidas -->
      <v-col cols="12" md="3">
        <v-card theme="dark" class="rounded-xl border-slate padded-card h-100">
          <h3 class="text-h6 font-weight-medium text-white mb-4">Acciones</h3>
          <div class="d-flex flex-column gap-3">
            <v-btn color="#3B82F6" variant="flat" prepend-icon="mdi-cloud-upload" block>Subir Imagen</v-btn>
            <v-btn color="#10B981" variant="flat" prepend-icon="mdi-magnify" block>Consultar</v-btn>
            <v-btn color="#8B5CF6" variant="flat" prepend-icon="mdi-account-group" block>Gestionar Personas</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { Line, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registramos los módulos de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- 1. DATOS DE LAS TARJETAS (KPIs) ---
const kpis = ref([
  { title: 'Imágenes procesadas', value: '32,451', icon: 'mdi-image-multiple', color: 'blue' },
  { title: 'Detecciones', value: '5,231', icon: 'mdi-target', color: 'green' },
  { title: 'Personas reconocidas', value: '1,245', icon: 'mdi-face-recognition', color: 'purple' },
  { title: 'Tasa reconocimiento', value: '98.5%', icon: 'mdi-chart-line', color: 'orange' }
]);

// --- 2. CONFIGURACIÓN DEL GRÁFICO DE LÍNEAS (Evolución) ---
const lineData = ref({
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  datasets: [
    {
      label: 'Detecciones Totales',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      pointBackgroundColor: '#1E293B',
      pointBorderColor: '#3B82F6',
      pointRadius: 4,
      data: [120, 150, 180, 140, 210, 280, 250],
      tension: 0.4,
      fill: true
    }
  ]
});

const lineOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  color: '#94A3B8',
  plugins: {
    legend: {
      labels: { color: '#94A3B8' }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(55, 65, 81, 0.5)' },
      ticks: { color: '#94A3B8' }
    },
    y: {
      grid: { color: 'rgba(55, 65, 81, 0.5)' },
      ticks: { color: '#94A3B8' }
    }
  }
});

// --- 3. CONFIGURACIÓN DEL GRÁFICO DE DONA (Clases) ---
const doughnutData = ref({
  labels: ['Persona', 'Vehículo', 'Bicicleta', 'Animal', 'Otros'],
  datasets: [
    {
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      borderColor: '#1E293B',
      borderWidth: 2,
      data: [45, 25, 15, 10, 5]
    }
  ]
});

const doughnutOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  color: '#94A3B8',
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#94A3B8',
        usePointStyle: true,
        padding: 20
      }
    }
  },
  cutout: '70%'
});
</script>

<style scoped>
/* Estilos generales de la tarjeta */
.border-slate {
  border: 1px solid #374151;
  background-color: #1E293B !important;
}

/* CLASE CLAVE PARA FORZAR EL ESPACIADO INTERNO */
.padded-card {
  padding: 24px !important;
}

/* Espaciado para la columna de botones */
.gap-3 {
  gap: 16px;
}
</style>