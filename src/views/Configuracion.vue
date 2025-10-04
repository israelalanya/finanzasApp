<template>
  <div class="config">
    <h2>⚙️ Configuración</h2>

    <!-- Cuentas -->
    <section>
      <h3>Cuentas</h3>
      <form @submit.prevent="addItem('cuentas')">
        <input v-model="nuevo.cuentas" placeholder="Ej: Caja Chica, BCP" required />
        <button type="submit" class="btn-primary">Agregar</button>
      </form>
      <ul>
        <li v-for="(item, i) in store.cuentas" :key="i">
          {{ item }}
          <div class="actions">
            <button class="btn-action" @click="toggleMenu('cuentas', i)">⋮</button>
            <div v-if="menu.open && menu.key==='cuentas' && menu.index===i" class="dropdown">
              <button @click="editItem('cuentas', i)">✏️ Editar</button>
              <button @click="deleteItem('cuentas', i)">🗑 Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Medios de Pago -->
    <section>
      <h3>Medios de Pago</h3>
      <form @submit.prevent="addItem('mediosPago')">
        <input v-model="nuevo.mediosPago" placeholder="Ej: Yape, Plin, Visa" required />
        <button type="submit" class="btn-primary">Agregar</button>
      </form>
      <ul>
        <li v-for="(item, i) in store.mediosPago" :key="i">
          {{ item }}
          <div class="actions">
            <button class="btn-action" @click="toggleMenu('mediosPago', i)">⋮</button>
            <div v-if="menu.open && menu.key==='mediosPago' && menu.index===i" class="dropdown">
              <button @click="editItem('mediosPago', i)">✏️ Editar</button>
              <button @click="deleteItem('mediosPago', i)">🗑 Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Monedas -->
    <section>
      <h3>Monedas</h3>
      <form @submit.prevent="addItem('monedas')">
        <input v-model="nuevo.monedas" placeholder="Ej: Soles, Dólares" required />
        <input type="number" v-model.number="nuevo.tipoCambio" placeholder="Tipo de cambio (ej: 1.0)" required />
        <button type="submit" class="btn-primary">Agregar</button>
      </form>
      <ul>
        <li v-for="(item, i) in store.monedas" :key="i">
          {{ item.nombre }} (TC: {{ item.tipoCambio }})
          <div class="actions">
            <button class="btn-action" @click="toggleMenu('monedas', i)">⋮</button>
            <div v-if="menu.open && menu.key==='monedas' && menu.index===i" class="dropdown">
              <button @click="editItem('monedas', i)">✏️ Editar</button>
              <button @click="deleteItem('monedas', i)">🗑 Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Categorías de Gastos -->
    <section>
      <h3>Categorías de Gastos</h3>
      <form @submit.prevent="addItem('categoriasGasto')">
        <input v-model="nuevo.categoriasGasto" placeholder="Ej: Transporte, Alimentación" required />
        <button type="submit" class="btn-primary">Agregar</button>
      </form>
      <ul>
        <li v-for="(item, i) in store.categoriasGasto" :key="i">
          {{ item }}
          <div class="actions">
            <button class="btn-action" @click="toggleMenu('categoriasGasto', i)">⋮</button>
            <div v-if="menu.open && menu.key==='categoriasGasto' && menu.index===i" class="dropdown">
              <button @click="editItem('categoriasGasto', i)">✏️ Editar</button>
              <button @click="deleteItem('categoriasGasto', i)">🗑 Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Categorías de Ingresos -->
    <section>
      <h3>Categorías de Ingresos</h3>
      <form @submit.prevent="addItem('categoriasIngreso')">
        <input v-model="nuevo.categoriasIngreso" placeholder="Ej: Sueldo, Ventas, Inversiones" required />
        <button type="submit" class="btn-primary">Agregar</button>
      </form>
      <ul>
        <li v-for="(item, i) in store.categoriasIngreso" :key="i">
          {{ item }}
          <div class="actions">
            <button class="btn-action" @click="toggleMenu('categoriasIngreso', i)">⋮</button>
            <div v-if="menu.open && menu.key==='categoriasIngreso' && menu.index===i" class="dropdown">
              <button @click="editItem('categoriasIngreso', i)">✏️ Editar</button>
              <button @click="deleteItem('categoriasIngreso', i)">🗑 Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Gastos Fijos -->
    <section>
      <h3>Gastos Fijos</h3>
      <form @submit.prevent="addGastoFijo">
        <select v-model="nuevo.gastoFijoCategoria" required>
          <option disabled value="">Selecciona categoría</option>
          <option v-for="c in store.categoriasGasto" :key="c">{{ c }}</option>
        </select>
        <input type="number" v-model.number="nuevo.gastoFijoMonto" placeholder="Monto mensual" required />
        <input type="month" v-model="nuevo.gastoFijoMes" required />
        <button type="submit" class="btn-primary">Guardar</button>
      </form>
      <ul>
        <li v-for="(item, i) in store.gastosFijos" :key="i">
          {{ item.categoria }} - S/ {{ formatMoney(item.monto) }} ({{ item.mes }})
          <div class="actions">
            <button class="btn-action" @click="toggleMenu('gastosFijos', i)">⋮</button>
            <div v-if="menu.open && menu.key==='gastosFijos' && menu.index===i" class="dropdown">
              <button @click="editItem('gastosFijos', i)">✏️ Editar</button>
              <button @click="deleteItem('gastosFijos', i)">🗑 Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Presupuestos -->
    <section>
      <h3>Presupuesto Mensual por Categoría</h3>
      <form @submit.prevent="addPresupuesto">
        <select v-model="nuevo.presupuestoCategoria" required>
          <option disabled value="">Selecciona categoría</option>
          <option v-for="c in store.categoriasGasto" :key="c">{{ c }}</option>
        </select>
        <input type="number" v-model.number="nuevo.presupuestoMonto" placeholder="Monto presupuesto" required />
        <input type="month" v-model="nuevo.presupuestoMes" required />
        <button type="submit" class="btn-primary">Guardar</button>
      </form>
      <ul>
        <li v-for="(item, i) in store.presupuestos" :key="i">
          {{ item.categoria }} - S/ {{ formatMoney(item.monto) }} ({{ item.mes }})
          <div class="actions">
            <button class="btn-action" @click="toggleMenu('presupuestos', i)">⋮</button>
            <div v-if="menu.open && menu.key==='presupuestos' && menu.index===i" class="dropdown">
              <button @click="editItem('presupuestos', i)">✏️ Editar</button>
              <button @click="deleteItem('presupuestos', i)">🗑 Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Botón Reset -->
    <section>
      <h3>⚠️ Resetear Datos</h3>
      <button class="btn-danger" @click="resetData">Eliminar todos los datos</button>
    </section>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useConfigStore } from '../stores/config'

