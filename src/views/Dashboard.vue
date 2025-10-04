<template>
  <div class="dashboard">
    <h1>Resumen Financiero</h1>

    <!-- Cards resumen con porcentajes -->
    <div class="cards">
      <div class="card ingreso">
        <h3>Ingresos</h3>
        <p>S/ {{ store.totalIngresos.toFixed(2) }}</p>
        <span class="percent" :style="{ color: ingresoPercentage < 0 ? '#e74c3c' : '#2ecc71' }">{{ ingresoPercentage }}%</span>
      </div>
      <div class="card gasto">
        <h3>Gastos</h3>
        <p>S/ {{ store.totalGastos.toFixed(2) }}</p>
        <span class="percent" :style="{ color: gastoPercentage < 0 ? '#e74c3c' : '#2ecc71' }">{{ gastoPercentage }}%</span>
      </div>
      <div class="card ahorro">
        <h3>Ahorros</h3>
        <p>S/ {{ store.totalAhorros.toFixed(2) }}</p>
      </div>
      <div class="card prestamo">
        <h3>Préstamos</h3>
        <p>S/ {{ store.totalPrestamos.toFixed(2) }}</p>
      </div>
      <div class="card deuda">
        <h3>Deudas</h3>
        <p>S/ {{ store.totalDeudas.toFixed(2) }}</p>
      </div>
      <div class="card fijo">
        <h3>Gastos Fijos</h3>
        <p>S/ {{ store.totalFijos.toFixed(2) }}</p>
      </div>
      <div class="card balance">
        <h3>Balance General</h3>
        <p>S/ {{ store.balance.toFixed(2) }}</p>
      </div>
    </div>

    <!-- Gráfico pie: distribución de gastos por categoría -->
    <div class="chart-container">
      <h2>Distribución de Gastos/Ingresos por Categoría</h2>
      <PieChart :data="pieData" />
    </div>

    <!-- Gráfico barras: presupuesto vs gastos por categoría -->
    <div class="chart-container">
      <h2>Presupuesto vs Gastos por Categoría</h2>
      <div class="presupuesto-section">
        <div
          v-for="(cat, key) in gastoPorCategoria"
          :key="key"
          class="presupuesto-bar"
        >
          <span class="cat-label">{{ key }}: S/ {{ cat.gasto.toFixed(2) }} / S/ {{ cat.presupuesto.toFixed(2) }}</span>
          <div class="bar-bg">
            <div
              class="bar-fill"
              :style="{
                width: Math.min(cat.gasto / cat.presupuesto * 100, 100) + '%',
                background: barColor(cat.gasto, cat.presupuesto),
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráfico barras: flujo de caja por mes -->
    <div class="chart-container">
      <h2>Flujo de Caja Mensual</h2>
      <BarChart :data="barData" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFinanzasStore } from '../stores/finanzas'
import PieChart from '../components/PieChart.vue'
import BarChart from '../components/BarChart.vue'

const store = useFinanzasStore()

// Datos para el gráfico Pie: distribución de gastos/ingresos
const pieData = computed(() => {
  const categorias = {}
  store.movimientos.forEach(m => {
    if(m.tipo === 'gasto' || m.tipo === 'ingreso') {
      categorias[m.categoria] = (categorias[m.categoria] || 0) + m.monto
    }
  })
  return Object.entries(categorias).map(([name, value]) => ({ name, value }))
})

// Datos para el gráfico de barras: flujo de caja por mes
const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
const barData = computed(() => {
  const labels = meses
  const dataSet = labels.map((_, i) => {
    const mes = i
    const anio = new Date().getFullYear()
    const flujo = store.flujoCajaPorMes(mes, anio)
    return flujo.saldoFinal
  })
  return {
    labels,
    datasets: [
      { label: 'Saldo Final', data: dataSet, backgroundColor: '#42b983' }
    ]
  }
})

// Cálculo de porcentaje para el resumen de ingresos y gastos
const ingresoPercentage = computed(() => {
  return (store.totalIngresos / store.balance) * 100 - 100
})

const gastoPercentage = computed(() => {
  return (store.totalGastos / store.balance) * 100 - 100
})

// Presupuesto vs Gasto por categoría
const gastoPorCategoria = computed(() => {
  const categorias = {}
  store.movimientos.forEach(m => {
    if(m.tipo === 'gasto' || m.tipo === 'fijo') {
      if (!categorias[m.categoria]) {
        categorias[m.categoria] = { gasto: 0, presupuesto: 0 }
      }
      categorias[m.categoria].gasto += m.monto
      categorias[m.categoria].presupuesto = m.presupuesto || categorias[m.categoria].presupuesto
    }
  })
  return categorias
})

const barColor = (gasto, presupuesto) => {
  if (!presupuesto) return '#42b983'
  const pct = gasto / presupuesto
  if (pct <= 0.7) return '#42b983'
  if (pct <= 1) return '#f1c40f'
  return '#e74c3c'
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.card {
  padding: 15px;
  border-radius: 10px;
  color: white;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}
.card:hover {
  transform: translateY(-3px);
}

.ingreso { background: #2ecc71; }
.gasto { background: #e74c3c; }
.ahorro { background: #3498db; }
.prestamo { background: #1abc9c; }
.deuda { background: #c0392b; }
.fijo { background: #1976d2; }
.balance { background: #f39c12; }

.card h3 {
  margin-bottom: 10px;
  font-size: 16px;
}
.card p {
  font-size: 20px;
  font-weight: bold;
}

.percent {
  font-size: 14px;
  display: block;
  margin-top: 5px;
}

.chart-container {
  margin-bottom: 40px;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-container h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

.presupuesto-section {
  margin-top: 20px;
}

.presupuesto-bar {
  margin-bottom: 12px;
}

.cat-label {
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.bar-bg {
  width: 100%;
  height: 18px;
  background: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 8px 0 0 8px;
  transition: width 0.3s;
}
</style>
