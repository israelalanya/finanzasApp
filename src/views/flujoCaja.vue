<template>
  <div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useFinanzasStore } from '../stores/finanzas'

Chart.register(...registerables)

const store = useFinanzasStore()
const chart = ref(null)
let chartInstance = null

const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

const getChartData = () => {
  const datasets = {
    ingresos: [],
    gastos: [],
    fijos: [],
    deudas: [],
    prestamos: [],
    ahorros: [],
    saldoFinal: []
  }

  const anioActual = new Date().getFullYear()
  let saldoAcumulado = 0

  meses.forEach((_, i) => {
    const flujo = store.flujoCajaPorMes(i, anioActual)
    datasets.ingresos.push(flujo.ingresos)
    datasets.gastos.push(flujo.gastos)
    datasets.fijos.push(flujo.fijos)
    datasets.deudas.push(flujo.deudas)
    datasets.prestamos.push(flujo.prestamos)
    datasets.ahorros.push(flujo.ahorros)
    saldoAcumulado += flujo.ingresos - flujo.gastos - flujo.fijos - flujo.deudas + flujo.ahorros - flujo.prestamos
    datasets.saldoFinal.push(saldoAcumulado)
  })

  return {
    labels: meses,
    datasets: [
      { label: 'Ingresos', data: datasets.ingresos, backgroundColor: '#2ecc71', stack: 'Flujo' },
      { label: 'Gastos', data: datasets.gastos, backgroundColor: '#e74c3c', stack: 'Flujo' },
      { label: 'Gastos Fijos', data: datasets.fijos, backgroundColor: '#1976d2', stack: 'Flujo' },
      { label: 'Deudas', data: datasets.deudas, backgroundColor: '#c0392b', stack: 'Flujo' },
      { label: 'Préstamos', data: datasets.prestamos, backgroundColor: '#1abc9c', stack: 'Flujo' },
      { label: 'Ahorros', data: datasets.ahorros, backgroundColor: '#3498db', stack: 'Flujo' },
      { label: 'Saldo Acumulado', data: datasets.saldoFinal, type: 'line', borderColor: '#f39c12', borderWidth: 2, fill: false, tension: 0.3 }
    ]
  }
}

onMounted(() => {
  const ctx = chart.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: getChartData(),
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  })
})

// Actualizar si cambian movimientos
watch(() => store.movimientos, () => {
  if(chartInstance) {
    chartInstance.data = getChartData()
    chartInstance.update()
  }
}, { deep: true })
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: 400px;
}
</style>
