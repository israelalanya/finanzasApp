<template>
  <div>
    <LineChart v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps({
  data: { type: Object, required: true }
})

const options = {
  responsive: true,
  plugins: { legend: { position: 'bottom' } }
}

const chartData = props.data
const LineChart = Line
</script>
