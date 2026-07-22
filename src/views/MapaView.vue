<template>
  <div class="mapa-page">

    <div class="page-header">
      <div>
        <h1>Mapa de Detecciones</h1>
        <p>Visualizá en el mapa dónde se realizaron los reconocimientos.</p>
      </div>
      <v-btn
        color="primary"
        rounded="xl"
        prepend-icon="mdi-refresh"
        variant="tonal"
        :loading="cargando"
        @click="cargarDetecciones"
      >
        Actualizar
      </v-btn>
    </div>

    <div class="map-stats">
      <div class="stat-card">
        <div class="stat-icon stat-icon--blue">
          <v-icon size="20" color="white">mdi-map-marker</v-icon>
        </div>
        <div>
          <span class="stat-value">{{ markers.length }}</span>
          <span class="stat-label">Puntos en el mapa</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--purple">
          <v-icon size="20" color="white">mdi-crosshairs</v-icon>
        </div>
        <div>
          <span class="stat-value">{{ totalDetecciones }}</span>
          <span class="stat-label">Detecciones totales</span>
        </div>
      </div>
    </div>

    <div class="map-container">
      <l-map
        ref="mapaRef"
        :zoom="12"
        :center="[-31.42, -64.18]"
        :use-global-leaflet="false"
        class="mapa"
      >
        <l-tile-layer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
          layer-type="base"
        />

        <l-marker
          v-for="det in markers"
          :key="det.frameId"
          :lat-lng="[det.latitud, det.longitud]"
        >
          <l-icon
            :icon-size="[32, 42]"
            :icon-anchor="[16, 42]"
            :popup-anchor="[0, -42]"
          >
            <div class="custom-marker">
              <v-icon size="18" color="white">mdi-crosshairs-gps</v-icon>
            </div>
          </l-icon>

          <l-popup :options="{ className: 'dark-popup', maxWidth: 280 }">
            <div class="popup-content">
              <div class="popup-header">
                <v-icon size="16" color="#3b82f6">mdi-camera</v-icon>
                <span class="popup-sensor">{{ det.metadata?.sensor || 'Sin sensor' }}</span>
              </div>

              <div class="popup-frame-id">{{ det.frameId }}</div>

              <div class="popup-coords">
                <v-icon size="14" color="#94a3b8">mdi-map-marker</v-icon>
                <span>{{ det.latitud?.toFixed(4) }}, {{ det.longitud?.toFixed(4) }}</span>
              </div>

              <div class="popup-divider"></div>

              <div class="popup-section-title">
                <v-icon size="14" color="#10b981">mdi-check-decagram</v-icon>
                <span>{{ det.detections?.length || 0 }} detecciones</span>
              </div>

              <div class="popup-classes">
                <span
                  v-for="(clase, idx) in clasesUnicas(det.detections)"
                  :key="idx"
                  class="popup-class-chip"
                >
                  {{ clase }}
                </span>
              </div>

              <v-btn
                block
                color="primary"
                rounded="lg"
                size="small"
                prepend-icon="mdi-magnify"
                class="popup-detail-btn"
                @click="abrirModalDeteccion(det)"
              >
                Ver detalle
              </v-btn>
            </div>
          </l-popup>
        </l-marker>
      </l-map>
    </div>

    <!-- MODAL DE RESULTADOS -->
    <v-dialog v-model="modalResultado" max-width="1200" :scrim-opacity="0.7">
      <v-card class="result-modal">

        <div class="result-modal__accent-bar"></div>

        <div class="result-modal__header">
          <div class="result-modal__header-left">
            <div class="result-modal__success-icon">
              <v-icon size="22" color="white">mdi-magnify</v-icon>
            </div>
            <div>
              <h3 class="result-modal__title">Resultado de Detección</h3>
              <p class="result-modal__subtitle">Se detectaron {{ resultadoInferencia?.detecciones?.length }} objetos en la imagen</p>
            </div>
          </div>
          <v-btn icon variant="text" class="result-modal__close" @click="cerrarModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="result-modal__body" v-if="resultadoInferencia">
          <v-row>

            <v-col cols="12" md="8">
              <div class="result-modal__image-container">
                <img
                  :src="imagenModalUrl"
                  alt="Resultado"
                  class="result-modal__image"
                  @load="alCargarImagenResultante"
                  @error="imagenError"
                />

                <div
                  v-for="(det, index) in resultadoInferencia.detecciones"
                  :key="index"
                  class="result-modal__bbox"
                  :style="calcularEstiloCaja(det.bbox)"
                >
                  <div class="result-modal__bbox-label">
                    {{ det.class_name }} {{ (det.confidence * 100).toFixed(1) }}%
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="result-sidebar">

                <div class="result-sidebar__meta-grid">
                  <div class="result-sidebar__meta-card">
                    <div class="result-sidebar__meta-icon result-sidebar__meta-icon--blue">
                      <v-icon size="18" color="white">mdi-identifier</v-icon>
                    </div>
                    <div>
                      <span class="result-sidebar__meta-label">Fotograma</span>
                      <span class="result-sidebar__meta-value">{{ resultadoInferencia.frameId }}</span>
                    </div>
                  </div>
                  <div class="result-sidebar__meta-card">
                    <div class="result-sidebar__meta-icon result-sidebar__meta-icon--purple">
                      <v-icon size="18" color="white">mdi-cctv</v-icon>
                    </div>
                    <div>
                      <span class="result-sidebar__meta-label">Sensor</span>
                      <span class="result-sidebar__meta-value">{{ resultadoInferencia.metadata?.sensor || 'N/A' }}</span>
                    </div>
                  </div>
                </div>

                <div class="result-sidebar__total">
                  <div class="result-sidebar__total-number">
                    {{ resultadoInferencia.detecciones?.length || 0 }}
                  </div>
                  <div class="result-sidebar__total-label">Detecciones Totales</div>
                </div>

                <div class="result-sidebar__divider"></div>

                <div class="result-sidebar__list-header">
                  <span>Clase detectada</span>
                  <span>Confianza</span>
                </div>

                <div class="result-sidebar__list">
                  <div
                    v-for="(det, idx) in resultadoInferencia.detecciones"
                    :key="idx"
                    class="result-sidebar__detection"
                  >
                    <div class="result-sidebar__detection-info">
                      <div
                        class="result-sidebar__detection-dot"
                        :class="{
                          'result-sidebar__detection-dot--high': det.confidence >= 0.8,
                          'result-sidebar__detection-dot--mid': det.confidence >= 0.5 && det.confidence < 0.8,
                          'result-sidebar__detection-dot--low': det.confidence < 0.5
                        }"
                      ></div>
                      <span class="result-sidebar__detection-name">{{ det.class_name }}</span>
                    </div>
                    <div class="result-sidebar__detection-bar-wrapper">
                      <div class="result-sidebar__detection-bar">
                        <div
                          class="result-sidebar__detection-bar-fill"
                          :class="{
                            'result-sidebar__detection-bar-fill--high': det.confidence >= 0.8,
                            'result-sidebar__detection-bar-fill--mid': det.confidence >= 0.5 && det.confidence < 0.8,
                            'result-sidebar__detection-bar-fill--low': det.confidence < 0.5
                          }"
                          :style="{ width: (det.confidence * 100) + '%' }"
                        ></div>
                      </div>
                      <span class="result-sidebar__detection-pct">{{ (det.confidence * 100).toFixed(0) }}%</span>
                    </div>
                  </div>
                </div>

              </div>
            </v-col>

          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import api from "@/services/api.js";
