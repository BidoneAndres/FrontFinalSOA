<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import apiChaco from '@/services/apiChaco';
import keycloak from '@/router/keycloak';

const videoRef = ref(null);
const canvasRef = ref(null);
const fileInputRef = ref(null);
const router = useRouter(); // Inicializamos el router para cambiar de pantalla

const isScanning = ref(false);
const cameraActive = ref(false);
const errorMessage = ref('');
const uploadedImage = ref(null);

// Iniciar la webcam
const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
    });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      cameraActive.value = true;
      uploadedImage.value = null;
      errorMessage.value = '';
    }
  } catch (error) {
    errorMessage.value = 'No se pudo acceder a la cámara. Revisa los permisos.';
  }
};

// Detener la cámara
const stopCamera = () => {
  if (videoRef.value && videoRef.value.srcObject) {
    videoRef.value.srcObject.getTracks().forEach(track => track.stop());
    videoRef.value.srcObject = null;
  }
  cameraActive.value = false;
};

// Disparar input oculto
const triggerFileUpload = () => {
  fileInputRef.value.click();
};

// Subir foto manual
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImage.value = e.target.result;
    stopCamera();
    errorMessage.value = '';
  };
  reader.readAsDataURL(file);
};

// Autenticar
const authenticateUser = async () => {
  if (!cameraActive.value && !uploadedImage.value) return;

  isScanning.value = true;
  errorMessage.value = '';

  let imageData = '';

  if (uploadedImage.value) {
    imageData = uploadedImage.value;
  } else {
    const canvas = canvasRef.value;
    const context = canvas.getContext('2d');
    canvas.width = videoRef.value.videoWidth;
    canvas.height = videoRef.value.videoHeight;
    context.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
    imageData = canvas.toDataURL('image/jpeg', 0.9);
  }

  try {

    const response = await apiChaco.post('/nodo-login-facial-vivo', {
      image: imageData
    });


    const token = response.data.access_token;
   // const user = response.data.user;

    localStorage.setItem('token', token);


    router.push('/');

  } catch (error) {

    if (error.response && error.response.data && error.response.data.detail) {
        errorMessage.value = error.response.data.detail;
    } else {
        errorMessage.value = 'Rostro no reconocido o nivel de confianza insuficiente.';
    }
  } finally {
    isScanning.value = false;
  }
};

const loginWithKeycloak = () => {
  keycloak.login({
    redirectUri: 'https://cernikiw3.chickenkiller.com/web/'
  });
};

// Solo detenemos la cámara al salir
onBeforeUnmount(() => {
  stopCamera();
});
</script>

<template>
  <div class="login-layout">
    <div class="login-card">

      <div class="header">
        <div class="logo-square">AI</div>
        <h2>VisionAI</h2>
      </div>
      <p class="subtitle">Acceso mediante biometría facial</p>

      <div class="camera-container" :class="{ 'scanning-active': isScanning }">

        <video
          ref="videoRef"
          autoplay
          playsinline
          muted
          class="camera-feed"
          v-show="cameraActive && !uploadedImage"
        ></video>

        <img
          v-if="uploadedImage"
          :src="uploadedImage"
          class="camera-feed"
        />

        <div v-if="!cameraActive && !uploadedImage" class="camera-placeholder">
          <v-icon size="40" color="#94A3B8" class="mb-2">mdi-webcam</v-icon>
          <span class="mb-4 text-center">La cámara está apagada</span>
          <v-btn color="#3B82F6" variant="tonal" size="small" @click="startCamera">
            Activar Cámara
          </v-btn>
        </div>

        <div v-if="isScanning" class="scanner-line"></div>
      </div>

      <canvas ref="canvasRef" style="display: none;"></canvas>
      <input type="file" ref="fileInputRef" accept="image/*" style="display: none" @change="handleFileUpload" />

      <v-btn
        block
        color="#3B82F6"
        size="x-large"
        class="action-btn"
        :loading="isScanning"
        :disabled="!cameraActive && !uploadedImage"
        @click="authenticateUser"
      >
        Escanear e Ingresar
      </v-btn>

      <div class="actions-row mt-4 gap-2">
        <v-btn
          v-if="cameraActive && !uploadedImage"
          variant="text"
          size="small"
          class="fallback-btn text-red-400 hover:text-red-300"
          @click="stopCamera"
        >
          <v-icon left class="mr-1">mdi-camera-off</v-icon> Apagar cámara
        </v-btn>

        <v-btn
          v-if="!uploadedImage"
          variant="text"
          size="small"
          class="fallback-btn"
          @click="triggerFileUpload"
        >
          <v-icon left class="mr-1">mdi-upload</v-icon> Subir foto manual
        </v-btn>

        <v-btn
          v-if="uploadedImage"
          variant="text"
          size="small"
          class="fallback-btn"
          @click="startCamera"
        >
          <v-icon left class="mr-1">mdi-camera</v-icon> Usar cámara web
        </v-btn>
      </div>

      <div class="keycloak-divider">
        <span>o</span>
      </div>

      <v-btn
        block
        variant="outlined"
        color="#94A3B8"
        size="large"
        class="keycloak-btn"
        @click="loginWithKeycloak"
      >
        <v-icon left class="mr-2">mdi-key</v-icon>
        Iniciar sesión de otra forma
      </v-btn>

      <Transition name="fade">
        <div v-if="errorMessage" class="error-msg mt-4">
          <v-icon size="20" class="mr-1">mdi-alert-circle-outline</v-icon>
          {{ errorMessage }}
        </div>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
.login-layout {
  height: 100vh;
  width: 100vw;
  background-color: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gap-2 {
  gap: 12px;
}
.text-red-400 {
  color: #F87171 !important;
}

.login-card {
  background: #1E293B;
  border: 1px solid #243041;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-square {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #3B82F6;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
}

h2 {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.subtitle {
  color: #94A3B8;
  font-size: 0.9rem;
  margin-bottom: 32px;
}

.camera-container {
  width: 320px;
  height: 240px;
  border-radius: 12px;
  background: #0F172A;
  border: 2px dashed #334155;
  position: relative;
  overflow: hidden;
  margin-bottom: 32px;
  transition: all 0.3s ease;
}

.camera-container:not(:has(.camera-placeholder)) {
  border: 2px solid #243041;
}

.camera-container.scanning-active {
  border-color: #3B82F6;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.camera-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

video.camera-feed {
  transform: scaleX(-1);
}

.camera-placeholder {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
  font-size: 0.9rem;
}

.scanner-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(59, 130, 246, 0.8);
  box-shadow: 0 0 15px rgba(59, 130, 246, 1);
  animation: scan 2s infinite linear;
}

@keyframes scan {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

.action-btn {
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.actions-row {
  display: flex;
  justify-content: center;
  width: 100%;
}

.fallback-btn {
  color: #94A3B8 !important;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

.fallback-btn:hover {
  color: white !important;
}

.error-msg {
  color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  border: 1px solid rgba(239, 68, 68, 0.2);
  width: 100%;
}

.keycloak-divider {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 20px 0;
  gap: 12px;
}

.keycloak-divider::before,
.keycloak-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #334155;
}

.keycloak-divider span {
  color: #64748B;
  font-size: 0.85rem;
}

.keycloak-btn {
  border-radius: 10px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
