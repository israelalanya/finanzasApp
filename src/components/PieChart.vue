<template>
  <div>
    <PieChart v-if="chartData" :data="chartData" :options="options" />
  </div>
</template>

<script setup>
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  data: { type: Object, required: true }
})

const options = {
  responsive: true,
  plugins: { legend: { position: 'bottom' } }
}

const chartData = props.data
const PieChart = Pie
</script>
