<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(PieController, ArcElement, Tooltip, Legend)

const props = defineProps({
  data: { type: Array, required: true } // [{name, value}]
})

const canvas = ref(null)
let chartInstance = null

const renderChart = () => {
  if(chartInstance) chartInstance.destroy()
  chartInstance = new Chart(canvas.value, {
    type: 'pie',
    data: {
      labels: props.data.map(d => d.name),
      datasets: [{
        data: props.data.map(d => d.value),
        backgroundColor: [
          '#e74c3c','#2ecc71','#3498db','#f39c12','#9b59b6','#1abc9c','#34495e'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  })
}

onMounted(renderChart)
watch(() => props.data, renderChart, { deep: true })
</script>

<style scoped>
canvas { width: 100%; height: 300px; }
</style>
