<template>

<div class="explorer-page">

    <!-- HEADER -->

    <div class="page-header">

        <div>

            <h1>Explorador de Fotogramas</h1>

            <p>
                Buscá y analizá detecciones históricas utilizando filtros
                geográficos y clases detectadas.
            </p>

        </div>

        <v-btn
            color="primary"
            rounded="xl"
            prepend-icon="mdi-refresh"
            variant="tonal"
            @click="buscarFrames"
        >
            Actualizar
        </v-btn>

    </div>

    <!-- ========================= -->
    <!-- FILTROS -->
    <!-- ========================= -->

    <v-card class="filter-card">

        <div class="filter-header">

            <div class="filter-title">

                <div class="filter-icon">

                    <v-icon>

                        mdi-filter-variant

                    </v-icon>

                </div>

                <div>

                    <h3>Filtros</h3>

                    <span>

                        Configurá la búsqueda

                    </span>

                </div>

            </div>

            <v-btn

                icon

                variant="text"

                @click="filtersOpen=!filtersOpen"

            >

                <v-icon>

                    {{ filtersOpen
                        ? 'mdi-chevron-up'
                        : 'mdi-chevron-down' }}

                </v-icon>

            </v-btn>

        </div>

        <v-expand-transition>

            <div
                v-show="filtersOpen"
                class="filter-body"
            >

                <v-row>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="filtros.lat_min" placeholder="Latitud mínima" variant="outlined" rounded="xl" density="comfortable" hide-details />
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="filtros.lat_max" placeholder="Latitud máxima" variant="outlined" rounded="xl" density="comfortable" hide-details />
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="filtros.lon_min" placeholder="Longitud mínima" variant="outlined" rounded="xl" density="comfortable" hide-details />
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="filtros.lon_max" placeholder="Longitud máxima" variant="outlined" rounded="xl" density="comfortable" hide-details />
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="filtros.clase" placeholder="Clase" variant="outlined" rounded="xl" density="comfortable" prepend-inner-icon="mdi-tag" hide-details />
                    </v-col>
                    <v-col cols="12" md="2" class="d-flex align-end">
                        <v-btn block color="primary" rounded="xl" height="50" prepend-icon="mdi-magnify" @click="buscarFrames">
                            Buscar
                        </v-btn>
                    </v-col>
                </v-row>

            </div>

        </v-expand-transition>

    </v-card>

    <!-- ========================= -->
    <!-- RESULTADOS -->
    <!-- ========================= -->

    <div class="results-header">

        <div>

            <h2>

                Resultados

            </h2>

            <span>

                {{ resultados.length }}

                fotogramas encontrados

            </span>

        </div>

    </div>

    <!-- ========================= -->
    <!-- GRID -->
    <!-- ========================= -->

    <v-row>

        <v-col

            v-for="frame in resultados"

            :key="frame.frameId"

            cols="12"

            md="6"

            xl="4"

        >

            <v-card class="frame-card">

                <!-- ========================= -->
                <!-- IMAGEN -->
                <!-- ========================= -->

                <div class="thumbnail">

                    <img
                        :src="rewriteSeaweedUrl(frame.imageURL)"
                        :alt="frame.frameId"
                        @error="imagenError"
                    />

                    <div class="image-overlay">

                        <v-chip
                            size="small"
                            color="primary"
                            prepend-icon="mdi-camera"
                        >
                            {{ frame.metadata?.sensor }}
                        </v-chip>

                    </div>

                </div>

                <!-- ========================= -->
                <!-- CONTENIDO -->
                <!-- ========================= -->

                <div class="frame-content">

                    <div class="frame-id">
                        {{ truncateId(frame.frameId) }}
                    </div>

                    <div class="frame-location">

                        <v-icon size="18">
                            mdi-map-marker
                        </v-icon>

                        <span>

                            {{ frame.metadata?.latitud }},
                            {{ frame.metadata?.longitud }}

                        </span>

                    </div>

                    <v-divider class="my-4"/>

                    <div class="detections">

                        <div class="detections-title">

                            <v-icon color="primary">
                                mdi-robot
                            </v-icon>

                            <span>Reconocimientos</span>

                        </div>

                        <div
                            v-if="frame.detections?.length"
                        >

                            <div
                                class="detection-row"
                                v-for="(det,index) in frame.detections"
                                :key="index"
                            >

                                <div class="detection-name">

                                    <v-icon
                                        size="18"
                                        color="primary"
                                    >
                                        mdi-tag
                                    </v-icon>

                                    {{ det.class_name || det.class_name }}

                                </div>

                                <v-chip
                                    color="success"
                                    size="small"
                                    variant="tonal"
                                >

                                    {{ formatConfidence(det.confidence) }}

                                </v-chip>

                            </div>

                        </div>

                        <div
                            v-else
                            class="no-detections"
                        >

                            <v-icon>
                                mdi-check-circle-outline
                            </v-icon>

                            Sin objetos detectados

                        </div>

                    </div>

                    <v-btn
                        block
                        color="primary"
                        rounded="xl"
                        size="large"
                        prepend-icon="mdi-magnify"
                        class="frame-btn"
                        @click="abrirModalDeteccion(frame)"
                    >
                        Ver detección
                    </v-btn>

                </div>

            </v-card>

        </v-col>

    </v-row>

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

    <!-- ========================= -->
    <!-- ALERTA (FALTABA EN TU VISTA) -->
    <!-- ========================= -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
        {{ snackbar.text }}
    </v-snackbar>

