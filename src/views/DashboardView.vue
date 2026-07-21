<template>
  <div class="dashboard-page">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Vista general del sistema de detecciones.</p>
      </div>
      <v-btn
        color="primary"
        rounded="xl"
        prepend-icon="mdi-refresh"
        variant="tonal"
        :loading="cargando"
        @click="cargarDatos"
      >
        Actualizar
      </v-btn>
    </div>

    <!-- FILA 1: KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card" v-for="kpi in kpis" :key="kpi.title">
        <div class="kpi-icon" :class="`kpi-icon--${kpi.color}`">
          <v-icon size="22" color="white">{{ kpi.icon }}</v-icon>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">{{ kpi.title }}</span>
          <span class="kpi-value">{{ kpi.value }}</span>
        </div>
      </div>
    </div>

    <!-- FILA 2: Mapa mini + Clases -->
    <v-row class="mt-6">

      <!-- Mapa mini read-only -->
      <v-col cols="12" md="8">
        <div class="dash-card">
          <div class="dash-card__header">
            <v-icon size="20" color="#3b82f6">mdi-map</v-icon>
            <h3>Mapa de Detecciones</h3>
          </div>
          <div class="mini-map-container">
            <l-map
              ref="miniMapRef"
              :zoom="11"
              :center="[-31.42, -64.18]"
              :use-global-leaflet="false"
              :zoom-control="false"
              :scroll-wheel-zoom="false"
              :dragging="false"
              :touch-zoom="false"
              :double-click-zoom="false"
              :keyboard="false"
              class="mini-map"
            >
              <l-tile-layer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution=""
                layer-type="base"
              />
              <l-marker
                v-for="det in markers"
                :key="det.frameId"
                :lat-lng="[det.latitud, det.longitud]"
              >
                <l-icon
                  :icon-size="[20, 26]"
                  :icon-anchor="[10, 26]"
                >
                  <div class="mini-marker"></div>
                </l-icon>
              </l-marker>
            </l-map>
          </div>
        </div>
      </v-col>

      <!-- Desglose por clase -->
      <v-col cols="12" md="4">
        <div class="dash-card h-100">
          <div class="dash-card__header">
            <v-icon size="20" color="#8b5cf6">mdi-tag-multiple</v-icon>
            <h3>Por Clase</h3>
          </div>
          <div class="class-list">
            <div
              v-for="clase in clasesPorCantidad"
              :key="clase.nombre"
              class="class-item"
            >
              <div class="class-item__header">
                <span class="class-item__name">{{ clase.nombre }}</span>
                <span class="class-item__count">{{ clase.cantidad }}</span>
              </div>
              <div class="class-item__bar">
                <div
                  class="class-item__bar-fill"
                  :style="{ width: clase.porcentaje + '%' }"
                ></div>
              </div>
            </div>
            <div v-if="!clasesPorCantidad.length" class="class-empty">
              Sin datos disponibles
            </div>
          </div>
        </div>
      </v-col>

    </v-row>

    <!-- FILA 3: Última detección + Últimas detecciones + Acciones -->
    <v-row class="mt-6">

      <!-- Última Detección -->
      <v-col cols="12" md="4">
        <div class="dash-card h-100">
          <div class="dash-card__header">
            <v-icon size="20" color="#10b981">mdi-camera</v-icon>
            <h3>Última Detección</h3>
          </div>
          <div v-if="ultimaDeteccion" class="last-detection">
            <div class="last-detection__image">
              <img
                :src="imagenUltima"
                alt="Última detección"
                @error="onImgError"
              />
            </div>
            <div class="last-detection__info">
              <div class="last-detection__row">
                <v-icon size="14" color="#94a3b8">mdi-identifier</v-icon>
                <span>{{ truncateId(ultimaDeteccion.frameId) }}</span>
              </div>
              <div class="last-detection__row">
                <v-icon size="14" color="#94a3b8">mdi-cctv</v-icon>
                <span>{{ ultimaDeteccion.metadata?.sensor || 'N/A' }}</span>
              </div>
              <div class="last-detection__row" v-if="ultimaDeteccion.metadata?.latitud">
                <v-icon size="14" color="#94a3b8">mdi-map-marker</v-icon>
                <span>{{ Number(ultimaDeteccion.metadata.latitud).toFixed(4) }}, {{ Number(ultimaDeteccion.metadata.longitud).toFixed(4) }}</span>
              </div>
              <div class="last-detection__classes">
                <span
                  v-for="(c, i) in clasesUnicas(ultimaDeteccion.detecciones)"
                  :key="i"
                  class="class-chip"
                >{{ c }}</span>
              </div>
            </div>
          </div>
          <div v-else class="class-empty">Sin detecciones</div>
        </div>
      </v-col>

      <!-- Últimas Detecciones -->
      <v-col cols="12" md="5">
        <div class="dash-card h-100">
          <div class="dash-card__header">
            <v-icon size="20" color="#f59e0b">mdi-history</v-icon>
            <h3>Últimas Detecciones</h3>
          </div>
          <div class="recent-list">
            <div
              v-for="(det, idx) in ultimasDetecciones"
              :key="det.frameId"
              class="recent-item"
            >
              <div class="recent-item__left">
                <div class="recent-item__index">{{ idx + 1 }}</div>
                <div>
                  <div class="recent-item__sensor">{{ det.metadata?.sensor || 'N/A' }}</div>
                  <div class="recent-item__date">{{ parsearFecha(det.frameId) }}</div>
                </div>
              </div>
              <div class="recent-item__right">
                <v-chip size="small" color="primary" variant="tonal">
                  {{ det.detecciones?.length || 0 }} obj.
                </v-chip>
              </div>
            </div>
            <div v-if="!ultimasDetecciones.length" class="class-empty">
              Sin detecciones recientes
            </div>
          </div>
        </div>
      </v-col>

      <!-- Acciones Rápidas -->
      <v-col cols="12" md="3">
        <div class="dash-card h-100">
          <div class="dash-card__header">
            <v-icon size="20" color="#ec4899">mdi-lightning-bolt</v-icon>
            <h3>Acciones</h3>
          </div>
          <div class="actions-list">
            <router-link to="/imagenes" class="action-btn action-btn--blue">
              <v-icon size="20">mdi-cloud-upload</v-icon>
              <span>Subir Imagen</span>
            </router-link>
            <router-link to="/modelos" class="action-btn action-btn--green">
              <v-icon size="20">mdi-map</v-icon>
              <span>Ver Mapa</span>
            </router-link>
            <router-link to="/detecciones" class="action-btn action-btn--purple">
              <v-icon size="20">mdi-magnify</v-icon>
              <span>Explorar</span>
            </router-link>
          </div>
        </div>
      </v-col>

    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import apiChaco from "@/services/apiChaco.js";
