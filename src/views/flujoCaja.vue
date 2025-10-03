<template>
  <div class="flujo-caja">
    <h2>💹 Flujo de Caja</h2>

    <!-- Selección de año -->
    <div class="filtro-anio">
      <label>Año:</label>
      <input type="number" v-model="anio" min="2000" max="2100" />
    </div>

    <!-- Botones de meses disponibles -->
    <div class="meses-botones">
      <button
        v-for="m in mesesDisponibles"
        :key="m"
        :class="{ activo: mes === m }"
        @click="mes = m"
      >
        {{ meses[m].slice(0,3) }}
      </button>
    </div>

    <!-- Resumen del mes -->
    <div class="resumen-mes" v-if="mes !== null">
      <h3>Resumen {{ meses[mes] }} {{ anio }}</h3>
      <div>Ingresos: S/ {{ totalIngresosMes.toFixed(2) }}</div>
      <div style="color:red">Gastos: S/ {{ totalGastosMes.toFixed(2) }}</div>
      <div style="color:blue">Ahorros: S/ {{ totalAhorrosMes.toFixed(2) }}</div>
      <div style="color:orange">Préstamos: S/ {{ totalPrestamosMes.toFixed(2) }}</div>
      <div style="color:purple">Deudas: S/ {{ totalDeudasMes.toFixed(2) }}</div>
      <div :style="{ color: balanceMes >= 0 ? 'green' : 'red' }">
        Balance: S/ {{ balanceMes.toFixed(2) }}
      </div>

      <div v-if="categoriaMayor">
        <strong>Categoría con mayor gasto:</strong>
        {{ categoriaMayor.nombre }} (S/ {{ categoriaMayor.monto.toFixed(2) }})
      </div>
    </div>

    <!-- Gráfico de barras de gastos por categoría -->
    <div class="grafico-categorias" v-if="categoriasGasto.length">
      <h3>Gastos por categoría</h3>
      <canvas ref="categoriaChart" height="200"></canvas>
    </div>

    <!-- Lista de movimientos del mes -->
    <div class="lista-movimientos" v-if="movimientosDelMes.length">
      <h3>Movimientos</h3>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Cuenta</th>
            <th>Categoría</th>
            <th>Medio</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in movimientosDelMes" :key="m.id">
            <td>{{ new Date(m.fecha).toLocaleDateString() }}</td>
            <td>{{ m.tipo }}</td>
            <td>{{ m.cuenta }}</td>
            <td>{{ m.categoria }}</td>
            <td>{{ m.medio }}</td>
            <td :style="{ color: m.tipo === 'gasto' || m.tipo === 'fijo' || m.tipo === 'deuda' ? 'red' : 'green' }">
              {{ m.monto.toFixed(2) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>No hay movimientos en este mes.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import { useFinanzasStore } from '../stores/finanzas'

const store = useFinanzasStore()
const anio = ref(new Date().getFullYear())
const mes = ref(null)

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const mesesDisponibles = computed(() => {
  const mesesSet = new Set()
  store.movimientos.forEach(mov => {
    const fecha = new Date(mov.fecha)
    if (fecha.getFullYear() === anio.value) mesesSet.add(fecha.getMonth())
  })
  return Array.from(mesesSet).sort((a, b) => a - b)
})

if (mesesDisponibles.value.length > 0 && mes.value === null) {
  mes.value = mesesDisponibles.value[0]
}

const movimientosDelMes = computed(() => {
  if (mes.value === null) return []
  return store.movimientos.filter(m => {
    const fecha = new Date(m.fecha)
    return fecha.getFullYear() === anio.value && fecha.getMonth() === mes.value
  })
})

const totalIngresosMes = computed(() =>
  movimientosDelMes.value.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + m.monto, 0)
)
const totalGastosMes = computed(() =>
  movimientosDelMes.value.filter(m => m.tipo === 'gasto' || m.tipo === 'fijo').reduce((acc, m) => acc + m.monto, 0)
)
const totalAhorrosMes = computed(() =>
  movimientosDelMes.value.filter(m => m.tipo === 'ahorro').reduce((acc, m) => acc + m.monto, 0)
)
const totalPrestamosMes = computed(() =>
  movimientosDelMes.value.filter(m => m.tipo === 'prestamo').reduce((acc, m) => acc + m.monto, 0)
)
const totalDeudasMes = computed(() =>
  movimientosDelMes.value.filter(m => m.tipo === 'deuda').reduce((acc, m) => acc + m.monto, 0)
)
const totalFijosMes = computed(() =>
  movimientosDelMes.value.filter(m => m.tipo === 'fijo').reduce((acc, m) => acc + m.monto, 0)
)

const balanceMes = computed(() =>
  totalIngresosMes.value - totalGastosMes.value - totalFijosMes.value - totalDeudasMes.value + totalAhorrosMes.value - totalPrestamosMes.value
)

// Categoría de gasto con mayor monto
const categoriaMayor = computed(() => {
  const gastos = movimientosDelMes.value.filter(m => m.tipo === 'gasto' || m.tipo === 'fijo')
  if (!gastos.length) return null

  const sumaCategorias = {}
  gastos.forEach(m => {
    if (!sumaCategorias[m.categoria]) sumaCategorias[m.categoria] = 0
    sumaCategorias[m.categoria] += m.monto
  })

  let maxCat = { nombre: '', monto: 0 }
  Object.keys(sumaCategorias).forEach(cat => {
    if (sumaCategorias[cat] > maxCat.monto) {
      maxCat = { nombre: cat, monto: sumaCategorias[cat] }
    }
  })
  return maxCat
})

// Datos para gráfico de barras
const categoriaChart = ref(null)
let chartInstance = null

const categoriasGasto = computed(() => {
  const gastos = movimientosDelMes.value.filter(m => m.tipo === 'gasto' || m.tipo === 'fijo')
  const sumaCategorias = {}
  gastos.forEach(m => {
    if (!sumaCategorias[m.categoria]) sumaCategorias[m.categoria] = 0
    sumaCategorias[m.categoria] += m.monto
  })
  return Object.entries(sumaCategorias).map(([nombre, monto]) => ({ nombre, monto }))
})

const renderChart = () => {
  if (!categoriaChart.value) return
  const ctx = categoriaChart.value.getContext('2d')
  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categoriasGasto.value.map(c => c.nombre),
      datasets: [{
        label: 'Gasto (S/)',
        data: categoriasGasto.value.map(c => c.monto),
        backgroundColor: '#42b983'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  })
}

watch([movimientosDelMes], () => {
  renderChart()
}, { deep: true })

onMounted(() => {
  renderChart()
})
</script>

<style scoped>
.flujo-caja { max-width: 700px; margin: 20px auto; font-family: sans-serif; }
h2 { text-align: center; margin-bottom: 16px; }
.filtro-anio { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.meses-botones { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.meses-botones button { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; background: #eee; transition: 0.3s; }
.meses-botones button.activo { background: #42b983; color: white; font-weight: bold; }
.resumen-mes { background: #fff; padding: 16px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
.lista-movimientos table { width: 100%; border-collapse: collapse; }
.lista-movimientos th, .lista-movimientos td { padding: 8px; border-bottom: 1px solid #ddd; text-align: center; }
.grafico-categorias { background: #fff; padding: 16px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
</style>
