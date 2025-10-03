import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useFinanzasStore = defineStore('finanzas', () => {
  const movimientos = ref(JSON.parse(localStorage.getItem('movimientos') || '[]'))

  // Guardar en localStorage automáticamente
  watch(movimientos, (val) => {
    localStorage.setItem('movimientos', JSON.stringify(val))
  }, { deep: true })

  // Agregar movimiento
  const agregarMovimiento = (mov) => {
    movimientos.value.push({
      id: Date.now(),
      ...mov,
      fecha: mov.fecha || new Date().toISOString()
    })
  }

  // Eliminar movimiento
  const eliminarMovimiento = (id) => {
    movimientos.value = movimientos.value.filter(m => m.id !== id)
  }

  // Totales por tipo
  const totalPorTipo = (tipo) => 
    movimientos.value.filter(m => m.tipo === tipo).reduce((acc, m) => acc + m.monto, 0)

  const totalIngresos = computed(() => totalPorTipo('ingreso'))
  const totalGastos = computed(() => totalPorTipo('gasto'))
  const totalAhorros = computed(() => totalPorTipo('ahorro'))
  const totalPrestamos = computed(() => totalPorTipo('prestamo'))
  const totalDeudas = computed(() => totalPorTipo('deuda'))
  const totalFijos = computed(() => totalPorTipo('fijo'))

  // Balance general
  const balance = computed(() =>
    totalIngresos.value 
    - totalGastos.value 
    - totalFijos.value 
    - totalDeudas.value 
    + totalAhorros.value 
    - totalPrestamos.value
  )

  // Movimientos por mes
  const movimientosPorMes = (mes, anio) => {
    return movimientos.value.filter(m => {
      const fecha = new Date(m.fecha)
      return fecha.getMonth() === mes && fecha.getFullYear() === anio
    })
  }

  // Saldo del mes anterior
  const balanceAnterior = (mes, anio) => {
    if(mes === 0) anio--; // Enero, ir a diciembre anterior
    const mesAnterior = (mes === 0) ? 11 : mes - 1
    const mov = movimientosPorMes(mesAnterior, anio)
    const ingresos = mov.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + m.monto,0)
    const gastos = mov.filter(m => m.tipo === 'gasto').reduce((acc, m) => acc + m.monto,0)
    const fijos = mov.filter(m => m.tipo === 'fijo').reduce((acc, m) => acc + m.monto,0)
    const deudas = mov.filter(m => m.tipo === 'deuda').reduce((acc, m) => acc + m.monto,0)
    const prestamos = mov.filter(m => m.tipo === 'prestamo').reduce((acc, m) => acc + m.monto,0)
    const ahorros = mov.filter(m => m.tipo === 'ahorro').reduce((acc, m) => acc + m.monto,0)
    return ingresos - gastos - fijos - deudas + ahorros - prestamos
  }

  // Flujo de caja mensual
  const flujoCajaPorMes = (mes, anio) => {
    const movMes = movimientosPorMes(mes, anio)
    const ingresos = movMes.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + m.monto,0)
    const gastos = movMes.filter(m => m.tipo === 'gasto').reduce((acc, m) => acc + m.monto,0)
    const fijos = movMes.filter(m => m.tipo === 'fijo').reduce((acc, m) => acc + m.monto,0)
    const deudas = movMes.filter(m => m.tipo === 'deuda').reduce((acc, m) => acc + m.monto,0)
    const prestamos = movMes.filter(m => m.tipo === 'prestamo').reduce((acc, m) => acc + m.monto,0)
    const ahorros = movMes.filter(m => m.tipo === 'ahorro').reduce((acc, m) => acc + m.monto,0)

    const saldoInicial = balanceAnterior(mes, anio) || 0
    const saldoFinal = saldoInicial + ingresos - gastos - fijos - deudas + ahorros - prestamos

    return { saldoInicial, ingresos, gastos, fijos, deudas, prestamos, ahorros, saldoFinal }
  }

  return {
    movimientos,
    agregarMovimiento,
    eliminarMovimiento,
    totalIngresos,
    totalGastos,
    totalAhorros,
    totalPrestamos,
    totalDeudas,
    totalFijos,
    balance,
    movimientosPorMes,
    balanceAnterior,
    flujoCajaPorMes
  }
})
