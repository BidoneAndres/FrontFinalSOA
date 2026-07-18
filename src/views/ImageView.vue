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

                item-title="nombre"

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
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router"; // <-- Importamos el router
import api from "@/services/apiChaco.js";

const router = useRouter(); // <-- Inicializamos el router

/* ==========================================================
 * ESTADOS
 * ========================================================== */

const fileInput = ref(null);
const isDragging = ref(false);
const isProcessing = ref(false);

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
    const { data } = await api.get("/models");
    
    // Si tu backend devuelve un formato distinto, mapealo acá. 
    // Esto asume que devuelve un array de objetos con 'id' y 'nombre'.
    modelosDisponibles.value = data;

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

    // Las claves ("image", "modelId", etc.) deben coincidir EXACTAMENTE 
    // con lo que espera recibir tu backend en el controlador.
    formData.append("image", imagenSeleccionada.value);
    formData.append("modelId", config.value.modeloId);

    if (config.value.lat) formData.append("latitude", config.value.lat);
    if (config.value.lng) formData.append("longitude", config.value.lng);

    const response = await api.post("/detections", formData, {
      // Necesario para que Axios envíe correctamente archivos FormData
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    mostrarAlerta("Imagen procesada correctamente");
    
    // REDIRECCIÓN: Acá llevamos al usuario a ver el resultado.
    // Asumimos que el backend devuelve un ID del análisis creado (ej: response.data.id)
    if (response.data && response.data.id) {
      router.push({ name: 'resultados', params: { id: response.data.id } });
    }

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

}

</style>