</div>

</template>

<script setup>
import { ref, computed } from "vue";
import api from "@/services/api.js";
import apiChaco from "@/services/apiChaco.js";
import { getFrameUrl, rewriteSeaweedUrl } from "@/config/seaweed.js";

/* ==========================================================
 * ESTADOS
 * ========================================================== */

const isSearching = ref(false);
const busquedaRealizada = ref(false);

const resultados = ref([]);

const filtersOpen = ref(true);

const snackbar = ref({
  show: false,
  text: "",
  color: "success",
});

const filtros = ref({
  lat_min: null,
  lat_max: null,
  lon_min: null,
  lon_max: null,
  clase: "",
});

const modal = ref({
  show: false,
  frame: null,
});

const modalResultado = ref(false);
const resultadoInferencia = ref(null);
const dimensionesImagen = ref({ width: 0, height: 0 });
const imagenModalUrl = ref(null);

/* ==========================================================
 * COMPUTED
 * ========================================================== */

const formularioValido = computed(() => {

  const f = filtros.value;

  return (
    f.lat_min !== null &&
    f.lat_max !== null &&
    f.lon_min !== null &&
    f.lon_max !== null
  );

});

/* ==========================================================
 * HELPERS
 * ========================================================== */

const mostrarAlerta = (texto, color = "success") => {

  snackbar.value = {
    show: true,
    text: texto,
    color,
  };

};

const truncateId = (id) => {

  if (!id) return "";

  return id.length > 28
    ? `${id.substring(0, 28)}...`
    : id;

};

const formatConfidence = (value) => {

  if (value === undefined || value === null)
    return "--";

  return `${(value * 100).toFixed(1)}%`;

};

const obtenerUrlImagen = (frameId) => {

  const baseURL =
    api.defaults.baseURL || "http://localhost:5000";

  return `${baseURL}/get-frame/${frameId}`;

};

