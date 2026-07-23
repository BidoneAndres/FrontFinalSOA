<template>
  <div class="inferencia-page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Nueva Inferencia</h1>
        <p>
          Subí una imagen y procesala utilizando uno de los modelos de Inteligencia Artificial.
        </p>
      </div>
    </div>

    <v-row class="ga-6">

      <!-- ===================================================== -->
      <!-- COLUMNA IZQUIERDA -->
      <!-- ===================================================== -->

      <v-col cols="12" lg="8">

        <v-card class="glass-card upload-card">

          <div class="card-header">

            <div class="header-icon">
              <v-icon>mdi-image-outline</v-icon>
            </div>

            <div>
              <h2>Imagen</h2>
              <span>Seleccioná el fotograma a analizar</span>
            </div>

          </div>

          <div
            v-if="!imagenSeleccionada"
            class="dropzone"
            :class="{ active: isDragging }"
            @dragenter.prevent="isDragging = true"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >

            <input
              ref="fileInput"
              type="file"
              class="hidden-input"
              accept="image/*"
              @change="handleFileChange"
            />

            <v-icon
              size="82"
              color="#4F8CFF"
              class="mb-6"
            >
              mdi-cloud-upload-outline
            </v-icon>

            <h2>Arrastrá una imagen</h2>

            <p>
              o hacé clic para seleccionarla desde tu computadora
            </p>

            <v-btn
              class="mt-7"
              color="primary"
              variant="outlined"
              rounded="xl"
            >
              Seleccionar Imagen
            </v-btn>

          </div>

          <div
            v-else
            class="preview-wrapper"
          >

            <div class="preview-image">

              <img
                :src="imagenUrl"
                alt="preview"
              />

            </div>

            <div class="preview-footer">

              <div class="preview-file">

                <div class="file-icon">

                  <v-icon>
                    mdi-file-image-outline
                  </v-icon>

                </div>

                <div>

                  <div class="filename">

                    {{ imagenSeleccionada.name }}

                  </div>

                  <div class="filesize">

                    Imagen seleccionada

                  </div>

                </div>

              </div>

              <v-btn

                color="error"

                rounded="lg"

                variant="tonal"

                prepend-icon="mdi-refresh"

                @click="quitarImagen"

              >

                Cambiar

              </v-btn>

            </div>

          </div>

        </v-card>

      </v-col>

      <!-- ===================================================== -->
      <!-- PANEL DERECHO -->
      <!-- ===================================================== -->

      <v-col cols="12" lg="4">

        <div class="right-column">

          <!-- MODELO -->

          <v-card class="glass-card mb-5">

            <div class="section-header">

              <div class="section-icon">
                <v-icon>mdi-brain</v-icon>
              </div>

              <div>

                <h3>Modelo IA</h3>

                <span>
                  Elegí el motor que realizará la inferencia
                </span>

              </div>

            </div>

            <div class="section-body">

              <v-select
                v-model="config.modeloId"
                :items="modelosDisponibles"
                item-title="filename"
                item-value="id"
                variant="outlined"
                rounded="xl"
                density="comfortable"
                prepend-inner-icon="mdi-robot"
                hide-details
              />

            </div>

          </v-card>

          <!-- UBICACION -->

          <v-card class="glass-card">

            <div class="section-header">

              <div class="section-icon">

                <v-icon>

                  mdi-map-marker-radius

                </v-icon>

              </div>

              <div>

                <h3>Ubicación</h3>

                <span>

                  Coordenadas opcionales

                </span>

              </div>

            </div>

            <div class="section-body">

              <v-text-field

                v-model="config.lat"

                label="Latitud"

                variant="outlined"

                rounded="xl"

                density="comfortable"

                prepend-inner-icon="mdi-latitude"

                class="mb-4"

              />

              <v-text-field

                v-model="config.lng"

                label="Longitud"

                variant="outlined"

                rounded="xl"

                density="comfortable"

                prepend-inner-icon="mdi-longitude"

                class="mb-6"

              />

              <v-btn

                block

                variant="tonal"

                color="primary"

                prepend-icon="mdi-crosshairs-gps"

                rounded="xl"

                class="mb-6"

                @click="obtenerUbicacionActual"

              >

                Obtener ubicación

              </v-btn>

              <v-divider class="mb-6" />

              <v-btn

                block

                color="primary"

                size="x-large"

                rounded="xl"

                height="56"

                prepend-icon="mdi-auto-fix"

                :loading="isProcessing"

                :disabled="!imagenSeleccionada || !config.modeloId"

                @click="procesarImagen"

              >

                Procesar Imagen

              </v-btn>

            </div>

          </v-card>

        </div>

      </v-col>

    </v-row>

    <!-- Snackbar -->

    <v-snackbar

      v-model="snackbar.show"

      :color="snackbar.color"

      timeout="3500"

      location="bottom right"

    >

      <v-icon class="mr-2">

        {{ snackbar.color === 'success'
            ? 'mdi-check-circle'
            : 'mdi-alert-circle' }}

      </v-icon>

      {{ snackbar.text }}

    </v-snackbar>

  </div>

  <!-- ===================================================== -->
    <!-- MODAL DE RESULTADOS -->
    <!-- ===================================================== -->
    <v-dialog v-model="modalResultado" max-width="1200" :scrim-opacity="0.7">
      <v-card class="result-modal">

        <div class="result-modal__accent-bar"></div>

        <div class="result-modal__header">
          <div class="result-modal__header-left">
            <div class="result-modal__success-icon">
              <v-icon size="22" color="white">mdi-check-decagram</v-icon>
            </div>
            <div>
              <h3 class="result-modal__title">Análisis Completado</h3>
              <p class="result-modal__subtitle">Se detectaron {{ resultadoInferencia?.totalDetecciones }} objetos en la imagen</p>
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
                  :src="imagenResultadoUrl"
                  alt="Resultado"
                  class="result-modal__image"
                  @load="alCargarImagenResultante"
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
                      <v-icon size="18" color="white">mdi-robot</v-icon>
                    </div>
                    <div>
                      <span class="result-sidebar__meta-label">Modelo</span>
                      <span class="result-sidebar__meta-value">{{ resultadoInferencia.modelId.toUpperCase() }}</span>
                    </div>
                  </div>
                </div>

                <div class="result-sidebar__total">
                  <div class="result-sidebar__total-number">
                    {{ resultadoInferencia.totalDetecciones }}
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
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import api from "@/services/api.js";
import apiChaco from "@/services/apiChaco.js";
import { getFrameUrl } from "@/config/seaweed.js";

