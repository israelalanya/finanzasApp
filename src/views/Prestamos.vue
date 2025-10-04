<template>
  <div class="prestamos">
    <h2>🤝 Préstamos y Deudas</h2>

    <!-- Formulario -->
    <form @submit.prevent="addPrestamo">
      <select v-model="nuevo.tipo" required>
        <option disabled value="">Selecciona tipo</option>
        <option value="prestado">Préstamo (yo presto)</option>
        <option value="deuda">Deuda (yo debo)</option>
      </select>
      <input v-model="nuevo.persona" placeholder="Nombre de la persona" required />
      <input type="number" v-model.number="nuevo.monto" placeholder="Monto" required />
      <input v-model="nuevo.descripcion" placeholder="Descripción" />
      <input type="date" v-model="nuevo.fecha" required />
      <button type="submit" class="btn-primary">Guardar</button>
    </form>

    <!-- Lista -->
    <div v-for="(items, mes) in prestamos" :key="mes" class="mes-block">
      <h3>{{ mes }}</h3>
      <ul>
        <li v-for="(item, i) in items" :key="i">
          <div>
            <strong v-if="item.tipo==='prestado'" class="prestado">Presté a</strong>
            <strong v-else class="deuda">Debo a</strong>
            {{ item.persona }} - S/ {{ item.monto }}
            <small>({{ item.descripcion || 'Sin descripción' }})</small>
            <span :class="['estado', item.estado]">{{ item.estado }}</span>
          </div>

          <div class="actions">
            <button class="btn-action" @click="toggleMenu(mes, i)">⋮</button>
            <div v-if="menu.open && menu.mes===mes && menu.index===i" class="dropdown">
              <button @click="editPrestamo(mes, i)">✏️ Editar</button>
              <button @click="toggleEstado(mes, i)">
                ✅ {{ item.estado==='pendiente' ? 'Marcar pagado' : 'Marcar pendiente' }}
              </button>
              <button @click="deletePrestamo(mes, i)">🗑 Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Botón Reset -->
    <section>
      <h3>⚠️ Resetear Préstamos</h3>
      <button class="btn-danger" @click="resetData">Eliminar todos los préstamos</button>
    </section>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { usePrestamosStore } from '../stores/prestamos'

const store = usePrestamosStore()
const prestamos = store.prestamos

const nuevo = reactive({
  tipo: '',
  persona: '',
  monto: null,
  descripcion: '',
  fecha: new Date().toISOString().slice(0,10)
})

const menu = reactive({
  open: false,
  mes: null,
  index: null
})

const toggleMenu = (mes, index) => {
  if (menu.open && menu.mes === mes && menu.index === index) {
    menu.open = false
    menu.mes = null
    menu.index = null
  } else {
    menu.open = true
    menu.mes = mes
    menu.index = index
  }
}

const addPrestamo = () => {
  if (nuevo.tipo && nuevo.persona && nuevo.monto && nuevo.fecha) {
    const mes = nuevo.fecha.slice(0,7) // yyyy-mm
    store.addPrestamo(mes, {
      ...nuevo,
      estado: 'pendiente'
    })
    nuevo.tipo = ''
    nuevo.persona = ''
    nuevo.monto = null
    nuevo.descripcion = ''
    nuevo.fecha = new Date().toISOString().slice(0,10)
  }
}

const editPrestamo = (mes, i) => {
  const current = prestamos[mes][i]
  let persona = prompt('Editar persona:', current.persona)
  if (persona === null) return
  let monto = parseFloat(prompt('Editar monto:', current.monto))
  if (isNaN(monto)) return
  let descripcion = prompt('Editar descripción:', current.descripcion)
  store.updatePrestamo(mes, i, {
    ...current,
    persona,
    monto,
    descripcion
  })
  menu.open = false
}

const toggleEstado = (mes, i) => {
  const current = prestamos[mes][i]
  current.estado = current.estado === 'pendiente' ? 'pagado' : 'pendiente'
  store.updatePrestamo(mes, i, { ...current })
  menu.open = false
}

const deletePrestamo = (mes, i) => {
  if (confirm('¿Eliminar este préstamo/deuda?')) {
    store.removePrestamo(mes, i)
  }
  menu.open = false
}

const resetData = () => {
  if (confirm('⚠️ Esto eliminará todos los préstamos. ¿Seguro?')) {
    store.resetPrestamos()
  }
}
</script>

<style scoped>
.prestamos {
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
}
form { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
input, select {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
ul { list-style: none; padding: 0; }
li { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #eee; }
.actions { position: relative; }
.btn-primary {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-primary:hover { background: #43a047; }
.btn-danger {
  background: #e53935;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}
.btn-danger:hover { background: #c62828; }
.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
.dropdown {
  position: absolute;
  right: 0;
  top: 36px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  z-index: 10;
}
.dropdown button {
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
}
.dropdown button:hover { background: #f0f0f0; }
.estado {
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 12px;
  margin-left: 8px;
}
.estado.pendiente { background: #fff3cd; color: #856404; }
.estado.pagado { background: #d4edda; color: #155724; }
.prestado { color: #2e7d32; }
.deuda { color: #c62828; }
</style>
