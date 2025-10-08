<template>
  <div class="deudas">
    <h1>Gestión de Deudas</h1>

    <!-- Formulario -->
    <form class="form" @submit.prevent="agregarDeuda">
      <div class="form-row">
        <input v-model="nueva.persona" placeholder="Persona o Entidad" required />
        <input v-model.number="nueva.monto" type="number" placeholder="Monto" required />
        <select v-model="nueva.moneda">
          <option v-for="m in monedas" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
      <div class="form-row">
        <input v-model="nueva.fecha" type="date" />
        <select v-model="nueva.estado">
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
        </select>
        <button type="submit">Agregar</button>
      </div>
    </form>

    <!-- Tabla -->
    <div class="tabla-container">
      <table>
        <thead>
          <tr>
            <th>Persona</th>
            <th>Monto</th>
            <th>Moneda</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(d, i) in deudas" :key="i">
            <td>{{ d.persona }}</td>
            <td>S/ {{ d.monto.toFixed(2) }}</td>
            <td>{{ d.moneda }}</td>
            <td>{{ d.fecha }}</td>
            <td>
              <span class="badge" :class="d.estado">{{ d.estado }}</span>
            </td>
            <td>
              <button class="btn-small" @click="marcarPagado(i)" v-if="d.estado !== 'pagado'">
                Marcar Pagado
              </button>
            </td>
          </tr>
          <tr v-if="!deudas.length">
            <td colspan="6" class="vacio">Sin deudas registradas</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue"

const monedas = ["S/", "$", "€"]

const state = reactive({
  deudas: JSON.parse(localStorage.getItem("deudas") || "[]"),
})

const nueva = reactive({
  persona: "",
  monto: 0,
  moneda: "S/",
  fecha: new Date().toISOString().slice(0, 10),
  estado: "pendiente",
})

const guardar = () => localStorage.setItem("deudas", JSON.stringify(state.deudas))

const agregarDeuda = () => {
  if (!nueva.persona || !nueva.monto) return
  state.deudas.push({ ...nueva })
  guardar()
  Object.assign(nueva, { persona: "", monto: 0, moneda: "S/", fecha: new Date().toISOString().slice(0, 10), estado: "pendiente" })
}

const marcarPagado = (i) => {
  state.deudas[i].estado = "pagado"
  guardar()
}

const deudas = state.deudas
</script>

<style scoped>
.deudas {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Poppins", sans-serif;
  background: #f9fafc;
  border-radius: 10px;
}
h1 { text-align: center; margin-bottom: 20px; }

.form { margin-bottom: 20px; }
.form-row { display: flex; gap: 10px; margin-bottom: 10px; }
input, select, button {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  flex: 1;
}
button {
  background: #42b983;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
button:hover { background: #2e8b69; }

.tabla-container { overflow-x: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
th { background: #f5f5f5; font-weight: 600; }
.vacio { text-align: center; color: #888; }

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
}
.badge.pendiente { background: #f39c12; color: #fff; }
.badge.pagado { background: #2ecc71; color: #fff; }

.btn-small {
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
  background: #3498db;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
}
.btn-small:hover { background: #217dbb; }
</style>
