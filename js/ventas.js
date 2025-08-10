const API_URL = "http://localhost:8080/pruebaApi/api";

const formVenta = document.getElementById("form-venta");
const selectVendedor = document.getElementById("select-vendedor");
const selectComprador = document.getElementById("select-comprador");
const fechaVenta = document.getElementById("fecha-venta");
const valorVenta = document.getElementById("valor-venta");
const descuentoVenta = document.getElementById("descuento-venta");
const tablaVentas = document.getElementById("tabla-ventas");

// 🗓️ Función para formatear fecha
function formatearFecha(fechaRaw) {
  const fecha = new Date(fechaRaw);
  return fecha.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

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

formVenta.addEventListener("submit", async (e) => {
  e.preventDefault();

  const vendedorId = selectVendedor.value;
  const compradorId = selectComprador.value;
  const fecha = fechaVenta.value;
  const valor = parseFloat(valorVenta.value);
  const descuento = parseFloat(descuentoVenta.value) || 0;

  if (!vendedorId || !compradorId || !fecha || isNaN(valor)) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  const ventaData = {
    fk_id_vendedor: parseInt(vendedorId),
    fk_id_comprador: parseInt(compradorId),
    fecha_venta: fecha,
    metod_pago: "Efectivo",
    valor_venta: valor,
    descuento_venta: descuento,
    estado: "PENDIENTE"
  };

  const res = await fetch(`${API_URL}/ventas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ventaData)
  });

  if (!res.ok) {
    alert("❌ Error al registrar la venta.");
    return;
  }

  alert("✅ Venta registrada correctamente.");
  formVenta.reset();
  cargarVentas();
});

async function cargarVentas() {
  const res = await fetch(`${API_URL}/ventas`);
  const ventas = await res.json();

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
      <td><button class="btn-eliminar" data-id="${v.id_venta}">Eliminar</button></td>
    `;
    tablaVentas.appendChild(fila);
  });
}

tablaVentas.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-eliminar")) {
    const ventaId = e.target.getAttribute("data-id");
    const confirmacion = confirm("¿Seguro que deseas eliminar esta venta?");
    if (!confirmacion) return;

    const res = await fetch(`${API_URL}/ventas/${ventaId}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      alert("❌ Error al eliminar la venta.");
      return;
    }

    alert("✅ Venta eliminada.");
    cargarVentas();
  }
});

cargarUsuarios();
cargarVentas();
