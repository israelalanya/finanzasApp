<template>
  <nav class="menu">
    <ul>
      <li><router-link to="/">Dashboard</router-link></li>
      <li><router-link to="/movimientos">Movimientos</router-link></li>
      <li><router-link to="/flujo">Flujo de Caja</router-link></li>
      <li><router-link to="/config">Configuración</router-link></li>
      
    </ul>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.menu {
  background: #222;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}
.menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
.menu li {
  margin: 0.5rem 0;
}
.menu a {
  color: white;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 6px;
  transition: 0.3s;
}
.menu a.router-link-active {
  font-weight: bold;
  color: #42b983;
  background: rgba(255,255,255,0.1);
}
.menu a:hover {
  background: rgba(255,255,255,0.2);
}
@media (max-width: 600px) {
  .menu ul {
    flex-direction: column;
    align-items: center;
  }
}
</style>
