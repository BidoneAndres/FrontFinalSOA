<template>
  <div class="modelos-page">

    <div class="page-header">
      <div>
        <h1>Modelos IA</h1>
        <p>Modelos de inteligencia artificial disponibles para inferencia.</p>
      </div>
      <v-btn
        color="primary"
        rounded="xl"
        prepend-icon="mdi-refresh"
        variant="tonal"
        :loading="cargando"
        @click="cargarModelos"
      >
        Actualizar
      </v-btn>
    </div>

    <div v-if="cargando && !modelos.length" class="loading-state">
      <v-progress-circular indeterminate color="primary" size="48" />
      <span>Cargando modelos...</span>
    </div>

    <div v-else-if="!modelos.length" class="empty-state">
      <v-icon size="64" color="#475569">mdi-robot-off</v-icon>
      <h3>No hay modelos disponibles</h3>
      <p>No se encontraron modelos de IA registrados en el sistema.</p>
    </div>

    <div v-else class="modelos-grid">
      <div
        v-for="modelo in modelos"
        :key="modelo.id"
        class="modelo-card"
      >
        <div class="modelo-card__icon">
          <v-icon size="28" color="white">mdi-robot</v-icon>
        </div>
        <div class="modelo-card__info">
          <h3 class="modelo-card__name">{{ modelo.id }}</h3>
          <span class="modelo-card__detail">{{ modelo.filename }}</span>
          <span class="modelo-card__task">
            <v-icon size="12" color="#647489">mdi-tag</v-icon>
            {{ modelo.task }}
          </span>
        </div>
      </div>
    </div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/services/apiChaco.js";

const cargando = ref(false);
const modelos = ref([]);

const snackbar = ref({
  show: false,
  text: "",
  color: "success",
});

const mostrarAlerta = (texto, color = "success") => {
  snackbar.value = { show: true, text: texto, color };
};

const cargarModelos = async () => {
  cargando.value = true;
  try {
    const { data } = await api.get("/detections/models");
    modelos.value = data.models || [];
    mostrarAlerta(
      modelos.value.length
        ? `${modelos.value.length} modelos cargados`
        : "No se encontraron modelos",
      modelos.value.length ? "success" : "warning"
    );
  } catch (error) {
    console.error("Error al cargar modelos:", error);
    mostrarAlerta("Error al cargar los modelos", "error");
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarModelos();
});
</script>

<style scoped>
.modelos-page {
  min-height: 100vh;
  background: #0f172a;
  padding: 32px;
  color: white;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.page-header h1 {
  font-size: 34px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 6px;
}

.page-header p {
  color: #94a3b8;
  font-size: 15px;
  margin: 0;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 0;
  text-align: center;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
}

.empty-state p {
  color: #64748b;
  font-size: 14px;
}

.modelos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

.modelo-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 24px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 18px;
  transition: 0.2s;
}

.modelo-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.modelo-card__icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modelo-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modelo-card__name {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.modelo-card__detail {
  font-size: 13px;
  color: #94a3b8;
}

.modelo-card__task {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 2px;
}

@media (max-width: 600px) {
  .modelos-page {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .modelos-grid {
    grid-template-columns: 1fr;
  }
}
</style>
