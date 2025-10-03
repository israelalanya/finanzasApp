import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Movimientos from '../views/Movimientos.vue'
import Configuracion from '../views/Configuracion.vue'
import FlujoCaja from '../views/flujoCaja.vue'  // <-- importamos

const routes = [
  { path: '/', component: Dashboard },
  { path: '/movimientos', component: Movimientos },
  { path: '/config', component: Configuracion },
  { path: '/flujo', component: FlujoCaja } // <-- nueva ruta
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
