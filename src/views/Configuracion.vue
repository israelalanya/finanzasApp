<template>
  <div class="config">
    <h2>⚙️ Configuración</h2>

    <!-- Selector de mes -->
    <section>
      <h3>Mes y Año</h3>
      <input type="month" v-model="mesSeleccionado" />
    </section>

    <!-- Cuentas -->
    <section>
      <h3>Cuentas</h3>
      <form @submit.prevent="addItem('cuentas', nuevo.cuentas)">
        <input v-model="nuevo.cuentas" placeholder="Ej: Educación" required />
        <button type="submit">Agregar</button>
      </form>
      <ul>
        <li v-for="(item, i) in store.cuentas" :key="i" class="item-lista">
          {{ item }}
          <div class="acciones">
            <button @click="abrirMenu('cuentas', i)">⋮</button>
            <div v-if="menuVisible.key==='cuentas' && menuVisible.index===i" class="menu-flotante">
              <button @click="editarItem('cuentas', i)">Editar</button>
              <button @click="removeItem('cuentas', i)">Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Medios de Pago -->
    <section>
      <h3>Medios de Pago</h3>
      <form @submit.prevent="addItem('mediosPago', nuevo.mediosPago)">
        <input v-model="nuevo.mediosPago" placeholder="Ej: BCP, Yape" required />
        <button type="submit">Agregar</button>
      </form>
      <ul>
        <li v-for="(item, i) in store.mediosPago" :key="i" class="item-lista">
          {{ item }}
          <div class="acciones">
            <button @click="abrirMenu('mediosPago', i)">⋮</button>
            <div v-if="menuVisible.key==='mediosPago' && menuVisible.index===i" class="menu-flotante">
              <button @click="editarItem('mediosPago', i)">Editar</button>
              <button @click="removeItem('mediosPago', i)">Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Monedas -->
    <section>
      <h3>Monedas</h3>
      <form @submit.prevent="addMoneda({nombre: nuevo.monedas, tipoCambio: nuevo.tipoCambio})">
        <input v-model="nuevo.monedas" placeholder="Ej: Soles, Dólares" required />
        <input type="number" v-model.number="nuevo.tipoCambio" placeholder="Tipo de cambio (1 base)" required />
        <button type="submit">Agregar</button>
      </form>
      <ul>
        <li v-for="(item, i) in store.monedas" :key="item.nombre" class="item-lista">
          {{ item.nombre }} ({{ item.tipoCambio }})
          <div class="acciones">
            <button @click="abrirMenu('monedas', i)">⋮</button>
            <div v-if="menuVisible.key==='monedas' && menuVisible.index===i" class="menu-flotante">
              <button @click="editarMoneda(i)">Editar</button>
              <button @click="removeItem('monedas', i)">Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Categorías de Gastos -->
    <section>
      <h3>Categorías de Gastos</h3>
      <form @submit.prevent="addItem('categoriasGasto', nuevo.categoriasGasto)">
        <input v-model="nuevo.categoriasGasto" placeholder="Ej: Diversión, Transporte" required />
        <button type="submit">Agregar</button>
      </form>
      <ul>
        <li v-for="(item, i) in store.categoriasGasto" :key="i" class="item-lista">
          {{ item }}
          <div class="acciones">
            <button @click="abrirMenu('categoriasGasto', i)">⋮</button>
            <div v-if="menuVisible.key==='categoriasGasto' && menuVisible.index===i" class="menu-flotante">
              <button @click="editarItem('categoriasGasto', i)">Editar</button>
              <button @click="removeItem('categoriasGasto', i)">Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Gastos Fijos por Mes -->
    <section>
      <h3>Gastos Fijos ({{ mesSeleccionado }})</h3>
      <form @submit.prevent="addGastoFijoMes">
        <input v-model="nuevo.gastoFijoNombre" placeholder="Ej: Alquiler" required />
        <select v-model="nuevo.gastoFijoCategoria">
          <option disabled value="">Categoría</option>
          <option v-for="c in store.categoriasGasto" :key="c">{{ c }}</option>
        </select>
        <input type="number" v-model.number="nuevo.gastoFijoMonto" placeholder="Monto" required />
        <button type="submit">Agregar</button>
      </form>
      <ul>
        <li v-for="(g, i) in gastosFijosMes" :key="i" class="item-lista">
          {{ g.nombre }} - {{ g.categoria }} - S/ {{ g.monto.toFixed(2) }}
          <div class="acciones">
            <button @click="abrirMenu('gastosFijos', i)">⋮</button>
            <div v-if="menuVisible.key==='gastosFijos' && menuVisible.index===i" class="menu-flotante">
              <button @click="editarGastoFijo(i)">Editar</button>
              <button @click="eliminarGastoFijo(i)">Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Presupuesto Mensual por Categoría -->
    <section>
      <h3>Presupuesto Mensual por Categoría ({{ mesSeleccionado }})</h3>

      <form @submit.prevent="addPresupuestoCategoria">
        <select v-model="nuevo.presupuestoCategoria">
          <option disabled value="">Selecciona Categoría</option>
          <option v-for="cat in store.categoriasGasto" :key="cat">{{ cat }}</option>
        </select>
        <input type="number" v-model.number="nuevo.presupuestoMonto" placeholder="Monto" required />
        <button type="submit">Agregar / Actualizar</button>
      </form>

      <ul>
        <li v-for="(monto, cat) in presupuestoMes" :key="cat" class="item-lista">
          {{ cat }} - S/ {{ monto.toFixed(2) }}
          <div class="acciones">
            <button @click="abrirMenu('presupuesto', cat)">⋮</button>
            <div v-if="menuVisible.key==='presupuesto' && menuVisible.index===cat" class="menu-flotante">
              <button @click="editarPresupuesto(cat)">Editar</button>
              <button @click="eliminarPresupuesto(cat)">Eliminar</button>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useConfigStore } from '../stores/config'

