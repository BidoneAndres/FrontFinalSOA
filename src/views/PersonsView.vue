<template>
  <div class="personas-page">
    
    <div class="page-header">
      <div>
        <h1>Personas</h1>
        <p>Administrá las personas registradas para el sistema de reconocimiento facial.</p>
      </div>

      <v-btn
        color="#3B82F6"
        class="text-none font-weight-medium px-5 elevation-0 rounded-lg"
        size="large"
        prepend-icon="mdi-account-plus"
        @click="dialog = true"
      >
        Registrar Persona
      </v-btn>
    </div>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4" lg="3">
        <v-card class="stat-card">
          <div class="stat-icon-wrapper">
            <v-icon size="24" color="#3B82F6">mdi-account-group</v-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total en la App</span>
            <h2 class="stat-value">{{ personas.length }}</h2>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="search-card mb-6">
      <v-text-field
        v-model="busqueda"
        variant="solo"
        flat
        hide-details
        prepend-inner-icon="mdi-magnify"
        placeholder="Buscar por nombre, apellido o email..."
        class="modern-search"
        theme="dark"
      />
    </v-card>

    <div class="cards-container">
      <v-card
        class="person-card"
        v-for="persona in personasFiltradas"
        :key="persona.personId"
        @click="administrarFotos(persona)"
        ripple
      >
        <div class="person-left">
          <v-avatar
            color="#2563EB"
            size="52"
            class="text-white font-weight-bold"
          >
            {{ persona.nombre ? persona.nombre.charAt(0).toUpperCase() : 'U' }}
          </v-avatar>

          <div class="person-info">
            <h3>{{ persona.nombre }} {{ persona.apellido }}</h3>
            <span class="person-email" :title="persona.email">{{ persona.email }}</span>
            
            <div class="chips-row">
              <v-chip color="#3B82F6" variant="tonal" size="small" class="custom-chip">
                ID: {{ persona.personId }}
              </v-chip>
              <v-chip color="#10B981" variant="tonal" size="small" class="custom-chip">
                Registrado
              </v-chip>
            </div>
          </div>
        </div>
        
        <!-- Botón de eliminar con @click.stop para no disparar el evento de la tarjeta -->
        <div class="person-right">
          <v-btn
            icon="mdi-trash-can-outline"
            variant="text"
            color="#EF4444"
            class="delete-btn"
            @click.stop="eliminarPersona(persona.personId)"
          />
        </div>
      </v-card>
    </div>

    <!-- Dialog para Registrar Persona -->
    <v-dialog v-model="dialog" max-width="500px" transition="dialog-bottom-transition">
      <v-card class="dialog-card" theme="dark">
        <v-card-title class="dialog-header">
          <span class="text-h5 font-weight-bold">Registrar Persona</span>
        </v-card-title>

        <v-card-text class="dialog-body">
            <h3 class="section-title">Información personal</h3>
            <v-row dense>
                <v-col cols="12" sm="6">
                  <label class="input-label">Nombre</label>
                  <v-text-field v-model="nuevaPersona.nombre" variant="outlined" placeholder="Juan" hide-details class="modern-input mt-1" />
                </v-col>
                <v-col cols="12" sm="6">
                  <label class="input-label">Apellido</label>
                  <v-text-field v-model="nuevaPersona.apellido" variant="outlined" placeholder="Pérez" hide-details class="modern-input mt-1" />
                </v-col>
                <v-col cols="12">
                  <label class="input-label">Correo electrónico</label>
                  <v-text-field v-model="nuevaPersona.email" variant="outlined" placeholder="correo@ejemplo.com" hide-details class="modern-input mt-1" />
                </v-col>
                <v-col cols="12">
                  <label class="input-label">Person ID</label>
                  <v-text-field v-model="nuevaPersona.personId" variant="outlined" placeholder="Ej: juan123" hide-details class="modern-input mt-1" />
                </v-col>
            </v-row>

            <v-divider class="my-6 border-slate"/>

            <div class="extra-header">
                <h3 class="section-title mb-0">Información adicional</h3>
                <v-btn color="primary" variant="text" prepend-icon="mdi-plus" @click="agregarExtra">
                  Agregar campo
                </v-btn>
            </div>

            <div v-for="(campo,index) in nuevaPersona.extra" :key="index" class="extra-row">
                <v-text-field v-model="campo.key" label="Clave" variant="outlined" hide-details class="modern-input" />
                <v-text-field v-model="campo.value" label="Valor" variant="outlined" hide-details class="modern-input" />
                <v-btn icon="mdi-delete" color="error" variant="text" @click="eliminarExtra(index)" />
            </div>
        </v-card-text>

        <v-card-actions class="dialog-actions px-6 pb-6">
          <v-spacer />
          <v-btn variant="text" color="#94A3B8" class="text-none font-weight-medium px-4 rounded-lg" @click="dialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="#3B82F6"
            variant="flat"
            class="text-none font-weight-medium px-5 rounded-lg text-white"
            :loading="loadingRegistro"
            @click="guardarPersona"
          >
            Registrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

  <!-- Dialog para Subir Fotografías -->
  <v-dialog v-model="dialogFotos" max-width="500px" transition="dialog-bottom-transition">
    <v-card class="dialog-card" theme="dark">
      <v-card-title class="dialog-header">
        <span class="text-h5 font-weight-bold">Agregar Fotografías</span>
      </v-card-title>

      <v-card-text class="dialog-body">
        <div class="person-upload-info">
          <v-avatar color="#2563EB" size="48" class="text-white font-weight-bold mr-4">
            {{ personaSeleccionada?.nombre ? personaSeleccionada.nombre.charAt(0).toUpperCase() : 'U' }}
          </v-avatar>
          <div>
            <h3 class="mb-0 text-white font-weight-medium" style="font-size: 1.1rem;">
              {{ personaSeleccionada?.nombre }} {{ personaSeleccionada?.apellido }}
            </h3>
            <span class="text-grey text-caption">ID: {{ personaSeleccionada?.personId }}</span>
          </div>
        </div>

        <v-divider class="my-5 border-slate" />

        <div
          class="dropzone-container"
          :class="{ 'dropzone-active': isDragging }"
          @dragenter.prevent="isDragging = true"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input type="file" ref="fileInput" multiple accept="image/*" class="hidden-input" @change="handleFileChange" />
          <div class="dropzone-content">
            <v-icon size="48" :color="isDragging ? '#3B82F6' : '#64748B'" class="mb-2">
              mdi-cloud-upload-outline
            </v-icon>
            <h4 class="mt-2 mb-1 text-white font-weight-medium">
              {{ isDragging ? 'Soltá las fotos acá' : 'Hacé clic o arrastrá las fotos' }}
            </h4>
            <p class="text-grey text-caption mb-0">Soporta JPG, PNG</p>
          </div>
        </div>

        <div v-if="imagenes.length > 0" class="selected-files mt-5">
          <span class="text-caption text-grey font-weight-medium text-uppercase">
            Archivos listos para subir ({{ imagenes.length }})
          </span>
          <div class="file-list mt-2">
            <div v-for="(img, index) in imagenes" :key="index" class="file-item">
              <v-icon size="20" color="#3B82F6" class="mr-3">mdi-image-outline</v-icon>
              <span class="file-name text-truncate text-white text-body-2">{{ img.name }}</span>
              <v-btn icon="mdi-close" variant="text" size="small" color="#EF4444" @click.stop="eliminarImagen(index)" />
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="dialog-actions px-6 pb-6 pt-0">
        <v-spacer />
        <v-btn variant="text" color="#94A3B8" class="text-none font-weight-medium px-4 rounded-lg" @click="dialogFotos = false">
          Cancelar
        </v-btn>
        <v-btn
          color="#3B82F6"
          variant="flat"
          class="text-none font-weight-medium px-5 rounded-lg text-white"
          :disabled="imagenes.length === 0"
          :loading="loadingFotos"
          @click="subirFotos"
        >
          Subir Fotografías
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Alertas de Éxito / Error -->
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="bottom right">
    <div class="d-flex align-center gap-2">
      <v-icon size="20" class="mr-2">{{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
      <span class="font-weight-medium">{{ snackbar.text }}</span>
    </div>
  </v-snackbar>

</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/services/apiChaco.js";

// Estados de interfaz
const isDragging = ref(false);
const fileInput = ref(null);
const dialog = ref(false);
const dialogFotos = ref(false);
const loadingRegistro = ref(false);
const loadingFotos = ref(false);
const snackbar = ref({ show: false, text: "", color: "success" });

// Datos
const personaSeleccionada = ref(null);
const imagenes = ref([]);
const busqueda = ref("");
const personas = ref([]);
const nuevaPersona = ref({
    nombre: "",
    apellido: "",
    email: "",
    personId: "",
    extra: [{ key: "", value: "" }]
});

// Helper para alertas
const mostrarAlerta = (texto, color) => {
    snackbar.value = { show: true, text: texto, color: color };
};

const personasFiltradas = computed(() => {
    if (!busqueda.value) return personas.value;
    const texto = busqueda.value.toLowerCase();
    return personas.value.filter(persona =>
        persona.nombre?.toLowerCase().includes(texto) ||
        persona.apellido?.toLowerCase().includes(texto) ||
        persona.email?.toLowerCase().includes(texto)
    );
});

const cargarPersonas = async () => {
    try {
        const response = await api.get("/personas");
        personas.value = response.data;
    } catch(error){
        console.error("Error al obtener personas", error);
        mostrarAlerta("Error al cargar la lista de personas", "error");
    }
};

const guardarPersona = async () => {
    try {
        loadingRegistro.value = true; // Empieza a cargar
        const extra = {};
        nuevaPersona.value.extra.forEach(campo => {
            if (campo.key.trim()) {
                extra[campo.key] = campo.value;
            }
        });

        const body = {
            nombre: nuevaPersona.value.nombre,
            apellido: nuevaPersona.value.apellido,
            email: nuevaPersona.value.email,
            personId: nuevaPersona.value.personId,
            extra
        };

        await api.post("/personas", body);
        dialog.value = false;
        
        // Reseteamos el formulario
        nuevaPersona.value = { nombre: "", apellido: "", email: "", personId: "", extra: [{ key: "", value: "" }] };
        
        mostrarAlerta("Persona registrada exitosamente", "success");
        await cargarPersonas();
    } catch(error){
        console.error("Error al registrar persona", error);
        mostrarAlerta("Hubo un error al registrar la persona", "error");
    } finally {
        loadingRegistro.value = false; // Termina de cargar
    }
};

const eliminarPersona = async (id) => {
    // Confirmación nativa simple y efectiva
    if (!window.confirm("¿Estás seguro de que querés eliminar a esta persona de la base de datos?")) return;
    
    try {
        await api.delete(`/personas/${id}`);
        mostrarAlerta("Persona eliminada correctamente", "success");
        await cargarPersonas();
    } catch(error){
        console.error("Error al eliminar", error);
        mostrarAlerta("No se pudo eliminar a la persona", "error");
    }
};

const agregarExtra = () => nuevaPersona.value.extra.push({ key: "", value: "" });
const eliminarExtra = (index) => nuevaPersona.value.extra.splice(index,1);

const administrarFotos = (persona) => {
    personaSeleccionada.value = persona;
    imagenes.value = [];
    dialogFotos.value = true;
};

const subirFotos = async () => {
    if (!imagenes.value || imagenes.value.length === 0) return;

    try {
        loadingFotos.value = true; // Empieza a cargar
        const formData = new FormData();
       
        imagenes.value.forEach(file => {
            formData.append("images", file);
        });
        
        formData.append("personId", personaSeleccionada.value.personId);
        
        await api.post("/face-recognition/embeddings", formData, {
            transformRequest: [(data, headers) => {
                delete headers['Content-Type'];
                return data;
            }]
        });
        
        dialogFotos.value = false;
        imagenes.value = [];
        mostrarAlerta("¡Fotografías procesadas y asociadas con éxito!", "success");

    } catch(error) {
        console.error("Error al subir las fotografías:", error);
        mostrarAlerta("Ocurrió un error al procesar las imágenes", "error");
    } finally {
        loadingFotos.value = false; // Termina de cargar
    }
};

// --- FUNCIONES DEL DROPZONE ---
const triggerFileInput = () => fileInput.value.click();

const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    agregarArchivos(files);
    event.target.value = ''; 
};

const handleDrop = (event) => {
    isDragging.value = false;
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
        agregarArchivos(Array.from(droppedFiles));
    }
};

