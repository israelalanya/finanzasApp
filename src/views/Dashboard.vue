<template>
  <div class="dashboard">
    <h1>📊 Dashboard Financiero</h1>

    <!-- Resumen general -->
    <div class="resumen">
      <div>Ingresos: <strong>S/ {{ totalIngresos.toFixed(2) }}</strong></div>
      <div>Gastos: <strong style="color:red">-S/ {{ totalGastos.toFixed(2) }}</strong></div>
      <div>Ahorros: <strong style="color:blue">S/ {{ totalAhorros.toFixed(2) }}</strong></div>
      <div>Préstamos: <strong style="color:orange">S/ {{ totalPrestamos.toFixed(2) }}</strong></div>
      <div>Deudas: <strong style="color:purple">S/ {{ totalDeudas.toFixed(2) }}</strong></div>
      <div>Balance: <strong :style="{ color: balance >= 0 ? 'green' : 'red' }">
        S/ {{ balance.toFixed(2) }}
      </strong></div>
    </div>

    <!-- Gráfico de barras -->
    <div class="graficos">
      <canvas ref="barChart" height="200"></canvas>
    </div>

    <!-- Gráfico circular -->
    <div class="graficos">
      <canvas ref="pieChart" height="200"></canvas>
    </div>

    <!-- Deudas y préstamos con progreso -->
    <div class="deudas-prestamos" v-if="movimientosDeudaPrestamo.length">
      <h2>Deudas y Préstamos</h2>
      <div v-for="m in movimientosDeudaPrestamo" :key="m.id" class="progreso-item">
        <div class="titulo">{{ m.tipo }} - {{ m.categoria || '-' }} (S/ {{ m.monto }})</div>
        <div class="barra">
          <div class="relleno" :style="{ width: porcentajePagado(m) + '%' }"></div>
        </div>
        <div class="detalle">Pagado: S/ {{ m.pagado || 0 }} ({{ porcentajePagado(m).toFixed(0) }}%)</div>
      </div>
    </div>

    <!-- Presupuesto mensual por categoría -->
    <div class="presupuesto" v-if="categoriasGasto.length">
      <h2>Presupuesto Mensual</h2>
      <div v-for="cat in categoriasGasto" :key="cat" class="presupuesto-item">
        <div class="titulo">{{ cat }}</div>
        <div class="barra">
          <div class="relleno" :style="{ width: porcentajeGasto(cat) + '%' }"></div>
        </div>
        <div class="detalle">
          Gastado: S/ {{ gastoPorCategoria(cat) }} / Presupuesto: S/ {{ presupuesto[cat] || 0 }} ({{ porcentajeGasto(cat).toFixed(0) }}%)
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Chart from 'chart.js/auto'
import { useFinanzasStore } from '../stores/finanzas'
import { useConfigStore } from '../stores/config'

const store = useFinanzasStore()
const config = useConfigStore()

const barChart = ref(null)
const pieChart = ref(null)
let barInstance = null
let pieInstance = null

const totalIngresos = computed(() => store.totalIngresos)
const totalGastos = computed(() => store.totalGastos)
const totalAhorros = computed(() => store.totalAhorros)
const totalPrestamos = computed(() => store.totalPrestamos)
const totalDeudas = computed(() => store.totalDeudas)
const balance = computed(() => store.balance)

// Movimientos de deuda y préstamo
const movimientosDeudaPrestamo = computed(() => 
  store.movimientos.filter(m => m.tipo === 'deuda' || m.tipo === 'prestamo')
)

// Porcentaje pagado
const porcentajePagado = (m) => {
  if (!m.monto) return 0
  return Math.min(((m.pagado || 0) / m.monto) * 100, 100)
}

// Presupuesto mensual
const categoriasGasto = computed(() => config.categoriasGasto || [])
const presupuesto = computed(() => config.presupuesto || {})

const gastoPorCategoria = (cat) => {
  return store.movimientos
    .filter(m => m.tipo === 'gasto' && m.categoria === cat)
    .reduce((sum, m) => sum + m.monto, 0)
}

const porcentajeGasto = (cat) => {
  if (!presupuesto.value[cat] || presupuesto.value[cat] === 0) return 0
  return Math.min((gastoPorCategoria(cat) / presupuesto.value[cat]) * 100, 100)
}

// Renderizar gráficos
const renderCharts = () => {
  const ctxBar = barChart.value.getContext('2d')
  if(barInstance) barInstance.destroy()
  barInstance = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['Ingresos', 'Gastos', 'Ahorros', 'Préstamos', 'Deudas'],
      datasets: [{
        label: 'Montos (S/)',
        data: [totalIngresos.value, totalGastos.value, totalAhorros.value, totalPrestamos.value, totalDeudas.value],
        backgroundColor: ['green', 'red', 'blue', 'orange', 'purple']
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  })

  const ctxPie = pieChart.value.getContext('2d')
  if(pieInstance) pieInstance.destroy()
  pieInstance = new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: ['Gastos', 'Ahorros', 'Préstamos', 'Deudas'],
      datasets: [{
        data: [totalGastos.value, totalAhorros.value, totalPrestamos.value, totalDeudas.value],
        backgroundColor: ['red', 'blue', 'orange', 'purple']
      }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  })
}

onMounted(() => renderCharts())

watch([totalIngresos, totalGastos, totalAhorros, totalPrestamos, totalDeudas], () => renderCharts())
</script>

<style scoped>
.dashboard { max-width: 600px; margin: 20px auto; font-family: sans-serif; }
h1, h2 { text-align: center; }
.resumen, .graficos, .deudas-prestamos, .presupuesto {
  background: #fff; padding: 16px; border-radius: 12px; margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.progreso-item, .presupuesto-item { margin-bottom: 12px; }
.titulo { font-weight: bold; }
.barra { width: 100%; height: 16px; background: #eee; border-radius: 8px; overflow: hidden; margin: 4px 0; }
.relleno { height: 100%; background: orange; transition: width 0.3s; }
.detalle { font-size: 0.85rem; color: #555; }
</style>