/* ==========================================================
 * ESTADOS
 * ========================================================== */

const fileInput = ref(null);
const isDragging = ref(false);
const isProcessing = ref(false);
const modalResultado = ref(false);
const resultadoInferencia = ref(null);
const dimensionesImagen = ref({ width: 0, height: 0 });
const imagenSeleccionada = ref(null);
const imagenUrl = ref(null);

const snackbar = ref({
  show: false,
  text: "",
  color: "success",
});

const config = ref({
  modeloId: null,
  lat: "",
  lng: "",
});

const modelosDisponibles = ref([]);


/*===============================
RESULTADO
==================================*/ 
const imagenResultadoUrl = computed(() => {
  if (!resultadoInferencia.value?.frameId) return '';
  return getFrameUrl(resultadoInferencia.value.frameId);
});

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

const cerrarModal = () => {
  modalResultado.value = false;
};

/* ==========================================================
 * ALERTAS
 * ========================================================== */

const mostrarAlerta = (texto, color = "success") => {
  snackbar.value = {
    show: true,
    text: texto,
    color,
  };
};

/* ==========================================================
 * MODELOS (AHORA ES FUNCIONAL)
 * ========================================================== */

const cargarModelos = async () => {
  try {
    // Llamada REAL a tu backend. 
    // Asegurate de que la ruta "/models" sea la correcta en tu API.
    const { data } = await apiChaco.get("/detections/models");
    
    
    // Si tu backend devuelve un formato distinto, mapealo acá. 
    // Esto asume que devuelve un array de objetos con 'id' y 'nombre'.
    modelosDisponibles.value = data.models;
  } catch (e) {
    console.error("Error al cargar modelos:", e);
    mostrarAlerta("No se pudieron cargar los modelos", "error");
  }
};

/* ==========================================================
 * INPUT FILE Y DRAG & DROP
 * ========================================================== */

const triggerFileInput = () => {
  fileInput.value?.click();
};

