<template>
  <div class="metas">
    <h1>Gestión de Metas Financieras</h1>

    <!-- Formulario -->
    <form class="form" @submit.prevent="agregarMeta">
      <div class="form-row">
        <input v-model="nueva.nombre" placeholder="Nombre de la meta" required />
        <input v-model.number="nueva.objetivo" type="number" placeholder="Objetivo (S/)" required />
        <input v-model.number="nueva.ahorrado" type="number" placeholder="Ahorrado" />
      </div>
      <button type="submit">Agregar Meta</button>
    </form>

    <!-- Lista de metas -->
    <div class="meta-list">
      <div v-for="(m, i) in metas" :key="i" class="meta-card">
        <div class="meta-header">
          <strong>{{ m.nombre }}</strong>
          <span>S/ {{ m.ahorrado }} / {{ m.objetivo }}</span>
        </div>
        <div class="meta-bar">
          <div
            class="meta-fill"
            :style="{ width: progreso(m) + '%', background: progresoColor(m) }"
          ></div>
        </div>
        <div class="meta-actions">
          <button @click="ahorrar(i)">+ S/50</button>
          <button class="danger" @click="eliminar(i)">Eliminar</button>
        </div>
      </div>

      <p v-if="!metas.length" class="vacio">No hay metas registradas</p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue"

const store = reactive({
  metas: JSON.parse(localStorage.getItem("metas") || "[]"),
})

const nueva = reactive({
  nombre: "",
  objetivo: 0,
  ahorrado: 0,
})

const guardar = () => localStorage.setItem("metas", JSON.stringify(store.metas))

const agregarMeta = () => {
  if (!nueva.nombre || !nueva.objetivo) return
  store.metas.push({ ...nueva })
  guardar()
  Object.assign(nueva, { nombre: "", objetivo: 0, ahorrado: 0 })
}

const eliminar = (i) => {
  store.metas.splice(i, 1)
  guardar()
}

const ahorrar = (i) => {
  store.metas[i].ahorrado += 50
  guardar()
}

const metas = store.metas

const progreso = (m) => Math.min(100, ((m.ahorrado || 0) / (m.objetivo || 1)) * 100)
const progresoColor = (m) => {
  const p = progreso(m)
  if (p < 70) return "#42b983"
  if (p < 100) return "#f1c40f"
  return "#2ecc71"
}
</script>

<style scoped>
.metas {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #f9fafc;
  font-family: "Poppins", sans-serif;
}
h1 { text-align: center; margin-bottom: 20px; }

.form-row { display: flex; gap: 10px; margin-bottom: 10px; }
input { flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #ccc; }
button {
  background: #42b983;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
button:hover { background: #2e8b69; }

.meta-list { display: grid; gap: 15px; }
.meta-card {
  background: #fff;
  padding: 14px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.meta-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 8px;
}
.meta-bar { background: #eee; height: 10px; border-radius: 6px; overflow: hidden; margin-bottom: 8px; }
.meta-fill { height: 100%; transition: width 0.3s; }
.meta-actions { display: flex; gap: 10px; }
.meta-actions .danger { background: #e74c3c; }
.vacio { text-align: center; color: #888; }
</style>
