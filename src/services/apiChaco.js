import axios from "axios";

const apiChaco = axios.create({
  baseURL: "https://cernikiw3.chickenkiller.com",
  headers: {
    "Content-Type": "application/json"
  }
});

apiChaco.interceptors.request.use(



  (config) => {
    const token = localStorage.getItem('token');


    console.log("URL:", config.url);
    console.log("TOKEN ENVIADO:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiChaco.interceptors.response.use(
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

export default apiChaco;