const store = useConfigStore()

const nuevo = reactive({
  cuentas: '',
  mediosPago: '',
  monedas: '',
  tipoCambio: 1,
  categoriasGasto: '',
  categoriasIngreso: '',
  gastoFijoCategoria: '',
  gastoFijoMonto: null,
  gastoFijoMes: '',
  presupuestoCategoria: '',
  presupuestoMonto: null,
  presupuestoMes: ''
})

// menu acciones
const menu = reactive({ open: false, key: null, index: null })
const toggleMenu = (key, index) => {
  if (menu.open && menu.key === key && menu.index === index) {
    menu.open = false; menu.key = null; menu.index = null
  } else {
    menu.open = true; menu.key = key; menu.index = index
  }
}

const addItem = (key) => {
  if (key === 'monedas') {
    if (nuevo.monedas.trim() !== '') {
      store.addMoneda({ nombre: nuevo.monedas, tipoCambio: nuevo.tipoCambio })
      nuevo.monedas = ''; nuevo.tipoCambio = 1
    }
    return
  }
  if (!nuevo[key] || !String(nuevo[key]).trim()) return
  store.addItem(key, nuevo[key])
  nuevo[key] = ''
}

const addGastoFijo = () => {
  if (!nuevo.gastoFijoCategoria || !nuevo.gastoFijoMes) return
  const g = { categoria: nuevo.gastoFijoCategoria, monto: Number(nuevo.gastoFijoMonto || 0), mes: nuevo.gastoFijoMes }
  store.addGastoFijo(g)
  nuevo.gastoFijoCategoria = ''; nuevo.gastoFijoMonto = null; nuevo.gastoFijoMes = ''
}