import apiChaco from "@/services/apiChaco.js";
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LIcon, LPopup } from "@vue-leaflet/vue-leaflet";

const mapaRef = ref(null);
const cargando = ref(false);
const detecciones = ref([]);

const modalResultado = ref(false);
const resultadoInferencia = ref(null);
const dimensionesImagen = ref({ width: 0, height: 0 });
const imagenModalUrl = ref(null);

const snackbar = ref({
  show: false,
  text: "",
  color: "success",
});

const markers = computed(() => {
  return detecciones.value.filter(
    (d) =>
      d.metadata?.latitud != null &&
      d.metadata?.longitud != null &&
      !isNaN(d.metadata.latitud) &&
      !isNaN(d.metadata.longitud)
  ).map((d) => ({
    ...d,
    latitud: Number(d.metadata.latitud),
    longitud: Number(d.metadata.longitud),
  }));
});

const totalDetecciones = computed(() => {
  return markers.value.reduce(
    (acc, m) => acc + (m.detections?.length || 0),
    0
  );
});

const clasesUnicas = (detecciones) => {
  if (!detecciones) return [];
  return [...new Set(detecciones.map((d) => d.class_name))];
};

const mostrarAlerta = (texto, color = "success") => {
  snackbar.value = { show: true, text: texto, color };
};

