<template>
  <div class="dashboard">
    <h1>Resumen Financiero</h1>

    <!-- Cards resumen -->
    <div class="cards">
      <div class="card ingreso">
        <h3>Ingresos</h3>
        <p>S/ {{ finanzasStore.totalIngresos.toFixed(2) }}</p>
        <span class="percent" :style="{ color: ingresoPercentage < 0 ? '#e74c3c' : '#2ecc71' }">{{ ingresoPercentage.toFixed(1) }}%</span>
      </div>
      <div class="card gasto">
        <h3>Gastos (fijos + diarios)</h3>
        <p>S/ {{ totalGastos.toFixed(2) }}</p>
        <span class="percent" :style="{ color: gastoPercentage < 0 ? '#e74c3c' : '#2ecc71' }">{{ gastoPercentage.toFixed(1) }}%</span>
      </div>
      <div class="card presupuesto-total">
        <h3>Presupuesto Mensual</h3>
        <p>S/ {{ presupuestoTotal.toFixed(2) }}</p>
      </div>
      <div class="card presupuesto-gastado">
        <h3>Presupuesto Gastado</h3>
        <p>S/ {{ presupuestoGastado.toFixed(2) }}</p>
        <span class="percent" :style="{ color: porcentajePresupuestoColor }">{{ porcentajeUsoPresupuesto.toFixed(1) }}%</span>
      </div>
      <div class="card ahorro">
        <h3>Ahorros</h3>
        <p>S/ {{ finanzasStore.totalAhorros.toFixed(2) }}</p>
      </div>
      <div class="card prestamo">
        <h3>Préstamos</h3>
        <p>S/ {{ prestamosStore.totalPrestamos.toFixed(2) }}</p>
      </div>
      <div class="card deuda">
        <h3>Deudas</h3>
        <p>S/ {{ prestamosStore.totalDeudas.toFixed(2) }}</p>
      </div>
      <div class="card balance">
        <h3>Balance General</h3>
        <p>S/ {{ finanzasStore.balance.toFixed(2) }}</p>
      </div>
    </div>

    <!-- Presupuesto vs Gastos por Categoría -->
    <div class="chart-container">
      <h2>Presupuesto vs Gastos por Categoría</h2>
      <div class="presupuesto-section">
        <div v-for="(cat, key) in gastoPorCategoria" :key="key" class="presupuesto-bar">
          <span class="cat-label">
            {{ key }}: S/ {{ cat.gasto.toFixed(2) }} / S/ {{ cat.presupuesto.toFixed(2) }}
            <strong>({{ porcentajeUso(cat.gasto, cat.presupuesto).toFixed(1) }}%)</strong>
          </span>
          <div class="bar-bg">
            <div
              class="bar-fill"
              :style="{
                width: Math.min((cat.gasto / cat.presupuesto) * 100, 100) + '%',
                background: barColor(cat.gasto, cat.presupuesto),
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Flujo de Caja Mensual Interactivo -->
    <div class="chart-container">
      <h2>Flujo de Caja Mensual</h2>
      <div class="mes-buttons">
        <button
          v-for="(mes, i) in meses"
          :key="i"
          :class="{ active: mesSeleccionado === i }"
          @click="mesSeleccionado = i"
        >
          {{ mes }}
        </button>
      </div>
      <div class="flujo-info">
        <p><strong>Mes:</strong> {{ meses[mesSeleccionado] }}</p>
        <p><strong>Saldo Final:</strong> S/ {{ flujoSaldoFinal.toFixed(2) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'

const finanzasStore = reactive({
  movimientos: [
    { tipo: 'gasto', categoria: 'Educación', monto: 200 },
    { tipo: 'gasto', categoria: 'Transporte', monto: 150 },
    { tipo: 'fijo', categoria: 'Alquiler', monto: 1000 },
    { tipo: 'ingreso', categoria: 'Sueldo', monto: 3000 },
    { tipo: 'ahorro', categoria: 'Fondo Emergencia', monto: 500 }
  ],
  totalIngresos: 3000,
  totalGastos: 1350,
  totalAhorros: 500,
  balance: 2150,
  flujoCajaPorMes(mes) {
    // Ejemplo: saldo final decrece $100 cada mes
    return { saldoFinal: 2150 - mes * 100 }
  }
})

const prestamosStore = reactive({
  totalPrestamos: 800,
  totalDeudas: 400
})

const configStore = reactive({
  presupuestos: {
    Educación: 450,
    Transporte: 200,
    Alquiler: 1000
  }
})

// Cálculos de porcentaje para resumen
const ingresoPercentage = computed(() => {
  if (finanzasStore.balance === 0) return 0
  return (finanzasStore.totalIngresos / finanzasStore.balance) * 100 - 100
})

// Suma gastos fijos + gastos diarios
const totalGastos = computed(() => {
  let suma = 0
  finanzasStore.movimientos.forEach(m => {
    if (m.tipo === 'gasto' || m.tipo === 'fijo') {
      suma += m.monto
    }
  })
  return suma
})

const gastoPercentage = computed(() => {
  if (finanzasStore.balance === 0) return 0
  return (totalGastos.value / finanzasStore.balance) * 100 - 100
})

// Presupuesto total (suma de todos)
const presupuestoTotal = computed(() => {
  return Object.values(configStore.presupuestos).reduce((acc, val) => acc + val, 0)
})

// Presupuesto gastado (total de gastos vs presupuesto)
const presupuestoGastado = computed(() => totalGastos.value)

// % uso presupuesto mensual (gastos vs total presupuestos)
const porcentajeUsoPresupuesto = computed(() => {
  if (presupuestoTotal.value === 0) return 0
  return (presupuestoGastado.value / presupuestoTotal.value) * 100
})

// Color para el % presupuesto gastado
const porcentajePresupuestoColor = computed(() => {
  const pct = porcentajeUsoPresupuesto.value / 100
  if (pct <= 0.7) return '#42b983'  // verde
  if (pct <= 1) return '#f1c40f'    // amarillo
  return '#e74c3c'                  // rojo
})

// Presupuesto vs gasto por categoría
const gastoPorCategoria = computed(() => {
  const categorias = {}

  finanzasStore.movimientos.forEach(m => {
    if (m.tipo === 'gasto' || m.tipo === 'fijo') {
      if (!categorias[m.categoria]) {
        categorias[m.categoria] = { gasto: 0, presupuesto: 0 }
      }
      categorias[m.categoria].gasto += m.monto
    }
  })

  Object.entries(configStore.presupuestos).forEach(([categoria, presupuesto]) => {
    if (!categorias[categoria]) {
      categorias[categoria] = { gasto: 0, presupuesto: 0 }
    }
    categorias[categoria].presupuesto = presupuesto
  })

  return categorias
})

const porcentajeUso = (gasto, presupuesto) => {
  if (presupuesto === 0) return 0
  return (gasto / presupuesto) * 100
}

const barColor = (gasto, presupuesto) => {
  if (presupuesto === 0) return '#42b983'
  const pct = gasto / presupuesto
  if (pct <= 0.7) return '#42b983'
  if (pct <= 1) return '#f1c40f'
  return '#e74c3c'
}

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
const mesSeleccionado = ref(new Date().getMonth()) // mes actual por defecto

const flujoSaldoFinal = computed(() => {
  return finanzasStore.flujoCajaPorMes(mesSeleccionado.value).saldoFinal
})
</script>

<style scoped>
.dashboard {
  max-width: 900px;
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
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.card {
  padding: 15px;
  border-radius: 10px;
  color: white;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ingreso { background: #2ecc71; }
.gasto { background: #e74c3c; }
.presupuesto-total { background: #2980b9; }
.presupuesto-gastado { background: #f39c12; }
.ahorro { background: #3498db; }
.prestamo { background: #1abc9c; }
.deuda { background: #c0392b; }
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
  font-weight: 600;
  color: #222;
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

.mes-buttons {
  text-align: center;
  margin-bottom: 20px;
}

.mes-buttons button {
  margin: 0 6px;
  padding: 8px 14px;
  font-weight: 600;
  border: none;
  background: #ccc;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.mes-buttons button.active,
.mes-buttons button:hover {
  background: #42b983;
  color: white;
}

.flujo-info p {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}
</style>