const addPresupuesto = () => {
  if (!nuevo.presupuestoCategoria || !nuevo.presupuestoMes) return
  const p = { categoria: nuevo.presupuestoCategoria, monto: Number(nuevo.presupuestoMonto || 0), mes: nuevo.presupuestoMes }
  store.addPresupuesto(p)
  nuevo.presupuestoCategoria = ''; nuevo.presupuestoMonto = null; nuevo.presupuestoMes = ''
}

// edición / eliminación por tipo
const editItem = (key, index) => {
  menu.open = false
  if (['cuentas','mediosPago','categoriasGasto','categoriasIngreso'].includes(key)) {
    const cur = store[key][index]
    const val = prompt('Editar valor:', cur)
    if (val != null && String(val).trim() !== '') store.updateItem(key, index, String(val).trim())
    return
  }
  if (key === 'monedas') {
    const m = store.monedas[index]
    const nombre = prompt('Nombre moneda:', m ? m.nombre : '')
    const tc = prompt('Tipo de cambio:', m ? m.tipoCambio : 1)
    if (nombre != null && tc != null) store.updateMoneda(index, { nombre: String(nombre).trim(), tipoCambio: Number(tc) })
    return
  }
  if (key === 'gastosFijos') {
    const g = store.gastosFijos[index]
    const categoria = prompt('Categoría:', g ? g.categoria : '')
    const monto = prompt('Monto:', g ? g.monto : 0)
    const mes = prompt('Mes (YYYY-MM):', g ? g.mes : '')
    if (categoria != null && monto != null && mes != null) {
      store.updateGastoFijo(index, { categoria: String(categoria).trim(), monto: Number(monto), mes: String(mes) })
    }
    return
  }
  if (key === 'presupuestos') {
    const p = store.presupuestos[index]
    const categoria = prompt('Categoría:', p ? p.categoria : '')
    const monto = prompt('Monto:', p ? p.monto : 0)
    const mes = prompt('Mes (YYYY-MM):', p ? p.mes : '')
    if (categoria != null && monto != null && mes != null) {
      store.updatePresupuesto(index, { categoria: String(categoria).trim(), monto: Number(monto), mes: String(mes) })
    }
    return
  }
}

const deleteItem = (key, index) => {
  menu.open = false
  if (!confirm('¿Eliminar este registro?')) return

  if (['cuentas','mediosPago','categoriasGasto','categoriasIngreso'].includes(key)) {
    store.removeItem(key, index); return
  }
  if (key === 'monedas') { store.removeMoneda(index); return }
  if (key === 'gastosFijos') { store.removeGastoFijo(index); return }
  if (key === 'presupuestos') { store.removePresupuesto(index); return }
}

// Reset configuración (solo config)
const resetData = () => {
  if (!confirm('⚠️ Esto eliminará todos los datos de configuración. ¿Estás seguro?')) return
  store.resetData()
}

// util: formatear dinero
const formatMoney = (v) => {
  const n = Number(v || 0)
  return n.toFixed(2)
}
</script>

<style scoped>
.config { padding: 20px; max-width: 700px; margin: 0 auto; }
section { background: #fff; padding: 16px; margin-bottom: 20px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
h3 { margin-top: 0; }
form { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
input, select { flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #ccc; }
ul { list-style: none; padding: 0; }
li { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #eee; }
.actions { position: relative; }
.btn-primary { background: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover { background: #43a047; }
.btn-danger { background: #e53935; color: white; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.btn-danger:hover { background: #c62828; }
.btn-action { width: 32px; height: 32px; border-radius: 50%; background: #f5f5f5; border: none; font-size: 18px; cursor: pointer; }
.btn-action:hover { background: #e0e0e0; }
.dropdown { position: absolute; right: 0; top: 36px; background: white; border: 1px solid #ccc; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); display: flex; flex-direction: column; z-index: 10; }
.dropdown button { padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; }
.dropdown button:hover { background: #f0f0f0; }
</style>
