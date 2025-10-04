import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const usePrestamosStore = defineStore('prestamos', () => {
  // Estructura: { "2025-10": [ {tipo, persona, monto, descripcion, fecha, estado} ] }
  const prestamos = ref(JSON.parse(localStorage.getItem('prestamosStore') || '{}'))

  // Guardar automáticamente en localStorage
  watch(prestamos, (val) => {
    localStorage.setItem('prestamosStore', JSON.stringify(val))
  }, { deep: true })

  // Agregar préstamo/deuda
  const addPrestamo = (mes, prestamo) => {
    if (!prestamos.value[mes]) prestamos.value[mes] = []
    prestamos.value[mes].push(prestamo)
  }

  // Actualizar
  const updatePrestamo = (mes, index, nuevoPrestamo) => {
    if (prestamos.value[mes] && prestamos.value[mes][index]) {
      prestamos.value[mes][index] = nuevoPrestamo
    }
  }

  // Eliminar
  const removePrestamo = (mes, index) => {
    if (prestamos.value[mes]) {
      prestamos.value[mes].splice(index, 1)
      if (prestamos.value[mes].length === 0) {
        delete prestamos.value[mes]
      }
    }
  }

  // Resetear todos
  const resetPrestamos = () => {
    prestamos.value = {}
    localStorage.removeItem('prestamosStore')
  }

  return {
    prestamos,
    addPrestamo,
    updatePrestamo,
    removePrestamo,
    resetPrestamos
  }
})
