import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfigStore = defineStore('config', ()=>{
  // Listas básicas
  const cuentas = ref([])
  const mediosPago = ref([])
  const monedas = ref([])
  const categoriasGasto = ref([])
  const categoriasIngreso = ref([])

  // Por mes: YYYY-MM
  const gastosFijos = ref({})       // { "2025-10": [ {nombre, categoria, monto} ] }
  const presupuestos = ref({})      // { "2025-10": { "Transporte": 100, "Comida": 200 } }

  // Funciones generales
  const addItem = (key, item)=>{
    if(!item.trim()) return
    switch(key){
      case 'cuentas': cuentas.value.push(item); break;
      case 'mediosPago': mediosPago.value.push(item); break;
      case 'categoriasGasto': categoriasGasto.value.push(item); break;
      case 'categoriasIngreso': categoriasIngreso.value.push(item); break;
    }
  }

  const removeItem = (key,index)=>{
    switch(key){
      case 'cuentas': cuentas.value.splice(index,1); break;
      case 'mediosPago': mediosPago.value.splice(index,1); break;
      case 'categoriasGasto': categoriasGasto.value.splice(index,1); break;
      case 'categoriasIngreso': categoriasIngreso.value.splice(index,1); break;
      case 'monedas': monedas.value.splice(index,1); break;
    }
  }

  // Monedas
  const addMoneda = (moneda)=>{
    monedas.value.push(moneda)
  }

  // Gastos fijos por mes
  const addGastoFijo = (mes,gasto)=>{
    if(!gastosFijos.value[mes]) gastosFijos.value[mes]=[]
    gastosFijos.value[mes].push(gasto)
  }
  const removeGastoFijo = (mes,i)=>{
    if(gastosFijos.value[mes]) gastosFijos.value[mes].splice(i,1)
  }
  const updateGastoFijo = (mes,i,gasto)=>{
    if(gastosFijos.value[mes]) gastosFijos.value[mes][i]=gasto
  }

  // Presupuesto por mes
  const guardarPresupuesto = (mes,presupuesto)=>{
    presupuestos.value[mes] = presupuesto
  }

  return {
    cuentas,
    mediosPago,
    monedas,
    categoriasGasto,
    categoriasIngreso,
    gastosFijos,
    presupuestos,
    addItem,
    removeItem,
    addMoneda,
    addGastoFijo,
    removeGastoFijo,
    updateGastoFijo,
    guardarPresupuesto
  }
})