const procesarArchivo = (file) => {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    mostrarAlerta("Solo se permiten imágenes", "error");
    return;
  }

  if (imagenUrl.value) {
    URL.revokeObjectURL(imagenUrl.value);
  }

  imagenSeleccionada.value = file;
  imagenUrl.value = URL.createObjectURL(file);
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  procesarArchivo(file);
  event.target.value = "";
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  procesarArchivo(file);
};

const quitarImagen = () => {
  if (imagenUrl.value) {
    URL.revokeObjectURL(imagenUrl.value);
  }
  imagenSeleccionada.value = null;
  imagenUrl.value = null;
  config.value.modeloId = null; // Opcional: limpiar el modelo al cambiar imagen
};

/* ==========================================================
 * GEOLOCALIZACION
 * ========================================================== */

const obtenerUbicacionActual = () => {
  if (!navigator.geolocation) {
    mostrarAlerta("El navegador no soporta geolocalización", "error");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      config.value.lat = position.coords.latitude.toFixed(6);
      config.value.lng = position.coords.longitude.toFixed(6);
      mostrarAlerta("Ubicación obtenida correctamente");
    },
    () => {
      mostrarAlerta("No se pudo obtener la ubicación", "error");
    }
  );
};

/* ==========================================================
 * API (PROCESAMIENTO FUNCIONAL)
 * ========================================================== */

