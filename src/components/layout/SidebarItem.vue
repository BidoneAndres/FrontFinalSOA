<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const props = defineProps({
  icon: String,
  title: String,
  to: String,
  collapsed: Boolean,
});
</script>

<template>
  <RouterLink
    :to="to"
    class="sidebar-item"
    :class="{ active: route.path === to }"
  >
    <v-icon size="22">{{ icon }}</v-icon>

    <Transition name="fade">
      <span v-if="!collapsed">
        {{ title }}
      </span>
    </Transition>
  </RouterLink>
</template>

<style scoped>
.sidebar-item {
  height: 50px;
  display: flex;
  align-items: center;
  gap: 16px;

  padding: 0 16px;

  border-radius: 14px;

  color: #cbd5e1;

  transition: all .25s ease;
}

.sidebar-item:hover {
  background: rgba(59,130,246,.12);
  color: white;
}

.sidebar-item.active {
  background: rgba(59,130,246,.18);
  color: white;
  border-left: 4px solid #3B82F6;
}

span{
  font-weight:500;
}

a{
  text-decoration:none;
}
</style>