const API_BASE = "http://localhost:8080/pruebaApi/api";

const selectVenta = document.getElementById("select-venta");
const selectProducto = document.getElementById("select-producto");
const inputCantidad = document.getElementById("input-cantidad");
const form = document.getElementById("form-detalle");
const estadoVentaEl = document.getElementById("estado-venta");
const tablaDetalle = document.getElementById("tabla-detalle");
const totalVentaEl = document.getElementById("total-venta");
const btnConcluir = document.getElementById("btn-concluir");

let ventaIdActual = null;
let estadoVenta = "";
let productosMap = new Map();

document.addEventListener("DOMContentLoaded", () => {
  cargarVentas();
  cargarProductos();

  selectVenta.addEventListener("change", async () => {
    ventaIdActual = parseInt(selectVenta.value);
    await actualizarEstadoVenta();
    await cargarDetalles();
  });

  form.addEventListener("submit", agregarProducto);
  btnConcluir.addEventListener("click", concluirVenta);
});

async function cargarVentas() {
  const res = await fetch(`${API_BASE}/ventas`);
  const ventas = await res.json();
  selectVenta.innerHTML = `<option value="">Selecciona una venta</option>` +
    ventas.map(v => `<option value="${v.id_venta}">Venta #${v.id_venta} - ${v.fecha_venta}</option>`).join("");
}

async function cargarProductos() {
  const res = await fetch(`${API_BASE}/productos`);
  const productos = await res.json();
  productosMap.clear();
  selectProducto.innerHTML = `<option value="">Selecciona un producto</option>` +
    productos.map(p => {
      productosMap.set(p.id_producto, p);
      return `<option value="${p.id_producto}">${p.nombre_producto}</option>`;
    }).join("");
}

async function actualizarEstadoVenta() {
  const res = await fetch(`${API_BASE}/ventas/buscar?id=${ventaIdActual}`);
  const venta = await res.json();
  estadoVenta = venta.estado;
  estadoVentaEl.textContent = `Estado actual: ${estadoVenta}`;
  form.querySelector("button").disabled = estadoVenta !== "PENDIENTE";
  btnConcluir.style.display = estadoVenta === "PENDIENTE" ? "inline-block" : "none";
}

async function cargarDetalles() {
  const res = await fetch(`${API_BASE}/detalle_venta?id_venta=${ventaIdActual}`);
  const detalles = await res.json();

  let total = 0;
  tablaDetalle.innerHTML = detalles.map(d => {
    total += d.subtotal ?? 0;
    return `
      <tr>
        <td>${d.productoNombre}</td>
        <td>${d.cantidad_producto}</td>
        <td>$${d.precio_unitario.toFixed(2)}</td>
        <td>$${d.subtotal.toFixed(2)}</td>
        <td><button class="eliminar-btn" data-id="${d.id_detalle_venta}">Eliminar</button></td>
      </tr>
    `;
  }).join("");

  totalVentaEl.textContent = total.toFixed(2);

  document.querySelectorAll(".eliminar-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (confirm("¿Eliminar este producto?")) {
        await fetch(`${API_BASE}/detalle_venta/${id}`, { method: "DELETE" });
        await actualizarEstadoVenta();
        await cargarDetalles();
      }
    });
  });
}

async function agregarProducto(e) {
  e.preventDefault();
  if (!ventaIdActual || estadoVenta !== "PENDIENTE") return;

  const productoId = parseInt(selectProducto.value);
  const cantidad = parseInt(inputCantidad.value);
  const producto = productosMap.get(productoId);

  if (!productoId || isNaN(cantidad) || cantidad <= 0) {
    alert("Selecciona un producto y una cantidad válida.");
    return;
  }

  if (cantidad > producto.stock) {
    alert("❌ No hay suficiente stock disponible.");
    return;
  }

  const data = {
    fk_id_venta: ventaIdActual,
    fk_id_producto: productoId,
    cantidad_producto: cantidad
  };

  const res = await fetch(`${API_BASE}/detalle_venta`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    alert("❌ Error al agregar producto.");
    return;
  }

  inputCantidad.value = "";
  await actualizarEstadoVenta();
  await cargarDetalles();
}

async function actualizarValorVentaEnBackend() {
  const total = parseFloat(totalVentaEl.textContent);

  const data = {
    valor_venta: total
  };

  await fetch(`${API_BASE}/ventas/${ventaIdActual}`, {
    method: "PATCH", // 👈 Usa PATCH para no sobrescribir otros campos
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

async function concluirVenta() {
  if (!ventaIdActual || estadoVenta !== "PENDIENTE") return;

  if (!confirm("¿Estás seguro de concluir esta venta?")) return;

  // ✅ Actualiza valor_venta antes de concluir
  const total = parseFloat(totalVentaEl.textContent);
  const data = {
    valor_venta: total,
    estado: "PENDIENTE"
  };

  const resUpdate = await fetch(`${API_BASE}/ventas/${ventaIdActual}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!resUpdate.ok) {
    alert("❌ No se pudo actualizar el valor de la venta.");
    return;
  }

  // ✅ Ahora concluye la venta
  const res = await fetch(`${API_BASE}/ventas/concluir/${ventaIdActual}`, { method: "PUT" });

  if (!res.ok) {
    let errorMsg = "❌ No se pudo concluir la venta.";
    try {
      const errorData = await res.json();
      if (errorData.error) errorMsg += `\n${errorData.error}`;
    } catch (_) {}
    alert(errorMsg);
    return;
  }

  try {
    const resultado = await res.json();
    alert(`✅ Venta concluida. Estado: ${resultado.estado}`);
  } catch (e) {
    alert("⚠️ Venta concluida, pero no se pudo interpretar la respuesta.");
  }

  await actualizarEstadoVenta();
  await cargarDetalles();
}
