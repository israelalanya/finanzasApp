import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const safeParse = (k, fallback) => {
  try {
    const raw = localStorage.getItem(k)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const useConfigStore = defineStore('config', () => {
  // listas básicas
  const cuentas = ref(safeParse('config.cuentas', []))
  const mediosPago = ref(safeParse('config.mediosPago', []))
  const monedas = ref(safeParse('config.monedas', []))
  const categoriasGasto = ref(safeParse('config.categoriasGasto', []))
  const categoriasIngreso = ref(safeParse('config.categoriasIngreso', []))

  // ahora canonical: arrays de objetos con campo `mes` (YYYY-MM)
  // gastosFijos: [ { categoria, monto, mes } ]
  // presupuestos: [ { categoria, monto, mes } ]
  const gastosFijos = ref(safeParse('config.gastosFijos', []))
  const presupuestos = ref(safeParse('config.presupuestos', []))

  const saveAll = () => {
    const payload = {
      cuentas: cuentas.value,
      mediosPago: mediosPago.value,
      monedas: monedas.value,
      categoriasGasto: categoriasGasto.value,
      categoriasIngreso: categoriasIngreso.value,
      gastosFijos: gastosFijos.value,
      presupuestos: presupuestos.value
    }
    localStorage.setItem('configStore', JSON.stringify(payload))
    // also keep some backward-compatible keys (optional)
    localStorage.setItem('config.cuentas', JSON.stringify(cuentas.value))
    localStorage.setItem('config.mediosPago', JSON.stringify(mediosPago.value))
    localStorage.setItem('config.monedas', JSON.stringify(monedas.value))
    localStorage.setItem('config.categoriasGasto', JSON.stringify(categoriasGasto.value))
    localStorage.setItem('config.categoriasIngreso', JSON.stringify(categoriasIngreso.value))
    localStorage.setItem('config.gastosFijos', JSON.stringify(gastosFijos.value))
    localStorage.setItem('config.presupuestos', JSON.stringify(presupuestos.value))
  }

  // guarda automáticamente
  watch(
    [cuentas, mediosPago, monedas, categoriasGasto, categoriasIngreso, gastosFijos, presupuestos],
    () => saveAll(),
    { deep: true }
  )

  // ---------- funciones para listas básicas ----------
  const addItem = (key, item) => {
    if (!item || !String(item).trim()) return
    switch (key) {
      case 'cuentas': cuentas.value.push(String(item).trim()); break
      case 'mediosPago': mediosPago.value.push(String(item).trim()); break
      case 'categoriasGasto': categoriasGasto.value.push(String(item).trim()); break
      case 'categoriasIngreso': categoriasIngreso.value.push(String(item).trim()); break
    }
  }

  const updateItem = (key, index, value) => {
    if (index == null) return
    switch (key) {
      case 'cuentas': cuentas.value[index] = value; break
      case 'mediosPago': mediosPago.value[index] = value; break
      case 'categoriasGasto': categoriasGasto.value[index] = value; break
      case 'categoriasIngreso': categoriasIngreso.value[index] = value; break
    }
  }

  const removeItem = (key, index) => {
    if (index == null) return
    switch (key) {
      case 'cuentas': cuentas.value.splice(index, 1); break
      case 'mediosPago': mediosPago.value.splice(index, 1); break
      case 'categoriasGasto': categoriasGasto.value.splice(index, 1); break
      case 'categoriasIngreso': categoriasIngreso.value.splice(index, 1); break
      case 'monedas': monedas.value.splice(index, 1); break
    }
  }

  // ---------- monedas ----------
  const addMoneda = (m) => {
    if (!m) return
    // espera objeto { nombre, tipoCambio }
    monedas.value.push({ nombre: String(m.nombre).trim(), tipoCambio: Number(m.tipoCambio || 1) })
  }
  const updateMoneda = (index, m) => {
    if (index == null) return
    monedas.value[index] = { nombre: String(m.nombre).trim(), tipoCambio: Number(m.tipoCambio || 1) }
  }
  const removeMoneda = (index) => {
    if (index == null) return
    monedas.value.splice(index, 1)
  }

  // ---------- gastos fijos (array con mes) ----------
  const addGastoFijo = (gasto) => {
    // gasto: { categoria, monto, mes }
    if (!gasto || !gasto.categoria || !gasto.mes) return
    gastosFijos.value.push({
      categoria: String(gasto.categoria).trim(),
      monto: Number(gasto.monto || 0),
      mes: String(gasto.mes)
    })
  }
  const updateGastoFijo = (index, gasto) => {
    if (index == null || !gasto) return
    gastosFijos.value[index] = {
      categoria: String(gasto.categoria).trim(),
      monto: Number(gasto.monto || 0),
      mes: String(gasto.mes)
    }
  }
  const removeGastoFijo = (index) => {
    if (index == null) return
    gastosFijos.value.splice(index, 1)
  }
  const getGastosFijosByMonth = (mes) => {
    if (!mes) return gastosFijos.value.slice()
    return gastosFijos.value.filter(g => g.mes === mes)
  }

  // ---------- presupuestos (array con mes) ----------
  const addPresupuesto = (p) => {
    // p: { categoria, monto, mes } -> reemplaza si ya existe misma categoria+mes
    if (!p || !p.categoria || !p.mes) return
    const idx = presupuestos.value.findIndex(x => x.categoria === p.categoria && x.mes === p.mes)
    const newEntry = { categoria: String(p.categoria).trim(), monto: Number(p.monto || 0), mes: String(p.mes) }
    if (idx >= 0) presupuestos.value[idx] = newEntry
    else presupuestos.value.push(newEntry)
  }
  const updatePresupuesto = (index, p) => {
    if (index == null || !p) return
    presupuestos.value[index] = { categoria: String(p.categoria).trim(), monto: Number(p.monto || 0), mes: String(p.mes) }
  }
  const removePresupuesto = (index) => {
    if (index == null) return
    presupuestos.value.splice(index, 1)
  }
  const getPresupuestosByMonth = (mes) => {
    if (!mes) return presupuestos.value.slice()
    return presupuestos.value.filter(p => p.mes === mes)
  }

  // ---------- reset ----------
  const resetData = () => {
    cuentas.value = []
    mediosPago.value = []
    monedas.value = []
    categoriasGasto.value = []
    categoriasIngreso.value = []
    gastosFijos.value = []      // array
    presupuestos.value = []     // array
    // write immediately
    saveAll()
  }

  return {
    // state
    cuentas, mediosPago, monedas, categoriasGasto, categoriasIngreso,
    gastosFijos, presupuestos,

    // lists
    addItem, updateItem, removeItem,

    // monedas
    addMoneda, updateMoneda, removeMoneda,

    // gastos fijos
    addGastoFijo, updateGastoFijo, removeGastoFijo, getGastosFijosByMonth,

    // presupuestos
    addPresupuesto, updatePresupuesto, removePresupuesto, getPresupuestosByMonth,

    // reset
    resetData
  }
})
