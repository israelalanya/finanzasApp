<template>
  <div class="dashboard">
    <h1>Resumen Financiero</h1>

    <!-- Cards resumen -->
    <div class="cards">
      <div class="card ingreso">
        <h3>Ingresos</h3>
        <p>S/ {{ fmt(finanzasStore.totalIngresos) }}</p>
        <span
          class="percent"
          :style="{ color: ingresoPercentage < 0 ? '#e74c3c' : '#2ecc71' }"
        >
          {{ fmt(ingresoPercentage, 1) }}%
        </span>
      </div>

      <div class="card gasto">
        <h3>Gastos (fijos + diarios)</h3>
        <p>S/ {{ fmt(totalGastos) }}</p>
        <span
          class="percent"
          :style="{ color: gastoPercentage < 0 ? '#e74c3c' : '#2ecc71' }"
        >
          {{ fmt(gastoPercentage, 1) }}%
        </span>
      </div>

      <div class="card presupuesto-total">
        <h3>Presupuesto Mensual</h3>
        <p>S/ {{ fmt(presupuestoTotal) }}</p>
      </div>

      <div class="card presupuesto-gastado">
        <h3>Presupuesto Gastado</h3>
        <p>S/ {{ fmt(presupuestoGastado) }}</p>
        <span class="percent" :style="{ color: porcentajePresupuestoColor }">
          {{ fmt(porcentajeUsoPresupuesto, 1) }}%
        </span>
      </div>

      <div class="card ahorro">
        <h3>Ahorros</h3>
        <p>S/ {{ fmt(finanzasStore.totalAhorros) }}</p>
      </div>

      <div class="card prestamo">
        <h3>Préstamos</h3>
        <p>S/ {{ fmt(prestamosStore.totalPrestamos) }}</p>
      </div>

      <div class="card deuda">
        <h3>Deudas</h3>
        <p>S/ {{ fmt(prestamosStore.totalDeudas) }}</p>
      </div>

      <div class="card balance">
        <h3>Balance General</h3>
        <p>S/ {{ fmt(finanzasStore.balance) }}</p>
      </div>
    </div>

    <!-- Quick KPIs -->
    <div class="kpi-row">
      <div class="kpi">
        <small>Cuenta más usada</small>
        <div class="kpi-value">{{ cuentaMasUsada || "—" }}</div>
      </div>
      <div class="kpi">
        <small>Medio más usado</small>
        <div class="kpi-value">{{ medioMasUsado || "—" }}</div>
      </div>
      <div class="kpi">
        <small>Moneda principal</small>
        <div class="kpi-value">{{ monedaPrincipal }}</div>
      </div>
      <div class="kpi">
        <small>Mes más activo</small>
        <div class="kpi-value">{{ mesMasActivo || "—" }}</div>
      </div>
    </div>

    <!-- Presupuesto vs Gastos por Categoría -->
    <div class="chart-container">
      <h2>Presupuesto vs Gastos por Categoría</h2>
      <div class="presupuesto-section">
        <div
          v-if="Object.keys(gastoPorCategoria).length === 0"
          class="empty-msg"
        >
          No hay gastos registrados.
        </div>
        <div
          v-for="(cat, key) in gastoPorCategoria"
          :key="key"
          class="presupuesto-bar"
        >
          <span class="cat-label">
            {{ key }}: S/ {{ fmt(cat.gasto) }} / S/ {{ fmt(cat.presupuesto) }}
            <strong
              >({{
                fmt(porcentajeUso(cat.gasto, cat.presupuesto), 1)
              }}%)</strong
            >
          </span>
          <div class="bar-bg">
            <div
              class="bar-fill"
              :style="{
                width:
                  Math.min(
                    (cat.gasto / Math.max(cat.presupuesto, 1)) * 100,
                    100
                  ) + '%',
                background: barColor(cat.gasto, cat.presupuesto),
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Flujo de Caja Mensual Interactivo -->
    <div class="chart-container">
      <h2>Flujo de Caja Mensual</h2>
      <div class="mes-buttons">
        <button
          v-for="(mes, i) in meses"
          :key="i"
          :class="{ active: mesSeleccionado === i }"
          @click="mesSeleccionado = i"
        >
          {{ mes }}
        </button>
      </div>
      <div class="flujo-info">
        <p><strong>Mes:</strong> {{ meses[mesSeleccionado] }}</p>
        <p><strong>Saldo Final:</strong> S/ {{ fmt(flujoSaldoFinal) }}</p>
      </div>
    </div>

    <!-- Gráficos -->
   
    

    <!-- Metas -->
    <div class="chart-container">
      <h2>Metas (Progreso)</h2>
      <div v-if="metas.length">
        <div v-for="m in metas" :key="m.nombre" class="meta-row">
          <div class="meta-header">
            <strong>{{ m.nombre }}</strong>
            <span>{{ m.progreso }}%</span>
          </div>
          <div class="meta-bg">
            <div class="meta-fill" :style="{ width: m.progreso + '%' }"></div>
          </div>
        </div>
      </div>
      <p v-else class="empty-msg">No hay metas configuradas.</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted, watch, nextTick } from "vue";
