import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    // Acá interceptamos cada petición antes de que salga hacia el backend.
    // Buscamos el token de Keycloak que guardaste en el login y se lo pegamos a la cabecera.
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    // Si la petición fue exitosa (Status 200), devolvemos la respuesta limpia
    return response;
  },
  (error) => {
    // Atajamos errores globales para que no crashee la app
    
    // Si el backend te patea porque el token expiró o es inválido (Error 401)
    if (error.response && error.response.status === 401) {
      console.error('Acceso denegado o token expirado. Debes iniciar sesión nuevamente.');
      
      // Opcional: limpiar el token viejo y mandar al usuario a la pantalla de login
      // localStorage.removeItem('token');
      // window.location.href = '/login'; 
    }
    
    // Si el backend de Python o Node-RED se caen (Error 500)
    if (error.response && error.response.status === 500) {
      console.error('Error interno del servidor en el backend.');
    }

    return Promise.reject(error);
  }
);

export default api;