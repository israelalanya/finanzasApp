import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useFinanzasStore = defineStore('finanzas', () => {
  // Estado principal
  const movimientos = ref(JSON.parse(localStorage.getItem('movimientos') || '[]'))

  // Guardar cambios en localStorage
  watch(movimientos, (val) => {
    localStorage.setItem('movimientos', JSON.stringify(val))
  }, { deep: true })

  // === Métodos CRUD ===
  const agregarMovimiento = (mov) => {
    movimientos.value.push({
      id: Date.now(),
      ...mov,
      fecha: mov.fecha || new Date().toISOString()
    })
  }

  const eliminarMovimiento = (id) => {
    movimientos.value = movimientos.value.filter(m => m.id !== id)
  }

  // === Helpers ===
  const totalPorTipo = (tipo) =>
    movimientos.value
      .filter(m => m.tipo === tipo)
      .reduce((acc, m) => acc + m.monto, 0)

  // === Totales globales ===
  const totalIngresos = computed(() => totalPorTipo('ingreso'))
  const totalGastos = computed(() => totalPorTipo('gasto'))
  const totalFijos = computed(() => totalPorTipo('fijo'))
  const totalAhorros = computed(() => totalPorTipo('ahorro'))
  const totalDeudas = computed(() => totalPorTipo('deuda'))
  const totalPrestamos = computed(() => totalPorTipo('prestamo'))

  // Balance global
  const balance = computed(() =>
    totalIngresos.value
    - totalGastos.value
    - totalFijos.value
    - totalDeudas.value
    + totalAhorros.value
    - totalPrestamos.value
  )

  // === Funciones mensuales ===
  const movimientosPorMes = (mes, anio) =>
    movimientos.value.filter(m => {
      const fecha = new Date(m.fecha)
      return fecha.getMonth() === mes && fecha.getFullYear() === anio
    })

  const balanceAnterior = (mes, anio) => {
    // Enero -> diciembre del año anterior
    if (mes === 0) {
      mes = 11
      anio--
    } else {
      mes--
    }

    const mov = movimientosPorMes(mes, anio)

    const ingresos = mov.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + m.monto, 0)
    const gastos = mov.filter(m => m.tipo === 'gasto').reduce((acc, m) => acc + m.monto, 0)
    const fijos = mov.filter(m => m.tipo === 'fijo').reduce((acc, m) => acc + m.monto, 0)
    const deudas = mov.filter(m => m.tipo === 'deuda').reduce((acc, m) => acc + m.monto, 0)
    const prestamos = mov.filter(m => m.tipo === 'prestamo').reduce((acc, m) => acc + m.monto, 0)
    const ahorros = mov.filter(m => m.tipo === 'ahorro').reduce((acc, m) => acc + m.monto, 0)

    return ingresos - gastos - fijos - deudas + ahorros - prestamos
  }

  const flujoCajaPorMes = (mes, anio) => {
    const movMes = movimientosPorMes(mes, anio)

    const ingresos = movMes.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + m.monto, 0)
    const gastos = movMes.filter(m => m.tipo === 'gasto').reduce((acc, m) => acc + m.monto, 0)
    const fijos = movMes.filter(m => m.tipo === 'fijo').reduce((acc, m) => acc + m.monto, 0)
    const deudas = movMes.filter(m => m.tipo === 'deuda').reduce((acc, m) => acc + m.monto, 0)
    const prestamos = movMes.filter(m => m.tipo === 'prestamo').reduce((acc, m) => acc + m.monto, 0)
    const ahorros = movMes.filter(m => m.tipo === 'ahorro').reduce((acc, m) => acc + m.monto, 0)

    const saldoInicial = balanceAnterior(mes, anio) || 0
    const saldoFinal = saldoInicial + ingresos - gastos - fijos - deudas + ahorros - prestamos

    return { saldoInicial, ingresos, gastos, fijos, deudas, prestamos, ahorros, saldoFinal }
  }

  // === Exponer datos y métodos ===
  return {
    movimientos,
    agregarMovimiento,
    eliminarMovimiento,
    totalIngresos,
    totalGastos,
    totalFijos,
    totalAhorros,
    totalDeudas,
    totalPrestamos,
    balance,
    movimientosPorMes,
    balanceAnterior,
    flujoCajaPorMes
  }
})
