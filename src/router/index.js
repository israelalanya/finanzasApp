import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Movimientos from '../views/Movimientos.vue'
import Configuracion from '../views/Configuracion.vue'
import Deudas from '../views/Deudas.vue'
import Prestamos from '../views/Prestamos.vue'
import Metas from '../views/Metas.vue' // <-- componente Metas

const routes = [
  { path: '/', component: Dashboard },
  { path: '/movimientos', component: Movimientos },
  { path: '/config', component: Configuracion },
  { path: '/deudas', component: Deudas },
  { path: '/metas', component: Metas }, // <-- nueva ruta para Metas
  { path: '/prestamos', component: Prestamos }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