const agregarArchivos = (files) => {
    const validFiles = files.filter(f => f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png)$/i));
    imagenes.value = [...imagenes.value, ...validFiles];
};

const eliminarImagen = (index) => imagenes.value.splice(index, 1);

onMounted(() => {
    cargarPersonas();
});
</script>

<style scoped>
/* Contenedor principal */
.personas-page {
  padding: 32px;
  background-color: #0F172A; 
  min-height: calc(100vh - 72px);
  color: white;
  font-family: 'Inter', sans-serif;
}

/* Cabecera de la página */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-header h1 { font-size: 1.75rem; font-weight: 700; }
.page-header p { color: #94A3B8; font-size: 0.95rem; margin-top: 4px; }

/* Tarjeta de métricas */
.stat-card {
  display: flex; align-items: center; gap: 16px;
  background-color: #1E293B !important;
  border: 1px solid #334155 !important;
  border-radius: 12px !important;
  padding: 16px 20px !important;
  box-shadow: none !important;
}
.stat-icon-wrapper {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 8px;
  background-color: rgba(59, 130, 246, 0.1);
}
.stat-content { display: flex; flex-direction: column; }
.stat-label { color: #94A3B8; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { color: white; font-size: 1.5rem; font-weight: 700; margin: 0; }

/* Buscador */
.search-card {
  background-color: #1E293B !important;
  border: 1px solid #334155 !important;
  border-radius: 12px !important; box-shadow: none !important;
  overflow: hidden; margin: 25px;
}
.modern-search :deep(.v-field) { background-color: #1E293B !important; color: white !important; }
.modern-search :deep(.v-field__input) { padding-top: 12px !important; padding-bottom: 12px !important; }

.cards-container { margin: 25px; display: flex; flex-direction: column; gap: 12px; }

.person-card {
  display: flex; justify-content: space-between; align-items: center;
  background-color: #1E293B !important;
  border: 1px solid #334155 !important;
  border-radius: 12px !important;
  padding: 16px 20px;
  transition: transform 0.2s ease, border-color 0.2s ease;
  box-shadow: none !important;
  cursor: pointer; 
}
.person-card:hover { transform: translateY(-2px); border-color: #3B82F6 !important; }

.person-left { display: flex; align-items: center; gap: 16px; min-width: 0; }
.person-right { display: flex; align-items: center; }

/* Estilo para el botón eliminar al hacer hover */
.delete-btn { opacity: 0.6; transition: opacity 0.2s; }
.delete-btn:hover { opacity: 1; background-color: rgba(239, 68, 68, 0.1); }

.person-info { display: flex; flex-direction: column; min-width: 0; }
.person-info h3 { font-size: 1.05rem; font-weight: 600; color: white; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.person-email { color: #94A3B8; font-size: 0.85rem; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.chips-row { display: flex; gap: 8px; margin-top: 8px; }
.custom-chip { font-weight: 500; font-size: 0.75rem !important; height: 24px !important; }

/* Dialog (Formulario de alta) */
.border-slate { border-color: #374151 !important; }
.dialog-card { background-color: #111827 !important; border: 1px solid #374151 !important; border-radius: 16px !important; }
.dialog-header { padding: 24px 24px 8px 24px !important; }
.dialog-body { padding: 8px 24px 16px 24px !important; }
.input-label { font-size: 0.8rem; font-weight: 500; color: #9CA3AF; display: block; margin-bottom: 4px; }

/* Inputs del dialog */
.modern-input :deep(.v-field) { border-radius: 8px !important; border: 1px solid #374151 !important; background-color: #1E293B !important; box-shadow: none !important; }
.modern-input :deep(.v-field--focused) { border-color: #3B82F6 !important; }
.modern-input :deep(.v-field__outline) { display: none !important; }
.modern-input :deep(input) { color: white !important; padding-top: 10px !important; padding-bottom: 10px !important; }
.section-title { color: white; font-size: 1rem; font-weight: 600; margin-bottom: 18px; }
.extra-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.extra-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: center; margin-bottom: 14px; }

/* DROPZONE */
.person-upload-info { display: flex; align-items: center; padding: 8px 0; }
.dropzone-container { border: 2px dashed #374151; border-radius: 12px; background-color: #1E293B; padding: 40px 24px; text-align: center; cursor: pointer; transition: all 0.2s ease; }
.dropzone-container:hover { border-color: #475569; background-color: #233044; }
.dropzone-active { border-color: #3B82F6 !important; background-color: rgba(59, 130, 246, 0.08) !important; }
.hidden-input { display: none; }
.file-list { display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto; padding-right: 4px; }
.file-list::-webkit-scrollbar { width: 6px; }
.file-list::-webkit-scrollbar-thumb { background-color: #475569; border-radius: 10px; }
.file-item { display: flex; align-items: center; background-color: #1E293B; border: 1px solid #374151; border-radius: 8px; padding: 8px 12px; }
.file-name { flex: 1; margin-right: 12px; }
</style>