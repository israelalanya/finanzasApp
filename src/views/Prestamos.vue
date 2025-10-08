<template>
  <div class="finance-form">
    <h2>Registrar Préstamo</h2>

    <form @submit.prevent="guardarPrestamo">
      <!-- Cuenta -->
      <select v-model="prestamo.cuenta" required>
        <option disabled value="">Selecciona cuenta</option>
        <option v-for="c in configStore.cuentas" :key="c">{{ c }}</option>
      </select>

      <!-- Medio de Pago -->
      <select v-model="prestamo.medioPago">
        <option disabled value="">Selecciona medio de pago</option>
        <option v-for="m in configStore.mediosPago" :key="m">{{ m }}</option>
      </select>

      <!-- Moneda -->
      <select v-model="prestamo.moneda">
        <option disabled value="">Selecciona moneda</option>
        <option v-for="m in configStore.monedas" :key="m.nombre">{{ m.nombre }}</option>
      </select>

      <!-- Persona -->
      <input 
        list="personas" 
        v-model="prestamo.nombrePersona"
        placeholder="A quién prestaste"
        required
      />
      <datalist id="personas">
        <option v-for="p in configStore.personas" :key="p">{{ p }}</option>
      </datalist>

      <!-- Monto -->
      <input 
        type="number"
        v-model.number="prestamo.monto"
        min="0.01"
        step="0.01"
        placeholder="Monto del préstamo"
        required
      />

      <!-- Fecha -->
      <input type="datetime-local" v-model="prestamo.fecha" required />

      <!-- Estado -->
      <div class="checkbox">
        <label>
          <input type="checkbox" v-model="prestamo.pagado" />
          Marcar como cobrado
        </label>
      </div>

      <button type="submit" class="btn-primary">Guardar</button>
    </form>

    <!-- Lista -->
    <div class="lista-movimientos" v-if="prestamos.length">
      <h3>Préstamos Registrados</h3>
      <ul>
        <li v-for="(p, i) in prestamos" :key="p.id">
          <div class="info">
            <strong>{{ p.nombrePersona }}</strong>  
            <span class="badge badge-prestamo">Préstamo</span>
            <div class="monto">{{ p.moneda }} {{ p.monto.toFixed(2) }}</div>
            <div class="fecha">{{ formatFecha(p.fecha) }}</div>
          </div>

          <div class="estado-pago">
            <i v-if="p.pagado" class="fas fa-check-circle" style="color:#2ecc71"></i>
            <span v-else style="color:#e74c3c">Pendiente de cobrar</span>
          </div>

          <div class="actions">
            <button class="btn-action" @click="toggleMenu(i)">⋮</button>
            <div v-if="menu.open && menu.index===i" class="dropdown">
              <button @click="editar(i)">✏️ Editar</button>
              <button @click="eliminar(p.id)">🗑 Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useFinanzasStore } from '../stores/finanzas'
import { useConfigStore } from '../stores/config'

const store = useFinanzasStore()
const configStore = useConfigStore()

const prestamos = computed(() => store.movimientos.filter(m => m.tipo === 'prestamo'))

const prestamo = reactive({
  tipo: 'prestamo',
  cuenta: '',
  medioPago: '',
  moneda: '',
  nombrePersona: '',
  monto: null,
  fecha: new Date().toISOString().slice(0,16),
  pagado: false
})

const menu = reactive({ open: false, index: null })

const toggleMenu = (i) => {
  menu.open = menu.index !== i || !menu.open
  menu.index = i
}

const guardarPrestamo = () => {
  if (!prestamo.monto || prestamo.monto <= 0) {
    alert('Monto debe ser mayor a 0')
    return
  }

  if (prestamo.nombrePersona && !configStore.personas.includes(prestamo.nombrePersona)) {
    configStore.personas.push(prestamo.nombrePersona)
  }

  store.agregarMovimiento({ ...prestamo, id: Date.now() })

  Object.keys(prestamo).forEach(k => {
    if (k === 'tipo') prestamo[k] = 'prestamo'
    else if (k === 'fecha') prestamo[k] = new Date().toISOString().slice(0,16)
    else if (k === 'pagado') prestamo[k] = false
    else prestamo[k] = ''
  })
  prestamo.monto = null
}

const editar = (i) => {
  const p = prestamos.value[i]
  Object.keys(prestamo).forEach(k => prestamo[k] = p[k] ?? '')
  eliminar(p.id)
  menu.open = false
}

const eliminar = (id) => {
  if (confirm('¿Eliminar este préstamo?')) {
    store.eliminarMovimiento(id)
  }
  menu.open = false
}

const formatFecha = (f) => new Date(f).toLocaleString()
</script>

<style scoped>
.finance-form {
  max-width: 650px;
  margin: 20px auto;
  font-family: sans-serif;
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
.lista-movimientos li { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee; }

.badge {
  padding:2px 6px;
  border-radius:6px;
  font-size:12px;
  margin-left:5px;
  color:white;
}
.badge-prestamo { background:#1abc9c; }

.info { flex:1; }
.monto { font-weight:bold; }
.fecha { font-size:12px; color:#666; }

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