const imagenError = (event) => {

  event.target.src =
    "https://placehold.co/900x600/1e293b/ffffff?text=Sin+Imagen";

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

const abrirModalDeteccion = async (frame) => {
  try {
    const { data } = await apiChaco.get(`/get-detection/${frame.frameId}`);
    resultadoInferencia.value = Array.isArray(data) ? data[0] : data;

    imagenModalUrl.value = getFrameUrl(frame.frameId);

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

/* ==========================================================
 * FILTROS
 * ========================================================== */

const limpiarFiltros = () => {

  filtros.value = {

    lat_min: null,

    lat_max: null,

    lon_min: null,

    lon_max: null,

    clase: "",

  };

  resultados.value = [];

  busquedaRealizada.value = false;

  mostrarAlerta(
    "Filtros limpiados"
  );

};

/* ==========================================================
 * API
 * ========================================================== */

const buscarFrames = async () => {

  if (!formularioValido.value) {

    mostrarAlerta(
      "Completá las coordenadas",
      "warning"
    );

    return;

  }

  isSearching.value = true;

  busquedaRealizada.value = true;

  resultados.value = [];

  try {

    const params = {

      lat_min: filtros.value.lat_min,

      lat_max: filtros.value.lat_max,

      lon_min: filtros.value.lon_min,

      lon_max: filtros.value.lon_max,

    };

    if (
      filtros.value.clase &&
      filtros.value.clase.trim() !== ""
    ) {

      params.clase =
        filtros.value.clase.trim();

    }

    const { data } = await api.get(
      "/frames/search",
      {
        params,
      }
    );


    console.log(data);

    resultados.value = data;

    resultados.value = data || [];

    mostrarAlerta(

      resultados.value.length
        ? `Se encontraron ${resultados.value.length} fotogramas`
        : "No se encontraron resultados",

      resultados.value.length
        ? "success"
        : "warning"

    );

  } catch (error) {

    console.error(error);

    mostrarAlerta(

      "Error al consultar los fotogramas",

      "error"

    );

  } finally {

    isSearching.value = false;

  }

};
</script>

<style>
/* ==========================================================
   VARIABLES
========================================================== */

.explorer-page {
  min-height: 100vh;
  background: #0f172a;
  padding: 32px;
}

/* ==========================================================
   HEADER
========================================================== */

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
   TARJETA FILTROS
========================================================== */

.filter-card {

  background: #1e293b !important;

  border: 1px solid #334155 !important;

  border-radius: 18px !important;

  margin-bottom: 28px;

  overflow: hidden;

  box-shadow: none !important;

}

.filter-header {

  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 22px 26px;

  border-bottom: 1px solid #334155;

}

.filter-title {

  display: flex;

  align-items: center;

  gap: 18px;

}

.filter-title h3 {

  color: white;

  font-size: 20px;

  margin: 0;

}

.filter-title span {

  color: #94a3b8;

  font-size: 14px;

}

.filter-icon {

  width: 46px;

  height: 46px;

  border-radius: 12px;

  background: rgba(59,130,246,.15);

  display: flex;

  justify-content: center;

  align-items: center;

}

.filter-icon .v-icon {

  color: #60a5fa;

}

.filter-body {

  padding: 26px;

}

/* ==========================================================
   INPUTS
========================================================== */

/* Centra el texto real que escribe el usuario */
.v-field__input {
    text-align: center !important;
    color: white !important;
    min-height: 50px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-inline: 16px !important;
}

/* Centra el texto fantasma (placeholder) */
.v-field__input::placeholder {
    text-align: center !important;
    color: #94a3b8 !important;
    opacity: 1 !important;
}

/* Arreglo para el ícono de "Clase" para que el texto siga viéndose centrado */
.v-input__prepend {
    margin-right: 0 !important;
}

.v-field {

  border-radius: 14px !important;

}



.v-field__outline {

  color: #475569 !important;

}

.v-field:hover .v-field__outline {

  color: #3b82f6 !important;

}

.v-field--focused .v-field__outline {

  color: #3b82f6 !important;

}



.v-label {

  color: #94a3b8 !important;

}

/* ==========================================================
   BOTONES
========================================================== */

.v-btn {

  text-transform: none;

  letter-spacing: .2px;

  font-weight: 600;

}

.search-button {

  height: 56px;

  border-radius: 14px;

}

/* ==========================================================
   RESULTADOS
========================================================== */

.results-header {

  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 20px;

}

.results-header h2 {

  font-size: 24px;

  color: white;

  margin: 0;

}

.results-header span {

  color: #94a3b8;

}

/* ==========================================================
   GRID
========================================================== */

.v-row {

  margin-top: 0 !important;

}

/* ==========================================================
   RESPONSIVE
========================================================== */

@media (max-width:960px){

  .explorer-page{

      padding:20px;

  }

  .page-header{

      flex-direction:column;

      align-items:flex-start;

      gap:18px;

  }

}

/* ==========================================================
   TARJETAS DE RESULTADOS
========================================================== */

.frame-card{

    background:#1E293B;

    border-radius:20px;

    overflow:hidden;

    border:1px solid #334155;

    transition:.25s;

    display:flex;

    flex-direction:column;

    height:100%;

}

.frame-card:hover{

    transform:translateY(-6px);

    box-shadow:0 20px 40px rgba(0,0,0,.35);

}

.thumbnail{

    position:relative;

    height:230px;

    overflow:hidden;

}

.thumbnail img{

    width:100%;

    height:100%;

    object-fit:cover;

    transition:.35s;

}

.frame-card:hover img{

    transform:scale(1.05);

}

.image-overlay{

    position:absolute;

    left:16px;

    top:16px;

}

.frame-content{

    display:flex;

    flex-direction:column;

    padding:20px;

    flex:1;

}

.frame-id{

    color:white;

    font-size:20px;

    font-weight:700;

    margin-bottom:16px;

}

.frame-location{

    display:flex;

    align-items:center;

    gap:10px;

    color:#CBD5E1;

    font-size:14px;

}

.detections{

    margin-top:10px;

    flex:1;

}

.detections-title{

    display:flex;

    align-items:center;

    gap:8px;

    color:white;

    font-weight:600;

    margin-bottom:16px;

}

.detection-row{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:10px 0;

    border-bottom:1px solid #334155;

}

.detection-name{

    display:flex;

    align-items:center;

    gap:8px;

    color:#E2E8F0;

}

.no-detections{

    display:flex;

    align-items:center;

    gap:10px;

    color:#94A3B8;

    font-style:italic;

    padding:10px 0;

}

/* ==========================================================
   MINIATURA
========================================================== */

.thumbnail{

    height: 220px;

    background: #111827;

    display:flex;

    justify-content:center;

    align-items:center;

    overflow:hidden;

}

.thumbnail img{

    width:100%;

    height:100%;

    object-fit:cover;

}

.thumbnail .v-icon{

    color:#64748B;

    opacity:.8;

}

/* ==========================================================
   CONTENIDO
========================================================== */

.frame-content{

    display:flex;

    flex-direction:column;

    flex:1;

    padding:22px;

}

.frame-id{

    color:white;

    font-size:18px;

    font-weight:700;

    margin-bottom:18px;

    word-break:break-word;

}

/* ==========================================================
   CHIPS
========================================================== */

.chips{

    display:flex;

    flex-wrap:wrap;

    gap:8px;

    margin-bottom:22px;

}

.chips .v-chip{

    font-weight:600;

    border-radius:999px;

}

/* ==========================================================
   BOTÓN
========================================================== */

.frame-content .v-btn{

    margin-top:auto;

    height:46px;

}

/* ==========================================================
   SIN RESULTADOS
========================================================== */

.empty-state{

    padding:80px 20px;

    text-align:center;

}

.empty-state .v-icon{

    color:#475569;

    margin-bottom:20px;

}

.empty-state h2{

    color:white;

    margin-bottom:8px;

}

.empty-state p{

    color:#94A3B8;

}

/* ==========================================================
   MODAL
========================================================== */

.v-dialog .v-overlay__scrim {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

.v-dialog .v-card{

    background:#0F172A;

    border-radius:22px;

}

.modal-image-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-close-btn {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 1;
}

.modal-image{

    width:100%;

    max-height:75vh;

    object-fit:contain;

    border-radius:14px;

    background:#020617;

}

/* ==========================================================
   MODAL DE RESULTADOS
========================================================== */

.result-modal{

    background:#0f172a!important;

    border:1px solid rgba(255,255,255,.08)!important;

    border-radius:20px!important;

    overflow:hidden;

}

.result-modal__accent-bar{

    height:4px;

    background:linear-gradient(90deg, #3b82f6, #60a5fa);

}

.result-modal__header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:24px 28px;

    border-bottom:1px solid rgba(255,255,255,.06);

}

.result-modal__header-left{

    display:flex;

    align-items:center;

    gap:16px;

}

.result-modal__success-icon{

    width:44px;

    height:44px;

    border-radius:12px;

    background:linear-gradient(135deg, #3b82f6, #2563eb);

    display:flex;

    align-items:center;

    justify-content:center;

    animation: modal-icon-pulse 2s ease-in-out infinite;

}

@keyframes modal-icon-pulse{

    0%, 100%{ box-shadow: 0 0 0 0 rgba(59,130,246,.4); }

    50%{ box-shadow: 0 0 0 10px rgba(59,130,246,0); }

}

.result-modal__title{

    margin:0;

    font-size:20px;

    font-weight:700;

    color:white;

}

.result-modal__subtitle{

    margin:2px 0 0;

    font-size:13px;

    color:#94a3b8;

}

.result-modal__close{

    color:#94a3b8!important;

    opacity:.7;

    transition:.2s;

}

.result-modal__close:hover{

    opacity:1;

    color:white!important;

}

.result-modal__body{

    padding:28px;

}

.result-modal__image-container{

    position:relative;

    border-radius:14px;

    overflow:hidden;

    background:#0b1220;

    border:1px solid rgba(59,130,246,.25);

    box-shadow:0 0 30px rgba(59,130,246,.08);

}

.result-modal__image{

    width:100%;

    height:auto;

    display:block;

}

.result-modal__bbox{

    transition:.2s;

}

.result-modal__bbox-label{

    position:absolute;

    top:-26px;

    left:-1px;

    background:rgba(37,99,235,.92);

    backdrop-filter:blur(6px);

    color:white;

    padding:3px 10px;

    font-size:11px;

    font-weight:600;

    border-radius:6px 6px 0 0;

    white-space:nowrap;

    letter-spacing:.2px;

    border:1px solid rgba(96,165,250,.3);

    border-bottom:none;

}

.result-sidebar{

    display:flex;

    flex-direction:column;

    gap:16px;

}

.result-sidebar__meta-grid{

    display:grid;

    grid-template-columns:1fr 1fr;

    gap:10px;

}

.result-sidebar__meta-card{

    display:flex;

    align-items:center;

    gap:10px;

    padding:14px;

    background:rgba(255,255,255,.03);

    border:1px solid rgba(255,255,255,.06);

    border-radius:12px;

    transition:.2s;

}

.result-sidebar__meta-card:hover{

    background:rgba(255,255,255,.05);

    border-color:rgba(255,255,255,.1);

}

.result-sidebar__meta-icon{

    width:34px;

    height:34px;

    border-radius:9px;

    display:flex;

    align-items:center;

    justify-content:center;

    flex-shrink:0;

}

.result-sidebar__meta-icon--blue{

    background:linear-gradient(135deg, #2563eb, #3b82f6);

}

.result-sidebar__meta-icon--purple{

    background:linear-gradient(135deg, #7c3aed, #8b5cf6);

}

.result-sidebar__meta-label{

    display:block;

    font-size:11px;

    color:#94a3b8;

    text-transform:uppercase;

    letter-spacing:.5px;

    font-weight:500;

}

.result-sidebar__meta-value{

    display:block;

    font-size:14px;

    font-weight:700;

    color:white;

    margin-top:2px;

    word-break:break-all;

}

.result-sidebar__total{

    text-align:center;

    padding:20px;

    background:linear-gradient(135deg, rgba(16,185,129,.1), rgba(16,185,129,.03));

    border:1px solid rgba(16,185,129,.15);

    border-radius:14px;

}

.result-sidebar__total-number{

    font-size:40px;

    font-weight:800;

    color:#10b981;

    line-height:1;

}

.result-sidebar__total-label{

    font-size:12px;

    color:#94a3b8;

    margin-top:6px;

    text-transform:uppercase;

    letter-spacing:.5px;

    font-weight:500;

}

.result-sidebar__divider{

    height:1px;

    background:rgba(255,255,255,.06);

    margin:4px 0;

}

.result-sidebar__list-header{

    display:flex;

    justify-content:space-between;

    font-size:11px;

    text-transform:uppercase;

    letter-spacing:.5px;

    color:#64748b;

    font-weight:600;

    padding:0 4px;

}

.result-sidebar__list{

    display:flex;

    flex-direction:column;

    gap:10px;

    max-height:280px;

    overflow-y:auto;

    padding:2px 4px;

}

.result-sidebar__detection{

    display:flex;

    flex-direction:column;

    gap:6px;

    padding:10px 12px;

    background:rgba(255,255,255,.02);

    border:1px solid rgba(255,255,255,.04);

    border-radius:10px;

    transition:.2s;

}

.result-sidebar__detection:hover{

    background:rgba(255,255,255,.04);

    border-color:rgba(255,255,255,.08);

}

.result-sidebar__detection-info{

    display:flex;

    align-items:center;

    gap:8px;

}

.result-sidebar__detection-dot{

    width:8px;

    height:8px;

    border-radius:50%;

    flex-shrink:0;

}

.result-sidebar__detection-dot--high{

    background:#10b981;

    box-shadow:0 0 6px rgba(16,185,129,.5);

}

.result-sidebar__detection-dot--mid{

    background:#f59e0b;

    box-shadow:0 0 6px rgba(245,158,11,.5);

}

.result-sidebar__detection-dot--low{

    background:#ef4444;

    box-shadow:0 0 6px rgba(239,68,68,.5);

}

.result-sidebar__detection-name{

    font-size:13px;

    font-weight:600;

    color:white;

    text-transform:capitalize;

}

.result-sidebar__detection-bar-wrapper{

    display:flex;

    align-items:center;

    gap:10px;

}

.result-sidebar__detection-bar{

    flex:1;

    height:6px;

    background:rgba(255,255,255,.06);

    border-radius:20px;

    overflow:hidden;

}

.result-sidebar__detection-bar-fill{

    height:100%;

    border-radius:20px;

    animation: bar-fill-in .6s ease-out;

}

@keyframes bar-fill-in{

    from{ width:0!important; }

}

.result-sidebar__detection-bar-fill--high{

    background:linear-gradient(90deg, #10b981, #34d399);

}

.result-sidebar__detection-bar-fill--mid{

    background:linear-gradient(90deg, #f59e0b, #fbbf24);

}

.result-sidebar__detection-bar-fill--low{

    background:linear-gradient(90deg, #ef4444, #f87171);

}

.result-sidebar__detection-pct{

    font-size:13px;

    font-weight:700;

    min-width:36px;

    text-align:right;

    color:#60a5fa;

}

/* ==========================================================
   SNACKBAR
========================================================== */

.v-snackbar__wrapper{

    border-radius:14px;

}

/* ==========================================================
   SCROLL
========================================================== */

::-webkit-scrollbar{

    width:10px;

}

::-webkit-scrollbar-thumb{

    background:#334155;

    border-radius:20px;

}

::-webkit-scrollbar-thumb:hover{

    background:#475569;

}

/* ==========================================================
   ANIMACIÓN
========================================================== */

.frame-card{

    animation:fadeUp .35s ease;

}

.frame-btn {
    margin-top: 20px;
    height: 48px !important;
    min-height: 48px !important;
    flex: 0 0 auto;
}

@keyframes fadeUp{

    from{

        opacity:0;

        transform:translateY(12px);

    }

    to{

        opacity:1;

        transform:translateY(0);

    }

}

/* ==========================================================
   RESPONSIVE
========================================================== */

@media(max-width:960px){

    .thumbnail{

        height:180px;

    }

}

@media(max-width:600px){

    .thumbnail{

        height:160px;

    }

    .frame-content{

        padding:18px;

    }

    .frame-id{

        font-size:16px;

    }

}

.frame-info{

    display:flex;

    flex-direction:column;

    gap:10px;

    margin-bottom:22px;

}

.info-row{

    display:flex;

    align-items:center;

    gap:10px;

    color:#CBD5E1;

}

.detections{

    margin-top:10px;

    margin-bottom:20px;

}

.detections h4{

    color:white;

    margin-bottom:12px;

    font-size:15px;

}

.detection-row{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:8px 0;

    border-bottom:1px solid #334155;

}

.no-detections{

    color:#94A3B8;

    font-style:italic;

}
</style>