import api from "@/services/api.js";
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LIcon } from "@vue-leaflet/vue-leaflet";

const cargando = ref(false);
const detecciones = ref([]);
const miniMapRef = ref(null);

const snackbar = ref({
  show: false,
  text: "",
  color: "success",
});

/* ==========================================================
 * MARKERS (solo los que tienen coordenadas)
 * ========================================================== */

const markers = computed(() => {
  return detecciones.value
    .filter(
      (d) =>
        d.metadata?.latitud != null &&
        d.metadata?.longitud != null &&
        !isNaN(d.metadata.latitud) &&
        !isNaN(d.metadata.longitud)
    )
    .map((d) => ({
      ...d,
      latitud: Number(d.metadata.latitud),
      longitud: Number(d.metadata.longitud),
    }));
});

/* ==========================================================
 * KPIs
 * ========================================================== */

const kpis = computed(() => {
  const total = detecciones.value.reduce(
    (acc, d) => acc + (d.detecciones?.length || 0),
    0
  );
  const classes = new Set();
  detecciones.value.forEach((d) => {
    (d.detecciones || []).forEach((det) => classes.add(det.class_name));
  });

    return [
    { title: "Detecciones", value: total.toLocaleString(), icon: "mdi-crosshairs", color: "blue" },
    { title: "Fotogramas", value: detecciones.value.length.toLocaleString(), icon: "mdi-image-multiple", color: "green" },
    { title: "Clases", value: classes.size.toString(), icon: "mdi-tag", color: "purple" },
  ];
});

/* ==========================================================
 * CLASES POR CANTIDAD
 * ========================================================== */

const clasesPorCantidad = computed(() => {
  const map = {};
  detecciones.value.forEach((d) => {
    (d.detecciones || []).forEach((det) => {
      map[det.class_name] = (map[det.class_name] || 0) + 1;
    });
  });

  const arr = Object.entries(map)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const max = arr.length ? arr[0].cantidad : 1;
  return arr.map((c) => ({
    ...c,
    porcentaje: (c.cantidad / max) * 100,
  }));
});

/* ==========================================================
 * ÚLTIMA DETECCIÓN
 * ========================================================== */

const ultimaDeteccion = computed(() => {
  return detecciones.value.length ? detecciones.value[0] : null;
});

const imagenUltima = computed(() => {
  if (!ultimaDeteccion.value) return "";
  const baseURL = api.defaults.baseURL || "http://localhost:8000";
  return `${baseURL}/get-frame/${ultimaDeteccion.value.frameId}`;
});

/* ==========================================================
 * ÚLTIMAS DETECCIONES
 * ========================================================== */

const ultimasDetecciones = computed(() => {
  return detecciones.value.slice(0, 6);
});

/* ==========================================================
 * HELPERS
 * ========================================================== */

const clasesUnicas = (detecciones) => {
  if (!detecciones) return [];
  return [...new Set(detecciones.map((d) => d.class_name))];
};

const truncateId = (id) => {
  if (!id) return "";
  return id.length > 28 ? `${id.substring(0, 28)}...` : id;
};

