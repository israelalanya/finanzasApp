<template>
  <div class="splash">
    <div class="logo">FinanzApp</div>
    <h1>Bienvenido a tu gestor financiero</h1>
    <p>Controla tus ingresos, gastos, deudas y ahorros de manera fácil</p>

    <button class="ingresar" @click="$emit('entrar')">
      Ingresar
    </button>
  </div>
</template>

<script setup>
</script>

<style scoped>
.splash {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #42b983, #1e3c72);
  color: white;
  text-align: center;
  padding: 20px;
}

.logo {
  font-size: 3rem;
  margin-bottom: 20px;
}

h1 {
  font-size: 2rem;
  margin-bottom: 10px;
}

p {
  font-size: 1rem;
  margin-bottom: 30px;
  max-width: 300px;
}

.ingresar {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: #fff;
  color: #42b983;
  transition: 0.3s;
}

.ingresar:hover {
  background-color: #f0f0f0;
}
</style>