import Chart from "chart.js/auto";

/* ---------- STORE LOCAL (sin Pinia) - mantiene exactamente tu estructura ---------- */
const finanzasStore = reactive({
  movimientos: [], // array de movimientos
  totalIngresos: 0,
  totalGastos: 0,
  totalAhorros: 0,
  balance: 0,
  flujoCajaPorMes(mes, anio = new Date().getFullYear()) {
    // fallback si no tienes implementado: devolver 0
    return { saldoFinal: 0 };
  },
});

const prestamosStore = reactive({
  totalPrestamos: 0,
  totalDeudas: 0,
});

const configStore = reactive({
  presupuestos: {},
  monedas: [{ nombre: "S/" }],
  metas: [],
  presupuestoMensual: 0,
  cuentas: [],
  mediosPago: [],
});

/* ---------- helpers ---------- */
const fmt = (v = 0, decimals = 2) => {
  const n = Number(v || 0);
  if (isNaN(n)) return (0).toFixed(decimals);
  return n.toFixed(decimals);
};

/* ---------- COMPUTED y LOGICA (normalizando tipos) ---------- */
const ingresoPercentage = computed(() => {
  const bal = Number(finanzasStore.balance || 0);
  if (bal === 0) return 0;
  return (Number(finanzasStore.totalIngresos || 0) / bal) * 100 - 100;
});

const totalGastos = computed(() => {
  let suma = 0;
  (finanzasStore.movimientos || []).forEach((m) => {
    const tipo = (m.tipo || "").toString().toLowerCase();
    if (tipo === "gasto" || tipo === "fijo") suma += Number(m.monto || 0);
  });
  return suma;
});

const gastoPercentage = computed(() => {
  const bal = Number(finanzasStore.balance || 0);
  if (bal === 0) return 0;
  return (totalGastos.value / bal) * 100 - 100;
});

const presupuestoTotal = computed(() => {
  return Object.values(configStore.presupuestos || {}).reduce(
    (acc, val) => acc + Number(val || 0),
    0
  );
});

const presupuestoGastado = computed(() => totalGastos.value);

const porcentajeUsoPresupuesto = computed(() => {
  const pt = Number(presupuestoTotal.value || 0);
  if (pt === 0) return 0;
  return (presupuestoGastado.value / pt) * 100;
});

const porcentajePresupuestoColor = computed(() => {
  const pct = porcentajeUsoPresupuesto.value / 100;
  if (pct <= 0.7) return "#42b983";
  if (pct <= 1) return "#f1c40f";
  return "#e74c3c";
});

const gastoPorCategoria = computed(() => {
  const categorias = {};
  (finanzasStore.movimientos || []).forEach((m) => {
    const tipo = (m.tipo || "").toString().toLowerCase();
    if (tipo === "gasto" || tipo === "fijo") {
      const cat = m.categoria || "Sin categoría";
      if (!categorias[cat]) categorias[cat] = { gasto: 0, presupuesto: 0 };
      categorias[cat].gasto += Number(m.monto || 0);
    }
  });
  Object.entries(configStore.presupuestos || {}).forEach(
    ([categoria, presupuesto]) => {
      if (!categorias[categoria])
        categorias[categoria] = { gasto: 0, presupuesto: 0 };
      categorias[categoria].presupuesto = Number(presupuesto || 0);
    }
  );
  return categorias;
});

const porcentajeUso = (gasto, presupuesto) => {
  if (!presupuesto || Number(presupuesto) === 0) return 0;
  return (Number(gasto || 0) / Number(presupuesto || 0)) * 100;
};

