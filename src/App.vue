<template>
  <div id="app">
    <!-- Splash inicial -->
    <Splash v-if="splashVisible" @entrar="splashVisible = false" />

    <!-- Contenido principal -->
    <div v-else class="main-content">
      <HeaderMenu />
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HeaderMenu from './components/HeaderMenu.vue'
import Splash from './components/Splash.vue'

const splashVisible = ref(true)
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f7fa;
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Contenido debajo del header */
.main-content {
  width: 100%;
  max-width: 900px;
  padding: 0 16px;
  box-sizing: border-box;
}
</style>
