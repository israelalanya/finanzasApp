<template>
  <nav class="menu">
    <ul>
      <li>
        <router-link to="/">
          <i class="fas fa-chart-line"></i>
          <span>Dashboard</span>
        </router-link>
      </li>
      <li>
        <router-link to="/movimientos">
          <i class="fas fa-exchange-alt"></i>
          <span>Movimientos</span>
        </router-link>
      </li>
      <li>
        <router-link to="/prestamos">
          <i class="fas fa-hand-holding-usd"></i>
          <span>Préstamos</span>
        </router-link>
      </li>
      <li>
        <router-link to="/deudas">
          <i class="fas fa-file-invoice-dollar"></i>
          <span>Deudas</span>
        </router-link>
      </li>
      <li>
        <router-link to="/metas">
          <i class="fas fa-bullseye"></i>
          <span>Metas</span>
        </router-link>
      </li>
      <li>
        <router-link to="/config">
          <i class="fas fa-cogs"></i>
          <span>Configuración</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
// Sin cambios: estructura ligera y eficiente
</script>

<style scoped>
.menu {
  background: #1e1e2f;
  padding: 1rem 1.2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  font-family: "Poppins", sans-serif;
}

.menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}

.menu li {
  margin: 0.3rem 0;
}

.menu a {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #cfd8dc;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
  transition: 0.3s ease;
  font-weight: 500;
}

.menu a span {
  display: inline-block;
}

.menu a i {
  font-size: 1.1rem;
}

.menu a.router-link-active {
  background: rgba(0, 188, 212, 0.15);
  color: #00e5ff;
  font-weight: 600;
  border-bottom: 2px solid #00e5ff;
}

.menu a:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transform: translateY(-1px);
}

@media (max-width: 700px) {
  .menu ul {
    flex-direction: column;
  }
  .menu a {
    width: 100%;
    justify-content: center;
  }
}
</style>