const barColor = (gasto, presupuesto) => {
  const pres = Number(presupuesto || 0);
  if (!pres) return "#42b983";
  const pct = Number(gasto || 0) / pres;
  if (pct <= 0.7) return "#42b983";
  if (pct <= 1) return "#f1c40f";
  return "#e74c3c";
};

const meses = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];
const mesSeleccionado = ref(new Date().getMonth());
const flujoSaldoFinal = computed(() => {
  try {
    const res = finanzasStore.flujoCajaPorMes
      ? finanzasStore.flujoCajaPorMes(
          mesSeleccionado.value,
          new Date().getFullYear()
        ).saldoFinal || 0
      : 0;
    return Number(res || 0);
  } catch {
    return 0;
  }
});

/* ---------- KPIs adicionales ---------- */
const monedaPrincipal = computed(() => {
  if (configStore?.moneda) return configStore.moneda;
  if (Array.isArray(configStore.monedas) && configStore.monedas.length)
    return configStore.monedas[0].nombre || "S/";
  return "S/";
});

const cuentaMasUsada = computed(() => {
  const cuentas = (finanzasStore.movimientos || [])
    .map((m) => m.cuenta)
    .filter(Boolean);
  if (!cuentas.length) return null;
  const freq = {};
  cuentas.forEach((c) => (freq[c] = (freq[c] || 0) + 1));
  return Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0];
});

const medioMasUsado = computed(() => {
  const medios = (finanzasStore.movimientos || [])
    .map((m) => m.medioPago || m.medio)
    .filter(Boolean);
  if (!medios.length) return null;
  const freq = {};
  medios.forEach((m) => (freq[m] = (freq[m] || 0) + 1));
  return Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0];
});

const mesMasActivo = computed(() => {
  const arr = (finanzasStore.movimientos || [])
    .map((m) => {
      try {
        return new Date(m.fecha).getMonth();
      } catch {
        return null;
      }
    })
    .filter((v) => typeof v === "number");
  if (!arr.length) return null;
  const freq = {};
  arr.forEach((i) => (freq[i] = (freq[i] || 0) + 1));
  const idx = Number(Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0]);
  return meses[idx] || null;
});

const metas = computed(() =>
  (configStore.metas || []).map((x) => {
    const ah = Number(x.ahorrado || 0);
    const ob = Number(x.objetivo || 0) || 0;
    const progreso = ob === 0 ? 0 : Math.min(100, Math.round((ah / ob) * 100));
    return {
      nombre: x.nombre || x.title || "Meta",
      progreso,
      ahorrado: ah,
      objetivo: ob,
    };
  })
);

/* ---------- CHARTS (seguro y reactivo) ---------- */
const chartIngresos = ref(null);
const chartGastos = ref(null);
const chartBalance = ref(null);

const buildIngresosData = () => {
  const arr = Array(12).fill(0);
  (finanzasStore.movimientos || []).forEach((m) => {
    const tipo = (m.tipo || "").toString().toLowerCase();
    if (tipo === "ingreso") {
      const dt = new Date(m.fecha);
      if (!isNaN(dt)) arr[dt.getMonth()] += Number(m.monto || 0);
    }
  });
  return arr;
};

const buildGastosData = () => {
  const arr = Array(12).fill(0);
  (finanzasStore.movimientos || []).forEach((m) => {
    const tipo = (m.tipo || "").toString().toLowerCase();
    if (tipo === "gasto" || tipo === "fijo") {
      const dt = new Date(m.fecha);
      if (!isNaN(dt)) arr[dt.getMonth()] += Number(m.monto || 0);
    }
  });
  return arr;
};

const buildBalanceData = () => {
  const arr = Array(12).fill(0);
  let acum = 0;
  const i = buildIngresosData();
  const g = buildGastosData();
  for (let idx = 0; idx < 12; idx++) {
    acum += (i[idx] || 0) - (g[idx] || 0);
    arr[idx] = acum;
  }
  return arr;
};