const cargarDetecciones = async () => {
  cargando.value = true;
  try {
    const { data } = await api.get("/frames/search", {
      params: {
        lat_min: -90,
        lat_max: 90,
        lon_min: -180,
        lon_max: 180,
      },
    });
    detecciones.value = (Array.isArray(data) ? data : []).map(d => ({
      ...d,
      metadata: {
        ...d.metadata,
        latitud: d.metadata?.latitud != null ? Number(d.metadata.latitud) : null,
        longitud: d.metadata?.longitud != null ? Number(d.metadata.longitud) : null,
      }
    }));

    mostrarAlerta(
      markers.value.length
        ? `${markers.value.length} puntos cargados en el mapa`
        : "No se encontraron detecciones con coordenadas",
      markers.value.length ? "success" : "warning"
    );
  } catch (error) {
    console.error("Error al cargar detecciones:", error);
    mostrarAlerta("Error al cargar las detecciones", "error");
  } finally {
    cargando.value = false;
  }
};

/* ==========================================================
 * MODAL DE DETECCIÓN
 * ========================================================== */

const calcularEstiloCaja = (bbox) => {
  if (!dimensionesImagen.value.width) return { display: 'none' };

  const widthPerc = ((bbox.x2 - bbox.x1) / dimensionesImagen.value.width) * 100;
  const heightPerc = ((bbox.y2 - bbox.y1) / dimensionesImagen.value.height) * 100;
  const leftPerc = (bbox.x1 / dimensionesImagen.value.width) * 100;
  const topPerc = (bbox.y1 / dimensionesImagen.value.height) * 100;

  return {
    position: 'absolute',
    left: `${leftPerc}%`,
    top: `${topPerc}%`,
    width: `${widthPerc}%`,
    height: `${heightPerc}%`,
    border: '3px solid #2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    boxSizing: 'border-box'
  };
};

const alCargarImagenResultante = (event) => {
  dimensionesImagen.value = {
    width: event.target.naturalWidth,
    height: event.target.naturalHeight
  };
};

const abrirModalDeteccion = async (det) => {
  try {
    const { data } = await apiChaco.get(`/get-detection/${det.frameId}`);
    resultadoInferencia.value = Array.isArray(data) ? data[0] : data;

    const imageBaseURL = api.defaults.baseURL || "http://localhost:8000";
    imagenModalUrl.value = `${imageBaseURL}/get-frame/${det.frameId}`;

    dimensionesImagen.value = { width: 0, height: 0 };
    modalResultado.value = true;
  } catch (error) {
    console.error("Error al obtener detección:", error);
    mostrarAlerta("Error al cargar la detección", "error");
  }
};

const cerrarModal = () => {
  modalResultado.value = false;
  resultadoInferencia.value = null;
  imagenModalUrl.value = null;
  dimensionesImagen.value = { width: 0, height: 0 };
};

