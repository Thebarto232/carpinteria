const API_URL = "http://localhost:8080/pruebaApi/api";

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

// 📌 Cargar vendedores y compradores
async function cargarUsuarios() {
  const resVendedor = await fetch(`${API_URL}/usuarios?fk_id_rol=1`);
  const vendedores = await resVendedor.json();
  vendedores.forEach(u => {
    const option = document.createElement("option");
    option.value = u.cod_usuario;
    option.textContent = u.nombre_usuario;
    selectVendedor.appendChild(option);
  });

  const resComprador = await fetch(`${API_URL}/usuarios?rol=Cliente`);
  const compradores = await resComprador.json();
  compradores.forEach(u => {
    const option = document.createElement("option");
    option.value = u.cod_usuario;
    option.textContent = u.nombre_usuario;
    selectComprador.appendChild(option);
  });
}

// 📌 Crear venta inicial y pasar a detalle
formVenta.addEventListener("submit", async (e) => {
  e.preventDefault();

  const vendedorId = selectVendedor.value;
  const compradorId = selectComprador.value;
  const fecha = fechaVenta.value;

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
    metod_pago: "SIN DEFINIR",
    valor_venta: 0,
    descuento_venta: 0,
    estado: "PENDIENTE"
  };

  const res = await fetch(`${API_URL}/ventas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ventaData)
  });

  if (!res.ok) {
    alert("❌ Error al crear la venta.");
    return;
  }

  const nuevaVenta = await res.json();
  alert("✅ Venta creada. Ahora agrega productos.");
  window.location.href = `detalle_venta.html?id=${nuevaVenta.id_venta}`;
});

// 📌 Cargar ventas y actualizar resumen
async function cargarVentas() {
  const res = await fetch(`${API_URL}/ventas`);
  const ventas = await res.json();

  // Resumen
  totalVentasEl.textContent = ventas.length;
  valorTotalEl.textContent = ventas.reduce((acc, v) => acc + v.valor_venta, 0).toFixed(2);
  totalPendientesEl.textContent = ventas.filter(v => v.estado === "PENDIENTE").length;
  totalConcluidasEl.textContent = ventas.filter(v => v.estado === "CONCLUIDA").length;

  // Render tabla
  tablaVentas.innerHTML = "";
  ventas.forEach(v => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${v.id_venta}</td>
      <td>${v.vendedor_nombre}</td>
      <td>${v.comprador_nombre}</td>
      <td>${formatearFecha(v.fecha_venta)}</td>
      <td>${v.valor_venta.toFixed(2)}</td>
      <td>${v.descuento_venta.toFixed(2)}</td>
      <td>${v.estado}</td>
      <td>
        <button class="btn-detalle" data-id="${v.id_venta}">Ver Detalle</button>
        <button class="btn-eliminar" data-id="${v.id_venta}">Eliminar</button>
      </td>
    `;
    tablaVentas.appendChild(fila);
  });
}

// 📌 Acciones de la tabla
tablaVentas.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const ventaId = e.target.getAttribute("data-id");
    if (!confirm("¿Seguro que deseas eliminar esta venta?")) return;

    const res = await fetch(`${API_URL}/ventas/${ventaId}`, { method: "DELETE" });
    if (!res.ok) {
      alert("❌ Error al eliminar la venta.");
      return;
    }

    alert("✅ Venta eliminada.");
    cargarVentas();
  }

  if (e.target.classList.contains("btn-detalle")) {
    const ventaId = e.target.getAttribute("data-id");
    window.location.href = `detalle_venta.html?id=${ventaId}`;
  }
});

cargarUsuarios();
cargarVentas();
