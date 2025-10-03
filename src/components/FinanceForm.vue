<template>
  <div class="finance-form">
    <h2>Registrar Movimiento</h2>

    <form @submit.prevent="guardarMovimiento">
      <!-- Tipo -->
      <select v-model="mov.tipo" required>
        <option disabled value="">Selecciona tipo</option>
        <option value="ingreso">Ingreso</option>
        <option value="gasto">Gasto</option>
        <option value="ahorro">Ahorro</option>
        <option value="prestamo">Préstamo</option>
        <option value="deuda">Deuda</option>
        <option value="fijo">Gasto Fijo</option>
      </select>

      <!-- Cuenta -->
      <select v-model="mov.cuenta" required>
        <option disabled value="">Cuenta</option>
        <option v-for="c in configStore.cuentas" :key="c">{{ c }}</option>
      </select>

      <!-- Medio de Pago -->
      <select v-model="mov.medioPago">
        <option disabled value="">Medio de Pago</option>
        <option v-for="m in configStore.mediosPago" :key="m">{{ m }}</option>
      </select>

      <!-- Moneda -->
      <select v-model="mov.moneda">
        <option disabled value="">Moneda</option>
        <option v-for="m in configStore.monedas" :key="m">{{ m.tipo }}</option>
      </select>

      <!-- Categoría -->
      <select v-model="mov.categoria">
        <option disabled value="">Categoría</option>
        <option v-if="mov.tipo==='gasto'" v-for="c in configStore.categoriasGasto" :key="c">{{ c }}</option>
        <option v-if="mov.tipo==='ingreso'" v-for="c in configStore.categoriasIngreso" :key="c">{{ c }}</option>
        <option v-if="mov.tipo==='fijo'" v-for="c in configStore.gastosFijos" :key="c">{{ c }}</option>
      </select>

      <!-- Monto -->
      <input type="number" v-model.number="mov.monto" placeholder="Monto" required />

      <!-- Presupuesto (opcional) -->
      <input type="number" v-model.number="mov.presupuesto" placeholder="Presupuesto mensual (opcional)" />

      <!-- Fecha -->
      <input type="date" v-model="mov.fecha" required />

      <button type="submit">Guardar</button>
    </form>

    <!-- Lista de Movimientos -->
    <div class="lista-movimientos" v-if="store.movimientos.length">
      <h3>Movimientos Registrados</h3>
      <ul>
        <li v-for="m in store.movimientos" :key="m.id">
          {{ m.tipo }} - {{ m.cuenta }} - {{ m.categoria }} - S/ {{ m.monto.toFixed(2) }}
          <button @click="eliminar(m.id)">❌</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useFinanzasStore } from '../stores/finanzas'
import { useConfigStore } from '../stores/config'

const store = useFinanzasStore()
const configStore = useConfigStore()

const mov = reactive({
  tipo: '',
  cuenta: '',
  medioPago: '',
  moneda: '',
  categoria: '',
  monto: 0,
  presupuesto: 0,
  fecha: new Date().toISOString().substr(0,10)
})

const guardarMovimiento = () => {
  if(mov.monto <=0){
    alert('Monto debe ser mayor a 0')
    return
  }
  store.agregarMovimiento({...mov})
  // Reset formulario
  Object.keys(mov).forEach(k=>{
    if(k==='monto' || k==='presupuesto') mov[k]=0
    else if(k==='fecha') mov[k]=new Date().toISOString().substr(0,10)
    else mov[k]=''
  })
}

const eliminar = (id) => {
  store.eliminarMovimiento(id)
}
</script>

<style scoped>
.finance-form { max-width: 600px; margin: 20px auto; font-family:sans-serif; }
form { display:flex; flex-direction:column; gap:10px; margin-bottom:20px; }
select, input { padding:8px; border-radius:6px; border:1px solid #ccc; }
button { padding:10px; border:none; border-radius:6px; background:#42b983; color:white; cursor:pointer; }
button:hover { opacity:0.9; }
.lista-movimientos { background:#fff; padding:12px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.1); }
.lista-movimientos ul { list-style:none; padding:0; margin:0; }
.lista-movimientos li { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #eee; }
.lista-movimientos li button { background:none; color:red; border:none; cursor:pointer; }
</style>
