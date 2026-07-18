<template>
  <div class="inferencia-page">
    
    <div class="page-header">
      <div>
        <h1>Nueva Inferencia</h1>
        <p>Subí un fotograma y selecccioná el modelo de IA para procesarlo.</p>
      </div>
    </div>

    <v-row>
      <!-- COLUMNA IZQUIERDA: Drag & Drop y Previsualización -->
      <v-col cols="12" md="7" lg="8">
        <v-card class="premium-card h-100">
          
          <!-- Si no hay imagen, mostramos el Dropzone -->
          <div
            v-if="!imagenSeleccionada"
            class="dropzone-container main-dropzone"
            :class="{ 'dropzone-active': isDragging }"
            @dragenter.prevent="isDragging = true"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              class="hidden-input"
              @change="handleFileChange"
            />
            <div class="dropzone-content">
              <v-icon size="64" :color="isDragging ? '#3B82F6' : '#64748B'" class="mb-4">
                mdi-image-plus
              </v-icon>
              <h3 class="text-h6 text-white font-weight-bold mb-2">
                {{ isDragging ? 'Soltá la imagen acá' : 'Hacé clic o arrastrá una imagen' }}
              </h3>
              <p class="text-grey text-body-2 mb-0">Soporta formatos de alta resolución (JPG, PNG)</p>
            </div>
          </div>

          <!-- Si hay imagen, mostramos la previsualización -->
          <div v-else class="preview-container">
            <img :src="imagenUrl" alt="Previsualización" class="image-preview" />
            <div class="preview-overlay">
              <div class="file-info">
                <v-icon color="white" class="mr-2">mdi-file-image</v-icon>
                <span class="text-white font-weight-medium">{{ imagenSeleccionada.name }}</span>
              </div>
              <v-btn
                color="#EF4444"
                variant="flat"
                prepend-icon="mdi-delete"
                class="text-none font-weight-medium"
                @click="quitarImagen"
              >
                Cambiar imagen
              </v-btn>
            </div>
          </div>

        </v-card>
      </v-col>

      <!-- COLUMNA DERECHA: Configuración y Metadatos -->
      <v-col cols="12" md="5" lg="4">
        <v-card class="premium-card h-100 d-flex flex-column">
          <div class="pa-6 flex-grow-1">
            <h3 class="section-title mb-6">Configuración de Procesamiento</h3>

            <!-- Selección de Modelo -->
            <label class="input-label">Modelo de Inteligencia Artificial</label>
            <v-select
              v-model="config.modeloId"
              :items="modelosDisponibles"
              item-title="nombre"
              item-value="id"
              variant="outlined"
              placeholder="Seleccioná un modelo..."
              hide-details
              class="modern-input mb-5 mt-1"
            >
              <template v-slot:prepend-inner>
                <v-icon color="#94A3B8" class="mr-2">mdi-brain</v-icon>
              </template>
            </v-select>

            <v-divider class="my-6 border-slate" />

            <h3 class="section-title mb-4">Metadatos (Ubicación)</h3>

            <!-- Latitud -->
            <label class="input-label">Latitud</label>
            <v-text-field
              v-model="config.lat"
              variant="outlined"
              placeholder="Ej: -34.6037"
              hide-details
              class="modern-input mb-4 mt-1"
            >
              <template v-slot:prepend-inner>
                <v-icon color="#94A3B8" class="mr-2">mdi-latitude</v-icon>
              </template>
            </v-text-field>

            <!-- Longitud -->
            <label class="input-label">Longitud</label>
            <v-text-field
              v-model="config.lng"
              variant="outlined"
              placeholder="Ej: -58.3815"
              hide-details
              class="modern-input mb-4 mt-1"
            >
              <template v-slot:prepend-inner>
                <v-icon color="#94A3B8" class="mr-2">mdi-longitude</v-icon>
              </template>
            </v-text-field>
            
            <v-btn 
              variant="text" 
              color="#3B82F6" 
              prepend-icon="mdi-crosshairs-gps"
              class="text-none px-0 mt-2"
              @click="obtenerUbicacionActual"
            >
              Usar mi ubicación actual
            </v-btn>
          </div>

          <!-- Botón de Acción -->
          <div class="pa-6 pt-0 mt-auto">
            <v-btn
              color="#3B82F6"
              variant="flat"
              block
              size="large"
              class="text-none font-weight-bold text-white rounded-lg"
              :loading="isProcessing"
              :disabled="!imagenSeleccionada || !config.modeloId"
              @click="procesarImagen"
            >
              <v-icon start>mdi-auto-fix</v-icon>
              Procesar Imagen
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>

  <!-- Alertas -->
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="bottom right">
    <div class="d-flex align-center gap-2">
      <v-icon size="20" class="mr-2">{{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
      <span class="font-weight-medium">{{ snackbar.text }}</span>
    </div>
  </v-snackbar>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from "@/services/apiChaco.js"; // Asegurate de que esta ruta sea correcta

// --- ESTADOS ---
const isDragging = ref(false);
const fileInput = ref(null);
const imagenSeleccionada = ref(null);
const imagenUrl = ref(null);
const isProcessing = ref(false);

const snackbar = ref({ show: false, text: "", color: "success" });

const config = ref({
  modeloId: null,
  lat: "",
  lng: ""
});

// Lista simulada de modelos (idealmente esto se consume del Servicio 1 de tu backend)
const modelosDisponibles = ref([
  { id: 'yolov8-obj', nombre: 'Detección de Objetos (YOLOv8)' },
  { id: 'face-rec-v2', nombre: 'Reconocimiento Facial Pro' },
  { id: 'lpr-v1', nombre: 'Lectura de Patentes (LPR)' }
]);

// --- FUNCIONES AUXILIARES ---
const mostrarAlerta = (texto, color = "success") => {
  snackbar.value = { show: true, text: texto, color };
};

const cargarModelos = async () => {
  // ACÁ IRÍA LA LLAMADA A TU SERVICIO 1 PARA TRAER LOS MODELOS REALES
  // try {
  //   const response = await api.get('/models');
  //   modelosDisponibles.value = response.data;
  // } catch (error) {
  //   mostrarAlerta("Error al cargar los modelos disponibles", "error");
  // }
};

// --- DRAG & DROP Y PREVISUALIZACIÓN ---
const triggerFileInput = () => {
  fileInput.value.click();
};

const procesarArchivo = (file) => {
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    mostrarAlerta("Solo se permiten archivos de imagen", "error");
    return;
  }

  imagenSeleccionada.value = file;
  imagenUrl.value = URL.createObjectURL(file);
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  procesarArchivo(file);
  event.target.value = ''; // Reset input
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  procesarArchivo(file);
};

const quitarImagen = () => {
  if (imagenUrl.value) URL.revokeObjectURL(imagenUrl.value);
  imagenSeleccionada.value = null;
  imagenUrl.value = null;
};

// --- GEOLOCALIZACIÓN (UX extra) ---
const obtenerUbicacionActual = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        config.value.lat = position.coords.latitude.toFixed(6);
        config.value.lng = position.coords.longitude.toFixed(6);
        mostrarAlerta("Ubicación obtenida correctamente", "success");
      },
      (error) => {
        mostrarAlerta("No se pudo obtener la ubicación. Verificá los permisos.", "error");
      }
    );
  } else {
    mostrarAlerta("Tu navegador no soporta geolocalización", "error");
  }
};