const procesarImagen = async () => {
  if (!imagenSeleccionada.value) return;

  if (!config.value.modeloId) {
    mostrarAlerta("Seleccioná un modelo", "warning");
    return;
  }

  try {
    isProcessing.value = true;
    const formData = new FormData();

    
    // con lo que espera recibir tu backend en el controlador.
    formData.append("image", imagenSeleccionada.value);
    formData.append("modelId", config.value.modeloId);

    const metadata = {};
    if (config.value.lat) metadata.latitud = config.value.lat;
    if (config.value.lng) metadata.longitud = config.value.lng;
    if (Object.keys(metadata).length > 0) {
      formData.append("metadata", JSON.stringify(metadata));
    }

    const response = await apiChaco.post("/detection", formData, {
      // Necesario para que Axios envíe correctamente archivos FormData
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

  resultadoInferencia.value = response.data;
    modalResultado.value = true;

    mostrarAlerta("Imagen procesada correctamente");

  } catch (e) {
    console.error("Error en la inferencia:", e);
    mostrarAlerta("Error al procesar la imagen", "error");
  } finally {
    isProcessing.value = false;
  }
};

/* ==========================================================
 * CICLO DE VIDA
 * ========================================================== */

onMounted(() => {
  cargarModelos();
});

onBeforeUnmount(() => {
  if (imagenUrl.value) {
    URL.revokeObjectURL(imagenUrl.value);
  }
});
</script>

<style scoped>

/* ==========================================================
   GENERAL
========================================================== */

.inferencia-page{
    min-height:100vh;
    padding:36px;
    background:#0b1220;
    color:white;
}

.page-header{
    margin-bottom:28px;
}

.page-header h1{
    font-size:34px;
    font-weight:700;
    letter-spacing:-.5px;
}

.page-header p{
    color:#94a3b8;
    margin-top:8px;
    font-size:15px;
}


/* ==========================================================
   TARJETAS
========================================================== */

.glass-card{

    background:#111827 !important;

    border:1px solid rgba(255,255,255,.08)!important;

    border-radius:20px!important;

    overflow:hidden;

    transition:.25s;

    box-shadow:
        0 0 0 rgba(0,0,0,0),
        0 12px 30px rgba(0,0,0,.25);

}

.glass-card:hover{

    transform:translateY(-3px);

    border-color:#2563eb!important;

    box-shadow:
        0 15px 45px rgba(37,99,235,.15);

}


/* ==========================================================
   CABECERAS
========================================================== */

.card-header,
.section-header{

    display:flex;

    align-items:center;

    gap:18px;

    padding:24px;

    border-bottom:1px solid rgba(255,255,255,.06);

}

.card-header h2,
.section-header h3{

    font-size:20px;

    font-weight:700;

    margin:0;

}

.card-header span,
.section-header span{

    color:#94a3b8;

    font-size:13px;

}


/* ==========================================================
   ICONOS
========================================================== */

.header-icon,
.section-icon{

    width:52px;

    height:52px;

    border-radius:14px;

    display:flex;

    justify-content:center;

    align-items:center;

    background:linear-gradient(
        135deg,
        #2563eb,
        #3b82f6
    );

    color:white;

    flex-shrink:0;

}

.header-icon .v-icon,
.section-icon .v-icon{

    font-size:26px;

}


/* ==========================================================
   DROPZONE
========================================================== */

.upload-card{

    min-height:760px;

}

.dropzone{

    margin:24px;

    flex:1;

    min-height:520px;

    border:2px dashed #334155;

    border-radius:18px;

    display:flex;

    flex-direction:column;

    justify-content:center;

    align-items:center;

    text-align:center;

    cursor:pointer;

    transition:.25s;

    background:#0f172a;

}

.dropzone:hover{

    border-color:#3b82f6;

    background:#111f38;

}

.dropzone.active{

    border-color:#3b82f6;

    background:#13203a;

}

.dropzone h2{

    font-size:30px;

    font-weight:700;

    margin-bottom:12px;

}

.dropzone p{

    color:#94a3b8;

    max-width:380px;

    line-height:1.6;

}

.hidden-input{

    display:none;

}


/* ==========================================================
   PREVIEW
========================================================== */

.preview-wrapper{

    padding:24px;

}

.preview-image{

    background:#0f172a;

    border-radius:18px;

    overflow:hidden;

    border:1px solid rgba(255,255,255,.05);

}

.preview-image img{

    width:100%;

    height:500px;

    object-fit:contain;

    display:block;

}

.preview-footer{

    margin-top:20px;

    display:flex;

    justify-content:space-between;

    align-items:center;

}

.preview-file{

    display:flex;

    align-items:center;

    gap:16px;

}

.file-icon{

    width:54px;

    height:54px;

    border-radius:14px;

    background:#1e293b;

    display:flex;

    align-items:center;

    justify-content:center;

}

.filename{

    font-weight:600;

}

.filesize{

    color:#94a3b8;

    font-size:13px;

}


/* ==========================================================
   PANEL DERECHO
========================================================== */

.right-column{

    display:flex;

    flex-direction:column;

    gap:22px;

}

.section-body{

    padding:24px;

}


/* ==========================================================
   INPUTS
========================================================== */

:deep(.v-field){

    background:#0f172a;

    border-radius:14px;

}

:deep(.v-field__outline){

    color:#334155!important;

}

:deep(.v-field--focused .v-field__outline){

    color:#3b82f6!important;

}

:deep(.v-field__input){

    color:white!important;

}

:deep(.v-label){

    color:#94a3b8!important;

}


/* ==========================================================
   BOTONES
========================================================== */

:deep(.v-btn){

    text-transform:none;

    font-weight:600;

    letter-spacing:.2px;

}

:deep(.v-btn--variant-flat){

    background:linear-gradient(
        135deg,
        #2563eb,
        #3b82f6
    )!important;
}


/* ==========================================================
   SCROLL
========================================================== */

::-webkit-scrollbar{

    width:8px;

}

::-webkit-scrollbar-thumb{

    background:#334155;

    border-radius:20px;

}

::-webkit-scrollbar-track{

    background:transparent;

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

    background:linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6);

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

    background:linear-gradient(135deg, #10b981, #059669);

    display:flex;

    align-items:center;

    justify-content:center;

    animation: modal-icon-pulse 2s ease-in-out infinite;

}

@keyframes modal-icon-pulse{

    0%, 100%{ box-shadow: 0 0 0 0 rgba(16,185,129,.4); }

    50%{ box-shadow: 0 0 0 10px rgba(16,185,129,0); }

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

/* -- Imagen -- */

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

/* -- Bounding boxes -- */

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

/* -- Sidebar derecha -- */

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

/* -- Total -- */

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

/* -- Lista de detecciones -- */

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
   RESPONSIVE
========================================================== */

@media(max-width:1200px){

    .upload-card{

        min-height:auto;

    }

    .dropzone{

        min-height:380px;

    }

    .preview-image img{

        height:360px;

    }

}

@media(max-width:768px){

    .inferencia-page{

        padding:18px;

    }

    .card-header,
    .section-header{

        padding:18px;

    }

    .section-body{

        padding:18px;

    }

    .preview-footer{

        flex-direction:column;

        align-items:flex-start;

        gap:18px;

    }

    .result-modal__body{

        padding:18px;

    }

    .result-modal__meta-grid{

        grid-template-columns:1fr;

    }

    .result-sidebar__total-number{

        font-size:32px;

    }

}

</style>