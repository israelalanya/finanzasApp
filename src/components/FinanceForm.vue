<template>
  <div class="finance-form">
    <h2>Registrar Movimiento</h2>

    <form @submit.prevent="guardarMovimiento">
      <!-- Tipo -->
      <select v-model="mov.tipo" required @change="resetCategoria">
        <option disabled value="">Selecciona tipo de movimiento</option>
        <option value="ingreso">Ingreso</option>
        <option value="gasto">Gasto</option>
        <option value="ahorro">Ahorro</option>
        <option value="prestamo">Préstamo</option>
        <option value="deuda">Deuda</option>
        <option value="fijo">Gasto Fijo</option>
      </select>

      <!-- Cuenta -->
      <select v-model="mov.cuenta" required>
        <option disabled value="">Selecciona cuenta</option>
        <option v-for="c in configStore.cuentas" :key="c">{{ c }}</option>
      </select>

      <!-- Medio de Pago -->
      <select v-model="mov.medioPago">
        <option disabled value="">Selecciona medio de pago</option>
        <option v-for="m in configStore.mediosPago" :key="m">{{ m }}</option>
      </select>

      <!-- Moneda -->
      <select v-model="mov.moneda">
        <option disabled value="">Selecciona moneda</option>
        <option v-for="m in configStore.monedas" :key="m.nombre">{{ m.nombre }}</option>
      </select>

      <!-- Categoría -->
      <select v-model="mov.categoria" @change="autoSetMontoFijo">
        <option disabled value="">Selecciona categoría</option>
        <option v-if="mov.tipo==='gasto'" v-for="c in configStore.categoriasGasto" :key="c">{{ c }}</option>
        <option v-if="mov.tipo==='ingreso'" v-for="c in configStore.categoriasIngreso" :key="c">{{ c }}</option>
        <option v-if="mov.tipo==='fijo'" v-for="c in configStore.gastosFijos" :key="c.categoria">{{ c.categoria }}</option>
      </select>

      <!-- Monto -->
  <input 
  type="number" 
  v-model.number="mov.monto" 
  inputmode="decimal"
  placeholder="Monto del movimiento" 
  required 
  min="0.01"
  step="0.01"
  :disabled="mov.tipo === 'fijo'"
/>

      <!-- Nombre de deudor/prestamo -->
      <input 
        v-if="mov.tipo==='deuda' || mov.tipo==='prestamo'" 
        v-model="mov.nombrePersona" 
        placeholder="Nombre de quien debe o a quien prestas" 
      />

      <!-- Presupuesto mensual -->
      <input 
        type="number" 
        v-model.number="mov.presupuesto" 
        placeholder="Presupuesto mensual (opcional)" 
      />

      <!-- Fecha -->
      <input 
        type="date" 
        v-model="mov.fecha" 
        required 
      />

      <button type="submit" class="btn-primary">Guardar</button>
    </form>

    <!-- Lista de Movimientos -->
    <div class="lista-movimientos" v-if="store.movimientos.length">
      <h3>Movimientos Registrados</h3>
      <ul>
        <li v-for="(m, i) in store.movimientos" :key="m.id">
          <span>
            <strong>{{ m.cuenta }}</strong> - {{ m.categoria }} - 
            S/ {{ m.monto.toFixed(2) }}
            <span v-if="m.nombrePersona"> ({{ m.nombrePersona }})</span>
            <span class="badge" :class="'badge-' + m.tipo">{{ m.tipo }}</span>
          </span>
          <div class="actions">
            <button class="btn-action" @click="toggleMenu(i)">⋮</button>
            <div v-if="menu.open && menu.index===i" class="dropdown">
              <button @click="editar(i)">✏️ Editar</button>
              <button @click="eliminar(m.id)">🗑 Eliminar</button>
            </div>
          </div>
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
  monto: null,
  presupuesto: null,
  fecha: new Date().toISOString().substr(0,10),
  nombrePersona: ''
})

const menu = reactive({
  open: false,
  index: null
})

const toggleMenu = (i) => {
  menu.open = menu.index !== i || !menu.open
  menu.index = i
}

const resetCategoria = () => {
  mov.categoria = ''
  if (mov.tipo !== 'fijo') mov.monto = null
}

const autoSetMontoFijo = () => {
  if (mov.tipo === 'fijo' && mov.categoria) {
    const fijo = configStore.gastosFijos.find(g => g.categoria === mov.categoria)
    mov.monto = fijo ? fijo.monto : null
  }
}

const guardarMovimiento = () => {
  if (!mov.monto || mov.monto <= 0) {
    alert('Monto debe ser mayor a 0')
    return
  }
  store.agregarMovimiento({ ...mov, id: Date.now() })

  // Reset formulario
  Object.keys(mov).forEach(k => {
    if (k === 'monto' || k === 'presupuesto') mov[k] = null
    else if (k === 'fecha') mov[k] = new Date().toISOString().substr(0,10)
    else mov[k] = ''
  })
}

const editar = (i) => {
  const m = store.movimientos[i]
  Object.keys(mov).forEach(k => mov[k] = m[k] ?? '')
  eliminar(m.id) // eliminamos para reemplazar
  menu.open = false
}

const eliminar = (id) => {
  if (confirm('¿Eliminar este movimiento?')) {
    store.eliminarMovimiento(id)
  }
  menu.open = false
}
</script>

<style scoped>
.finance-form {
  max-width: 600px;
  margin: 20px auto;
  font-family:sans-serif;
}
form { display:flex; flex-direction:column; gap:10px; margin-bottom:20px; }
select, input { padding:8px; border-radius:6px; border:1px solid #ccc; }
.btn-primary {
  padding:10px;
  border:none;
  border-radius:6px;
  background:#42b983;
  color:white;
  cursor:pointer;
}
.btn-primary:hover { opacity:0.9; }

.lista-movimientos { background:#fff; padding:12px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.1); }
.lista-movimientos ul { list-style:none; padding:0; margin:0; }
.lista-movimientos li { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #eee; }

.badge {
  padding:2px 6px;
  border-radius:6px;
  font-size:12px;
  margin-left:5px;
  color:white;
}
.badge-ingreso { background:#2ecc71; }
.badge-gasto { background:#e74c3c; }
.badge-ahorro { background:#3498db; }
.badge-fijo { background:#1976d2; }
.badge-prestamo { background:#1abc9c; }
.badge-deuda { background:#c0392b; }

.actions { position:relative; }
.btn-action {
  width:28px;
  height:28px;
  border-radius:50%;
  background:#f5f5f5;
  border:none;
  font-size:18px;
  cursor:pointer;
}
.btn-action:hover { background:#e0e0e0; }
.dropdown {
  position:absolute;
  right:0;
  top:30px;
  background:white;
  border:1px solid #ccc;
  border-radius:6px;
  box-shadow:0 2px 6px rgba(0,0,0,0.15);
  display:flex;
  flex-direction:column;
  z-index:10;
}
.dropdown button {
  padding:8px 12px;
  border:none;
  background:none;
  text-align:left;
  cursor:pointer;
}
.dropdown button:hover { background:#f0f0f0; }
</style>