// --- ENVÍO A LA API ---
const procesarImagen = async () => {
  if (!imagenSeleccionada.value || !config.value.modeloId) return;

  try {
    isProcessing.value = true;
    const formData = new FormData();
    
    // Archivo
    formData.append("image", imagenSeleccionada.value);
    
    // Metadatos y Modelo
    formData.append("modelId", config.value.modeloId);
    if (config.value.lat) formData.append("latitude", config.value.lat);
    if (config.value.lng) formData.append("longitude", config.value.lng);

    // Llamada al endpoint (Ajustar según tu Servicio 2)
    const response = await api.post("/inference/process", formData, {
      transformRequest: [(data, headers) => {
        delete headers['Content-Type']; // Vital para multipart/form-data
        return data;
      }]
    });

    mostrarAlerta("¡Imagen procesada con éxito!", "success");
    console.log("Resultado de la inferencia:", response.data);
    
    // Acá podrías redirigir a la vista de resultados o mostrar el resultado en pantalla
    // router.push(`/detecciones/${response.data.id}`);

  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    mostrarAlerta("Ocurrió un error al procesar la imagen", "error");
  } finally {
    isProcessing.value = false;
  }
};

onMounted(() => {
  cargarModelos();
});
</script>

<style scoped>
/* Contenedor principal */
.inferencia-page {
  padding: 32px;
  background-color: #0F172A;
  min-height: calc(100vh - 72px);
  color: white;
  font-family: 'Inter', sans-serif;
}

/* Cabecera */
.page-header {
  margin-bottom: 24px;
}
.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
}
.page-header p {
  color: #94A3B8;
  font-size: 0.95rem;
  margin-top: 4px;
}

/* Tarjetas Premium */
.premium-card {
  background-color: #1E293B !important;
  border: 1px solid #334155 !important;
  border-radius: 16px !important;
  box-shadow: none !important;
}

/* Dropzone (Subida de archivo) */
.main-dropzone {
  height: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #374151;
  border-radius: 16px;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 24px; /* Espaciado interno de la tarjeta */
}
.main-dropzone:hover {
  border-color: #475569;
  background-color: rgba(255, 255, 255, 0.02);
}
.dropzone-active {
  border-color: #3B82F6 !important;
  background-color: rgba(59, 130, 246, 0.05) !important;
}
.hidden-input {
  display: none;
}
.dropzone-content {
  text-align: center;
}

/* Previsualización de Imagen */
.preview-container {
  position: relative;
  height: 100%;
  min-height: 400px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  padding: 24px;
}
.image-preview {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Para que no se recorte */
  border-radius: 12px;
  background-color: #0F172A;
}
.preview-overlay {
  position: absolute;
  bottom: 40px;
  left: 40px;
  right: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  padding: 16px 24px;
  border-radius: 12px;
  border: 1px solid #334155;
}
.file-info {
  display: flex;
  align-items: center;
}

/* Formularios y Tipografía */
.section-title {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
}
.input-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #9CA3AF;
  display: block;
}
.border-slate {
  border-color: #374151 !important;
}

/* Inputs Modernos */
.modern-input :deep(.v-field) {
  border-radius: 8px !important;
  border: 1px solid #374151 !important;
  background-color: #0F172A !important; /* Fondo más oscuro para contraste */
  box-shadow: none !important;
}
.modern-input :deep(.v-field--focused) {
  border-color: #3B82F6 !important;
}
.modern-input :deep(.v-field__outline) {
  display: none !important;
}
.modern-input :deep(input), .modern-input :deep(.v-select__selection-text) {
  color: white !important;
}
</style>