const imagenError = (event) => {
  event.target.src =
    "https://placehold.co/900x600/1e293b/ffffff?text=Sin+Imagen";
};

onMounted(() => {
  cargarDetecciones();
});
import { onUnmounted } from "vue";

onUnmounted(() => {
  console.log("MAPA DESTRUIDO");
});

onBeforeUnmount(() => {
  modalResultado.value = false;
  nextTick(() => {
    document.querySelectorAll('.v-overlay-container').forEach(el => el.remove());
    document.documentElement.classList.remove('v-overlay--scroll-blocked');
  });
});
</script>

<style scoped>
.mapa-page {
  min-height: 100vh;
  background: #0f172a;
  padding: 32px;
  color: white;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 34px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.page-header p {
  color: #94a3b8;
  font-size: 15px;
  margin: 0;
}

/* ==========================================================
   STATS
========================================================== */

.map-stats {
  display: flex;
  gap: 14px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  transition: 0.2s;
}

.stat-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
}

.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon--blue {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}

.stat-icon--purple {
  background: linear-gradient(135deg, #7c3aed, #8b5cf6);
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

/* ==========================================================
   MAPA
========================================================== */

.map-container :deep(.leaflet-marker-icon) {
  background: none !important;
  border: none !important;
}

.map-container {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid #334155;
  background: #0b1220;
}

.mapa {
  width: 100%;
  height: 65vh;
  min-height: 480px;
}

/* ==========================================================
   MARKER PERSONALIZADO
========================================================== */

.custom-marker {
  width: 32px;
  height: 42px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
}

.custom-marker .v-icon {
  transform: rotate(45deg);
}

/* ==========================================================
   SNACKBAR
========================================================== */

.mapa-page :deep(.v-snackbar__wrapper) {
  border-radius: 14px;
}

/* ==========================================================
   SCROLLBAR
========================================================== */

::-webkit-scrollbar {
  width: 8px;
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
  .mapa-page {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .map-stats {
    flex-wrap: wrap;
  }

  .mapa {
    height: 50vh;
    min-height: 360px;
  }
}

@media (max-width: 600px) {
  .mapa-page {
    padding: 16px;
  }

  .stat-card {
    flex: 1;
    min-width: 140px;
    padding: 12px 14px;
  }

  .stat-value {
    font-size: 16px;
  }

  .mapa {
    height: 45vh;
    min-height: 300px;
  }
}
</style>

<!-- Estilos globales: Leaflet popups, controles y modal (se renderizan fuera del componente) -->
<style>
.dark-popup .leaflet-popup-content-wrapper {
  background: #1e293b !important;
  color: white !important;
  border-radius: 14px !important;
  border: 1px solid #334155 !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
  padding: 0 !important;
}

.dark-popup .leaflet-popup-content {
  margin: 0 !important;
  min-width: 220px;
}

.dark-popup .leaflet-popup-tip {
  background: #1e293b !important;
  border: 1px solid #334155 !important;
  border-top: none !important;
  border-left: none !important;
}

.dark-popup .leaflet-popup-close-button {
  color: #94a3b8 !important;
  font-size: 18px !important;
  top: 8px !important;
  right: 10px !important;
}

.dark-popup .leaflet-popup-close-button:hover {
  color: white !important;
}

.popup-content {
  padding: 16px;
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.popup-sensor {
  font-size: 13px;
  font-weight: 600;
  color: #60a5fa;
}

.popup-frame-id {
  font-size: 14px;
  font-weight: 700;
  color: white;
  margin-bottom: 6px;
  word-break: break-all;
}

.popup-coords {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 10px;
}

.popup-divider {
  height: 1px;
  background: #334155;
  margin-bottom: 10px;
}

.popup-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
  margin-bottom: 8px;
}

.popup-classes {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.popup-class-chip {
  padding: 3px 8px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

.popup-detail-btn {
  height: 34px !important;
  font-size: 12px !important;
}

/* ==========================================================
   MODAL DE RESULTADOS
========================================================== */

.result-modal {
  background: #0f172a !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 20px !important;
  overflow: hidden;
}

.result-modal__accent-bar {
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.result-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.result-modal__header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.result-modal__success-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: mapa-modal-icon-pulse 2s ease-in-out infinite;
}

@keyframes mapa-modal-icon-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
}

.result-modal__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.result-modal__subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: #94a3b8;
}

.result-modal__close {
  color: #94a3b8 !important;
  opacity: 0.7;
  transition: 0.2s;
}

.result-modal__close:hover {
  opacity: 1;
  color: white !important;
}

.result-modal__body {
  padding: 28px;
}

.result-modal__image-container {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: #0b1220;
  border: 1px solid rgba(59, 130, 246, 0.25);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.08);
}

.result-modal__image {
  width: 100%;
  height: auto;
  display: block;
}

.result-modal__bbox {
  transition: 0.2s;
}

.result-modal__bbox-label {
  position: absolute;
  top: -26px;
  left: -1px;
  background: rgba(37, 99, 235, 0.92);
  backdrop-filter: blur(6px);
  color: white;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px 6px 0 0;
  white-space: nowrap;
  letter-spacing: 0.2px;
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-bottom: none;
}

/* ==========================================================
   SIDEBAR DE DETECCIONES
========================================================== */

.result-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-sidebar__meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.result-sidebar__meta-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: 0.2s;
}

.result-sidebar__meta-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.result-sidebar__meta-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-sidebar__meta-icon--blue {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}

.result-sidebar__meta-icon--purple {
  background: linear-gradient(135deg, #7c3aed, #8b5cf6);
}

.result-sidebar__meta-label {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.result-sidebar__meta-value {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: white;
  margin-top: 2px;
  word-break: break-all;
}

.result-sidebar__total {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.03));
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 14px;
}

.result-sidebar__total-number {
  font-size: 40px;
  font-weight: 800;
  color: #10b981;
  line-height: 1;
}

.result-sidebar__total-label {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.result-sidebar__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 4px 0;
}

.result-sidebar__list-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  font-weight: 600;
  padding: 0 4px;
}