const store = useConfigStore()
const mesSeleccionado = ref(new Date().toISOString().substr(0,7)) // YYYY-MM

const nuevo = reactive({
  cuentas:'', mediosPago:'', monedas:'', tipoCambio:1,
  categoriasGasto:'', categoriasIngreso:'',
  gastoFijoNombre:'', gastoFijoCategoria:'', gastoFijoMonto:0,
  presupuestoCategoria:'', presupuestoMonto:0
})

const menuVisible = reactive({ key:null, index:null })

// --------- Funciones generales ---------
const abrirMenu = (key,index)=>{
  menuVisible.key = menuVisible.key===key && menuVisible.index===index ? null : key
  menuVisible.index = menuVisible.key===key ? index : null
}

const addItem = (key,item)=>{
  if(!item.trim()) return
  store.addItem(key,item)
  nuevo[key]=''
}
const removeItem = (key,index)=> store.removeItem(key,index)
const editarItem = (key,index)=>{
  const nuevoValor = prompt('Editar valor:', store[key][index])
  if(nuevoValor!==null && nuevoValor.trim()!=='') store[key][index]=nuevoValor
}

// --------- Monedas ---------
const addMoneda = (moneda)=>{
  if(!moneda.nombre) return
  store.addMoneda(moneda)
  nuevo.monedas=''
  nuevo.tipoCambio=1
}
const editarMoneda = (i)=>{
  const n = prompt('Nombre:', store.monedas[i].nombre)
  const t = prompt('Tipo de cambio:', store.monedas[i].tipoCambio)
  if(n) store.monedas[i].nombre=n
  if(t) store.monedas[i].tipoCambio=Number(t)
}

// --------- Gastos Fijos por mes ---------
const gastosFijosMes = computed(()=> store.gastosFijos[mesSeleccionado.value] || [])

const addGastoFijoMes = ()=>{
  if(!nuevo.gastoFijoNombre || !nuevo.gastoFijoCategoria || nuevo.gastoFijoMonto<=0) return
  store.addGastoFijo(mesSeleccionado.value,{
    nombre:nuevo.gastoFijoNombre,
    categoria:nuevo.gastoFijoCategoria,
    monto:nuevo.gastoFijoMonto
  })
  nuevo.gastoFijoNombre=''
  nuevo.gastoFijoCategoria=''
  nuevo.gastoFijoMonto=0
}
const eliminarGastoFijo = (i)=> store.removeGastoFijo(mesSeleccionado.value,i)
const editarGastoFijo = (i)=>{
  const g = gastosFijosMes.value[i]
  const n = prompt('Nombre:', g.nombre)
  const c = prompt('Categoria:', g.categoria)
  const m = prompt('Monto:', g.monto)
  if(n) g.nombre=n
  if(c) g.categoria=c
  if(m) g.monto=Number(m)
  store.updateGastoFijo(mesSeleccionado.value,i,g)
}

// --------- Presupuesto Mensual ---------
const presupuestoMes = computed(()=> store.presupuestos[mesSeleccionado.value] || {})

const addPresupuestoCategoria = ()=>{
  if(!nuevo.presupuestoCategoria || nuevo.presupuestoMonto<=0) return
  store.guardarPresupuesto(mesSeleccionado.value,{
    ...presupuestoMes.value,
    [nuevo.presupuestoCategoria]: nuevo.presupuestoMonto
  })
  nuevo.presupuestoCategoria=''
  nuevo.presupuestoMonto=0
}
const eliminarPresupuesto = (cat)=>{
  const p = {...presupuestoMes.value}
  delete p[cat]
  store.guardarPresupuesto(mesSeleccionado.value,p)
}
const editarPresupuesto = (cat)=>{
  const n = prompt('Monto para '+cat, presupuestoMes.value[cat])
  if(n!==null) {
    store.guardarPresupuesto(mesSeleccionado.value,{
      ...presupuestoMes.value,
      [cat]:Number(n)
    })
  }
}
</script>

<style scoped>
.config{padding:20px; max-width:700px; margin:0 auto;}
section{background:#fff;padding:16px;margin-bottom:20px;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.1);}
h3{margin-top:0;}
form{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;}
input, select{flex:1;padding:8px;border-radius:6px;border:1px solid #ccc;}
button{padding:8px 12px;border:none;border-radius:6px;cursor:pointer;background:#4CAF50;color:white;}
button:hover{opacity:0.9;}
ul{list-style:none;padding:0;}
li{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #eee;}
.item-lista{position:relative;display:flex;justify-content:space-between;align-items:center;}
.acciones{position:relative;}
.acciones button{background:none;color:#555;font-size:18px;line-height:1;padding:0 4px;}
.menu-flotante{position:absolute;top:20px;right:0;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.2);border-radius:6px;display:flex;flex-direction:column;z-index:10;}
.menu-flotante button{padding:6px 12px;text-align:left;color:#333;background:none;border:none;cursor:pointer;}
.menu-flotante button:hover{background:#f0f0f0;}
</style>
