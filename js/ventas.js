const API_URL = "http://localhost:8080/pruebaApi/api";

// Elementos del DOM
const formVenta = document.getElementById("form-venta");
const selectVendedor = document.getElementById("select-vendedor");
const selectComprador = document.getElementById("select-comprador");
const fechaVenta = document.getElementById("fecha-venta");
const tablaVentas = document.getElementById("tabla-ventas");

const totalVentasEl = document.getElementById("total-ventas");
const valorTotalEl = document.getElementById("valor-total");
const totalPendientesEl = document.getElementById("total-pendientes");
const totalConcluidasEl = document.getElementById("total-concluidas");

// 🗓️ Formatear fecha
function formatearFecha(fechaRaw) {
  const fecha = new Date(fechaRaw);
  return fecha.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

// 📌 Cargar usuarios según rol
async function cargarUsuarios() {
  const [resVendedor, resComprador] = await Promise.all([
    fetch(`${API_URL}/usuarios?fk_id_rol=1`),
    fetch(`${API_URL}/usuarios?rol=Cliente`)
  ]);

  const vendedores = await resVendedor.json();
  const compradores = await resComprador.json();

  vendedores.forEach(u => {
    selectVendedor.innerHTML += `<option value="${u.cod_usuario}">${u.nombre_usuario}</option>`;
  });

  compradores.forEach(u => {
    selectComprador.innerHTML += `<option value="${u.cod_usuario}">${u.nombre_usuario}</option>`;
  });
}

// 📌 Crear venta
formVenta.addEventListener("submit", async (e) => {
  e.preventDefault();

  const vendedorId = selectVendedor.value;
  const compradorId = selectComprador.value;
  const fecha = fechaVenta.value;

  // Validaciones
  if (!vendedorId || !compradorId || !fecha) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  if (vendedorId === compradorId) {
    alert("El vendedor y el comprador no pueden ser la misma persona.");
    return;
  }

  const ventaData = {
    fk_id_vendedor: parseInt(vendedorId),
    fk_id_comprador: parseInt(compradorId),
    fecha_venta: fecha,
    metod_pago: "EFECTIVO", // Por defecto
    valor_venta: 0,
    descuento_venta: 0,
    estado: "PENDIENTE"
  };

  try {
    const res = await fetch(`${API_URL}/ventas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ventaData)
    });

    if (!res.ok) throw new Error("Error al crear la venta");

    const nuevaVenta = await res.json();
    alert("✅ Venta creada. Ahora agrega productos.");
    window.location.href = `detalle_venta.html?id=${nuevaVenta.id_venta}`;
  } catch (error) {
    alert("❌ No se pudo crear la venta.");
    console.error(error);
  }
});

// 📌 Cargar ventas y renderizar tabla
async function cargarVentas() {
  try {
    const res = await fetch(`${API_URL}/ventas`);
    const ventas = await res.json();

    // Resumen
    totalVentasEl.textContent = ventas.length;
    valorTotalEl.textContent = ventas.reduce((acc, v) => acc + v.valor_venta, 0).toFixed(2);
    totalPendientesEl.textContent = ventas.filter(v => v.estado === "PENDIENTE").length;
    totalConcluidasEl.textContent = ventas.filter(v => v.estado === "CONCLUIDA").length;

    // Tabla
    tablaVentas.innerHTML = "";
    ventas.forEach(v => {
      const fila = document.createElement("tr");

      // Acciones condicionadas por estado
      const acciones = `
        <button class="btn-detalle" data-id="${v.id_venta}">Gestionar Venta</button>
        ${v.estado === "PENDIENTE" ? `
          <button class="btn-concluir" data-id="${v.id_venta}">Concluir</button>
          <button class="btn-eliminar" data-id="${v.id_venta}">Eliminar</button>
        ` : ""}
      `;

      fila.innerHTML = `
        <td>${v.id_venta}</td>
        <td>${v.vendedor_nombre}</td>
        <td>${v.comprador_nombre}</td>
        <td>${formatearFecha(v.fecha_venta)}</td>
        <td>${v.valor_venta.toFixed(2)}</td>
        <td>${v.descuento_venta.toFixed(2)}</td>
        <td>${v.estado}</td>
        <td>${acciones}</td>
      `;
      tablaVentas.appendChild(fila);
    });
  } catch (error) {
    alert("❌ Error al cargar ventas.");
    console.error(error);
  }
}

// 📌 Acciones de la tabla
tablaVentas.addEventListener("click", async (e) => {
  const ventaId = e.target.getAttribute("data-id");
  if (!ventaId) return;

  if (e.target.classList.contains("btn-eliminar")) {
    if (!confirm("¿Seguro que deseas eliminar esta venta?")) return;

    try {
      const res = await fetch(`${API_URL}/ventas/${ventaId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");

      alert("✅ Venta eliminada.");
      cargarVentas();
    } catch (error) {
      alert("❌ No se pudo eliminar la venta.");
      console.error(error);
    }
  }

  if (e.target.classList.contains("btn-detalle")) {
    window.location.href = `detalle_venta.html?id=${ventaId}`;
  }

  if (e.target.classList.contains("btn-concluir")) {
    if (!confirm("¿Concluir esta venta? Una vez cerrada no se podrá editar.")) return;
  
    try {
      const res = await fetch(`${API_URL}/ventas/concluir/${ventaId}`, { method: "PUT" });
      if (!res.ok) throw new Error("Error al concluir");
  
      const resultado = await res.text();
  
      switch (resultado) {
        case "CONCLUIDA":
          alert("✅ Venta concluida correctamente.");
          break;
        case "YA_CONCLUIDA":
          alert("⚠️ Esta venta ya fue concluida anteriormente.");
          break;
        case "SIN_PRODUCTOS":
          alert("❌ No se puede concluir una venta sin productos.");
          break;
        case "NO_ENCONTRADA":
          alert("❌ Venta no encontrada.");
          break;
        default:
          alert("❌ Error inesperado al concluir la venta.");
      }
  
      cargarVentas();
    } catch (error) {
      alert("❌ No se pudo concluir la venta.");
      console.error(error);
    }
  }
  
});

// Inicialización
cargarUsuarios();
cargarVentas();