const createOrUpdateCharts = () => {
  // asegurarse que DOM tiene canvases
  nextTick(() => {
    try {
      const ctxI = document.getElementById("chartIngresos");
      const ctxG = document.getElementById("chartGastos");
      const ctxB = document.getElementById("chartBalance");

      try {
        if (chartIngresos.value) chartIngresos.value.destroy();
      } catch {}
      try {
        if (chartGastos.value) chartGastos.value.destroy();
      } catch {}
      try {
        if (chartBalance.value) chartBalance.value.destroy();
      } catch {}

      if (ctxI)
        chartIngresos.value = new Chart(ctxI, {
          type: "bar",
          data: {
            labels: meses,
            datasets: [
              {
                label: "Ingresos",
                data: buildIngresosData(),
                backgroundColor: "#2ecc71",
              },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false },
        });
      if (ctxG)
        chartGastos.value = new Chart(ctxG, {
          type: "bar",
          data: {
            labels: meses,
            datasets: [
              {
                label: "Gastos",
                data: buildGastosData(),
                backgroundColor: "#e74c3c",
              },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false },
        });
      if (ctxB)
        chartBalance.value = new Chart(ctxB, {
          type: "line",
          data: {
            labels: meses,
            datasets: [
              {
                label: "Balance",
                data: buildBalanceData(),
                borderColor: "#2980b9",
                fill: false,
              },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false },
        });
    } catch (err) {
      console.error("Error creando/actualizando charts:", err);
    }
  });
};

onMounted(() => {
  // crear inicialmente (si canvases presentes)
  setTimeout(() => createOrUpdateCharts(), 60);
});

// re-dibujar cuando cambien movimientos o presupuestos
watch(
  () => finanzasStore.movimientos,
  () => createOrUpdateCharts(),
  { deep: true }
);
watch(
  () => configStore.presupuestos,
  () => createOrUpdateCharts(),
  { deep: true }
);
</script>

<style scoped>
.dashboard {
  max-width: 980px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Poppins", sans-serif;
  background: #f9fafc;
  min-height: 100vh;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.card {
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* colores y estilos conservados */
.ingreso {
  background: #2ecc71;
}
.gasto {
  background: #e74c3c;
}
.presupuesto-total {
  background: #2980b9;
}
.presupuesto-gastado {
  background: #f39c12;
}
.ahorro {
  background: #3498db;
}
.prestamo {
  background: #1abc9c;
}
.deuda {
  background: #c0392b;
}
.balance {
  background: #f39c12;
  color: #111;
}

.card h3 {
  margin-bottom: 10px;
  font-size: 16px;
}
.card p {
  font-size: 20px;
  font-weight: bold;
}
.percent {
  font-size: 13px;
  display: block;
  margin-top: 6px;
}

.kpi-row {
  display: flex;
  gap: 12px;
  margin: 18px 0;
  flex-wrap: wrap;
}
.kpi {
  background: #fff;
  padding: 10px;
  border-radius: 6px;
  min-width: 160px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}
.kpi small {
  display: block;
  color: #666;
}
.kpi .kpi-value {
  font-weight: 700;
  margin-top: 6px;
  font-size: 16px;
}

.chart-container {
  margin-bottom: 30px;
  background: #fff;
  padding: 18px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.chart-container h2 {
  text-align: center;
  margin-bottom: 14px;
  color: #333;
  font-size: 18px;
}

.presupuesto-section {
  margin-top: 10px;
}
.presupuesto-bar {
  margin-bottom: 12px;
}
.cat-label {
  font-size: 14px;
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #222;
}
.bar-bg {
  width: 100%;
  height: 16px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 8px 0 0 8px;
  transition: width 0.35s;
}

.mes-buttons {
  text-align: center;
  margin-bottom: 14px;
}
.mes-buttons button {
  margin: 0 6px;
  padding: 8px 12px;
  font-weight: 600;
  border: none;
  background: #eee;
  border-radius: 6px;
  cursor: pointer;
}
.mes-buttons button.active,
.mes-buttons button:hover {
  background: #42b983;
  color: white;
}

.flujo-info p {
  text-align: center;
  font-size: 15px;
  font-weight: 600;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 18px;
}
.charts-grid canvas {
  width: 100%;
  height: 220px;
  display: block;
}

.meta-row {
  margin-bottom: 12px;
}
.meta-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-weight: 600;
}
.meta-bg {
  height: 10px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
}
.meta-fill {
  height: 100%;
  background: #16a085;
  transition: width 0.4s ease;
}

.empty-msg {
  color: #888;
  text-align: center;
  padding: 12px 0;
}
</style>