const parsearFecha = (frameId) => {
  if (!frameId) return "N/A";
  const parts = frameId.split("_");
  if (parts.length >= 3) {
    const ts = parseInt(parts[1], 10);
    if (!isNaN(ts)) {
      const d = new Date(ts);
      return d.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  return "N/A";
};

const onImgError = (event) => {
  event.target.src =
    "https://placehold.co/400x250/1e293b/ffffff?text=Sin+Imagen";
};

const mostrarAlerta = (texto, color = "success") => {
  snackbar.value = { show: true, text: texto, color };
};

/* ==========================================================
 * CARGA DE DATOS
 * ========================================================== */

const cargarDatos = async () => {
  cargando.value = true;
  try {
    const { data } = await apiChaco.get("/detecciones");
    detecciones.value = Array.isArray(data) ? data : [];
    mostrarAlerta(
      detecciones.value.length
        ? `${detecciones.value.length} fotogramas cargados`
        : "No se encontraron detecciones",
      detecciones.value.length ? "success" : "warning"
    );
  } catch (error) {
    console.error("Error al cargar dashboard:", error);
    mostrarAlerta("Error al cargar datos", "error");
  } finally {
    cargando.value = false;
  }
};

onMounted(async () => {
  await cargarDatos();
  await nextTick();
  setTimeout(() => {
    if (miniMapRef.value?.leafletObject) {
      miniMapRef.value.leafletObject.invalidateSize();
    }
  }, 300);
});

onBeforeUnmount(() => {
  if (miniMapRef.value?.leafletObject) {
    miniMapRef.value.leafletObject.closePopup();
    miniMapRef.value.leafletObject.remove();
  }
  nextTick(() => {
    document.querySelectorAll('.v-overlay-container').forEach(el => el.remove());
    document.documentElement.classList.remove('v-overlay--scroll-blocked');
  });
});
</script>

<style scoped>
/* ==========================================================
   GENERAL
========================================================== */

.dashboard-page {
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

/* ==========================================================
   KPIs
========================================================== */

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  transition: 0.2s;
}

.kpi-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.kpi-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon--blue {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}

.kpi-icon--green {
  background: linear-gradient(135deg, #10b981, #059669);
}

.kpi-icon--purple {
  background: linear-gradient(135deg, #7c3aed, #8b5cf6);
}

.kpi-icon--orange {
  background: linear-gradient(135deg, #ea580c, #f97316);
}

.kpi-label {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.kpi-value {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: white;
  line-height: 1.1;
}

/* ==========================================================
   CARDS COMUNES
========================================================== */

.dash-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 18px;
  padding: 22px;
  height: 100%;
}

.dash-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.dash-card__header h3 {
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin: 0;
}

/* ==========================================================
   MAPA MINI
========================================================== */

.mini-map-container {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #334155;
}

.mini-map {
  width: 100%;
  height: 320px;
}

.mini-marker {
  width: 10px;
  height: 10px;
  background: #3b82f6;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
}

/* ==========================================================
   CLASES POR CANTIDAD
========================================================== */

.class-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.class-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.class-item__name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  text-transform: capitalize;
}

.class-item__count {
  font-size: 13px;
  font-weight: 700;
  color: #60a5fa;
}

.class-item__bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  overflow: hidden;
}

.class-item__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 20px;
  transition: width 0.5s ease;
}

.class-empty {
  color: #64748b;
  font-style: italic;
  text-align: center;
  padding: 30px 0;
}

/* ==========================================================
   ÚLTIMA DETECCIÓN
========================================================== */

.last-detection__image {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 14px;
  border: 1px solid #334155;
}

.last-detection__image img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.last-detection__info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.last-detection__row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #cbd5e1;
}

.last-detection__classes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.class-chip {
  padding: 3px 10px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

/* ==========================================================
   ÚLTIMAS DETECCIONES
========================================================== */

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  transition: 0.2s;
}

.recent-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.recent-item__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recent-item__index {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.recent-item__sensor {
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.recent-item__date {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

/* ==========================================================
   ACCIONES RÁPIDAS
========================================================== */

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  text-decoration: none;
  transition: 0.2s;
}

.action-btn--blue {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(59, 130, 246, 0.15));
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.action-btn--blue:hover {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.5), rgba(59, 130, 246, 0.3));
}

.action-btn--green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.15));
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.action-btn--green:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.5), rgba(16, 185, 129, 0.3));
}

.action-btn--purple {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(139, 92, 246, 0.15));
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.action-btn--purple:hover {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.5), rgba(139, 92, 246, 0.3));
}

/* ==========================================================
   SNACKBAR
========================================================== */

.dashboard-page :deep(.v-snackbar__wrapper) {
  border-radius: 14px;
}

/* ==========================================================
   SCROLLBAR
========================================================== */

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 20px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

/* ==========================================================
   RESPONSIVE
========================================================== */

@media (max-width: 960px) {
  .dashboard-page {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .dashboard-page {
    padding: 16px;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .kpi-value {
    font-size: 20px;
  }

  .mini-map {
    height: 240px;
  }
}
</style>

<!-- Estilos globales: Leaflet (se renderizan fuera del componente) -->
<style>
.mini-map .leaflet-control-zoom,
.mini-map .leaflet-control-attribution {
  display: none !important;
}
</style>
