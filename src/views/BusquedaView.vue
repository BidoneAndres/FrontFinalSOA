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
            @click="buscarFotogramas"
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

                        <v-text-field

                            v-model="filters.latMin"

                            label="Latitud mínima"

                            variant="outlined"

                            rounded="xl"

                            density="comfortable"

                        />

                    </v-col>

                    <v-col cols="12" md="2">

                        <v-text-field

                            v-model="filters.latMax"

                            label="Latitud máxima"

                            variant="outlined"

                            rounded="xl"

                            density="comfortable"

                        />

                    </v-col>

                    <v-col cols="12" md="2">

                        <v-text-field

                            v-model="filters.lonMin"

                            label="Longitud mínima"

                            variant="outlined"

                            rounded="xl"

                            density="comfortable"

                        />

                    </v-col>

                    <v-col cols="12" md="2">

                        <v-text-field

                            v-model="filters.lonMax"

                            label="Longitud máxima"

                            variant="outlined"

                            rounded="xl"

                            density="comfortable"

                        />

                    </v-col>

                    <v-col cols="12" md="2">

                        <v-text-field

                            v-model="filters.clase"

                            label="Clase"

                            variant="outlined"

                            rounded="xl"

                            density="comfortable"

                            prepend-inner-icon="mdi-tag"

                        />

                    </v-col>

                    <v-col
                        cols="12"
                        md="2"
                        class="d-flex align-end"
                    >

                        <v-btn

                            block

                            color="primary"

                            rounded="xl"

                            height="56"

                            prepend-icon="mdi-magnify"

                            @click="buscarFotogramas"

                        >

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

                {{ frames.length }}

                fotogramas encontrados

            </span>

        </div>

    </div>

    <!-- ========================= -->
    <!-- GRID -->
    <!-- ========================= -->

    <v-row>

        <v-col

            v-for="frame in frames"

            :key="frame.id"

            cols="12"

            md="6"

            xl="4"

        >

            <v-card class="frame-card">

                <div class="thumbnail">

                    <img
                        v-if="frame.thumbnail"
                        :src="frame.thumbnail"
                    >

                    <v-icon
                        v-else
                        size="64"
                    >
                        mdi-camera
                    </v-icon>

                </div>

                <div class="frame-content">

                    <div class="frame-id">

                        {{ frame.id }}

                    </div>

                    <div class="chips">

                        <v-chip

                            v-for="obj in frame.objects"

                            :key="obj"

                            color="primary"

                            size="small"

                            variant="tonal"

                        >

                            {{ obj }}

                        </v-chip>

                    </div>

                    <v-btn

                        block

                        color="primary"

                        rounded="xl"

                        variant="tonal"

                        prepend-icon="mdi-eye"

                    >

                        Ver Fotograma

                    </v-btn>

                </div>

            </v-card>

        </v-col>

    </v-row>

</div>

</template>

<script setup>
import { ref, computed } from "vue";
import api from "@/services/api.js";

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
 * MODAL
 * ========================================================== */

const abrirModalImagen = (frame) => {

  modal.value.frame = frame;

  modal.value.show = true;

};

const cerrarModal = () => {

  modal.value.show = false;

  modal.value.frame = null;

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