.result-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  padding: 2px 4px;
}

.result-sidebar__detection {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  transition: 0.2s;
}

.result-sidebar__detection:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.result-sidebar__detection-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-sidebar__detection-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.result-sidebar__detection-dot--high {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
}

.result-sidebar__detection-dot--mid {
  background: #f59e0b;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
}

.result-sidebar__detection-dot--low {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
}

.result-sidebar__detection-name {
  font-size: 13px;
  font-weight: 600;
  color: white;
  text-transform: capitalize;
}

.result-sidebar__detection-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-sidebar__detection-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  overflow: hidden;
}

.result-sidebar__detection-bar-fill {
  height: 100%;
  border-radius: 20px;
  animation: mapa-bar-fill-in 0.6s ease-out;
}

@keyframes mapa-bar-fill-in {
  from { width: 0 !important; }
}

.result-sidebar__detection-bar-fill--high {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.result-sidebar__detection-bar-fill--mid {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.result-sidebar__detection-bar-fill--low {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.result-sidebar__detection-pct {
  font-size: 13px;
  font-weight: 700;
  min-width: 36px;
  text-align: right;
  color: #60a5fa;
}

/* ==========================================================
   LEAFLET OVERRIDES
========================================================== */

.leaflet-control-zoom a {
  background: #1e293b !important;
  color: white !important;
  border-color: #334155 !important;
}

.leaflet-control-zoom a:hover {
  background: #334155 !important;
}

.leaflet-control-attribution {
  background: rgba(15, 23, 42, 0.8) !important;
  color: #64748b !important;
  font-size: 10px !important;
}

.leaflet-control-attribution a {
  color: #94a3b8 !important;
}
</style>
