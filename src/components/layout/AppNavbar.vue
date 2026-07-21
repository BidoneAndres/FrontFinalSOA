<template>
<div class="navbar">
    <div class="left">
        <v-btn
            icon="mdi-menu"
            variant="text"
            @click="layout.sidebar = !layout.sidebar"
        />
        
    </div>

    <div class="right">
        <v-btn
            icon="mdi-bell-outline"
            variant="text"
        />

        <span class="user-name">{{ userName }}</span>

        
    </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useLayoutStore } from "@/stores/layout";

const layout = useLayoutStore();


const userName = ref("Invitado");

const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

onMounted(() => {
    
    const token = localStorage.getItem('token'); 
    
    if (token) {
        
        const decodedToken = parseJwt(token);
        
        if (decodedToken) {
            
            userName.value = decodedToken.name || decodedToken.preferred_username || "Usuario";
        }
    }
});

</script>

<style scoped>
.navbar {
    height: 72px;
    background: #1E293B;
    border-radius: 0; 
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    border-bottom: 1px solid #243041;
    box-shadow: 0 4px 15px rgba(0,0,0,.10);
}

.left {
    display:flex;
    align-items:center;
    gap:16px;
}

.right {
    display:flex;
    align-items:center;
    gap:12px;
}

h2 {
    color:white;
    font-weight:600;
}


.user-name {
    color: white;
    font-weight: 500;
    font-size: 1rem;
    margin-right: 4px;
    text-transform: capitalize; 
}
</style>