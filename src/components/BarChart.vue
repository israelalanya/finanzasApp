<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({
  data: { type: Object, required: true } // {labels: [], datasets: [{label, data, backgroundColor}]}
})

const canvas = ref(null)
let chartInstance = null

const renderChart = () => {
  if(chartInstance) chartInstance.destroy()
  chartInstance = new Chart(canvas.value, {
    type: 'bar',
    data: props.data,
    options: {
      responsive: true,
      plugins: { legend: { display: true, position: 'bottom' } }
    }
  })
}

onMounted(renderChart)
watch(() => props.data, renderChart, { deep: true })
</script>

<style scoped>
canvas { width: 100%; height: 300px; }
</style>
