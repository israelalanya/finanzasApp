<template>
  <div class="finance-form">
    <h2>Registrar Movimiento</h2>

    <form @submit.prevent="guardarMovimiento">
      <!-- Tipo -->
      <select v-model="mov.tipo" required @change="resetCategoria">
        <option disabled value="">Selecciona tipo de movimiento</option>
        <option value="ingreso">Ingreso</option>
        <option value="gasto">Gasto</option>
        <option value="meta">Meta</option>
        <option value="prestamo">Préstamo</option>
        <option value="deuda">Deuda</option>
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
      <select v-if="mov.tipo==='ingreso' || mov.tipo==='gasto'" v-model="mov.categoria">
        <option disabled value="">Selecciona categoría</option>
        <option v-if="mov.tipo==='gasto'" v-for="c in configStore.categoriasGasto" :key="c">{{ c }}</option>
        <option v-if="mov.tipo==='ingreso'" v-for="c in configStore.categoriasIngreso" :key="c">{{ c }}</option>
      </select>

      <!-- Meta -->
      <div v-if="mov.tipo==='meta'">
        <select v-model="mov.nombreMeta" required>
          <option disabled value="">Selecciona meta</option>
          <option v-for="meta in configStore.metas" :key="meta">{{ meta }}</option>
        </select>
      </div>

      <!-- Persona (para deuda o préstamo) -->
      <div v-if="mov.tipo==='deuda' || mov.tipo==='prestamo'">
        <input 
          list="personas" 
          v-model="mov.nombrePersona"
          :placeholder="mov.tipo==='deuda' ? 'A quién se debe' : 'A quién se prestó'" 
        />
        <datalist id="personas">
          <option v-for="p in configStore.personas" :key="p">{{ p }}</option>
        </datalist>

        <!-- Estado Pagado/Cobrado -->
        <div class="checkbox">
          <label>
            <input type="checkbox" v-model="mov.pagado" />
            {{ mov.tipo==='deuda' ? 'Marcar como pagado' : 'Marcar como cobrado' }}
          </label>
        </div>
      </div>

      <!-- Monto -->
      <input 
        type="number" 
        v-model.number="mov.monto" 
        inputmode="decimal"
        placeholder="Monto del movimiento" 
        required 
        min="0.01"
        step="0.01"
      />

      <!-- Fecha -->
      <input 
        type="datetime-local" 
        v-model="mov.fecha" 
        required 
      />

      <button type="submit" class="btn-primary">
        <i class="fas fa-save"></i> Guardar
      </button>
    </form>

    <!-- Lista de Movimientos -->
    <div class="lista-movimientos" v-if="store.movimientos.length">
      <h3>Movimientos Registrados</h3>
      <ul>
        <li v-for="(m, i) in store.movimientos" :key="m.id">
          <div class="info">
            <div class="titulo">
              <i :class="iconoMovimiento(m.tipo)" class="icono"></i>
              <strong>{{ m.cuenta }}</strong> 
              <span v-if="m.tipo==='meta'">➡ {{ m.nombreMeta }}</span>
              <span v-else-if="m.categoria">➡ {{ m.categoria }}</span>
              <span v-if="m.nombrePersona"> ({{ m.nombrePersona }})</span>
            </div>

            <div class="detalle">
              <span class="badge" :class="'badge-' + m.tipo">{{ m.tipo }}</span>
              <span class="monto">S/ {{ m.monto.toFixed(2) }}</span>
              <span class="fecha">{{ formatFecha(m.fecha) }}</span>
            </div>
          </div>

          <!-- Estado deuda/prestamo -->
          <div v-if="m.tipo==='deuda' || m.tipo==='prestamo'" class="estado-pago">
            <i v-if="m.pagado" class="fas fa-check-circle" style="color:#2ecc71"></i>
            <span v-else style="color:#e74c3c">
              {{ m.tipo==='deuda' ? 'Pendiente de pagar' : 'Pendiente de cobrar' }}
            </span>
          </div>

          <!-- Acciones -->
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
  nombreMeta: '',
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

const resetCategoria = () => {
  mov.categoria = ''
  mov.nombreMeta = ''
  mov.nombrePersona = ''
}

const guardarMovimiento = () => {
  if (!mov.monto || mov.monto <= 0) {
    alert('Monto debe ser mayor a 0')
    return
  }

  // Guardar personas y metas para reutilizar
  if ((mov.tipo === 'deuda' || mov.tipo === 'prestamo') && mov.nombrePersona) {
    if (!configStore.personas.includes(mov.nombrePersona)) {
      configStore.personas.push(mov.nombrePersona)
    }
  }

  if (mov.tipo === 'meta' && mov.nombreMeta && !configStore.metas.includes(mov.nombreMeta)) {
    configStore.metas.push(mov.nombreMeta)
  }

  store.agregarMovimiento({ ...mov, id: Date.now() })

  // Reset
  Object.keys(mov).forEach(k => {
    if (k === 'fecha') mov[k] = new Date().toISOString().slice(0,16)
    else if (k === 'pagado') mov[k] = false
    else mov[k] = ''
  })
  mov.monto = null
}

const editar = (i) => {
  const m = store.movimientos[i]
  Object.keys(mov).forEach(k => mov[k] = m[k] ?? '')
  eliminar(m.id)
  menu.open = false
}

const eliminar = (id) => {
  if (confirm('¿Eliminar este movimiento?')) {
    store.eliminarMovimiento(id)
  }
  menu.open = false
}

const formatFecha = (f) => {
  try {
    return new Date(f).toLocaleString()
  } catch {
    return f
  }
}

const iconoMovimiento = (tipo) => {
  switch (tipo) {
    case 'ingreso': return 'fas fa-arrow-up text-success'
    case 'gasto': return 'fas fa-arrow-down text-danger'
    case 'meta': return 'fas fa-bullseye text-primary'
    case 'prestamo': return 'fas fa-hand-holding-usd text-info'
    case 'deuda': return 'fas fa-file-invoice-dollar text-warning'
    default: return 'fas fa-wallet'
  }
}
</script>

<style scoped>
.finance-form {
  max-width: 650px;
  margin: 20px auto;
  font-family: "Segoe UI", sans-serif;
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
  font-weight:bold;
}
.btn-primary:hover { opacity:0.9; }

.lista-movimientos { background:#fff; padding:12px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.1); }
.lista-movimientos ul { list-style:none; padding:0; margin:0; }
.lista-movimientos li { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee; }

.badge {
  padding:3px 6px;
  border-radius:6px;
  font-size:12px;
  margin-left:5px;
  color:white;
  text-transform:capitalize;
}
.badge-ingreso { background:#2ecc71; }
.badge-gasto { background:#e74c3c; }
.badge-meta { background:#3498db; }
.badge-prestamo { background:#1abc9c; }
.badge-deuda { background:#c0392b; }

.icono { margin-right:6px; }

.info { flex:1; }
.titulo { font-weight:bold; display:flex; align-items:center; gap:5px; }
.detalle { font-size:13px; color:#666; display:flex; align-items:center; gap:10px; }
.monto { font-weight:bold; color:#333; }
.fecha { font-size:12px; color:#777; }

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
