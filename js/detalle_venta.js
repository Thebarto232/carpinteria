const API_BASE = "http://localhost:8080/pruebaApi/api";

// Elementos del DOM
const selectVenta = document.getElementById("select-venta");
const selectProducto = document.getElementById("select-producto");
const inputCantidad = document.getElementById("input-cantidad");
const form = document.getElementById("form-detalle");
const estadoVentaEl = document.getElementById("estado-venta");
const tablaDetalle = document.getElementById("tabla-detalle");
const totalVentaEl = document.getElementById("total-venta");
const btnConcluir = document.getElementById("btn-concluir");

// Variables de estado
let ventaIdActual = null;
let estadoVenta = "";
let productosMap = new Map();

// Inicialización
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

// 📌 Cargar ventas disponibles
async function cargarVentas() {
  const res = await fetch(`${API_BASE}/ventas`);
  const ventas = await res.json();
  selectVenta.innerHTML = `<option value="">Selecciona una venta</option>` +
    ventas.map(v => `<option value="${v.id_venta}">Venta #${v.id_venta} - ${v.fecha_venta}</option>`).join("");
}

// 📌 Cargar productos y mapear stock
async function cargarProductos() {
  const res = await fetch(`${API_BASE}/productos`);
  const productos = await res.json();
  productosMap.clear();
  selectProducto.innerHTML = `<option value="">Selecciona un producto</option>` +
    productos.map(p => {
      productosMap.set(p.id_producto, p);
      return `<option value="${p.id_producto}">${p.nombre_producto} (Stock: ${p.stock})</option>`;
    }).join("");
}

// 📌 Actualizar estado de la venta
async function actualizarEstadoVenta() {
  const res = await fetch(`${API_BASE}/ventas/buscar?id=${ventaIdActual}`);
  const venta = await res.json();
  estadoVenta = venta.estado;
  estadoVentaEl.textContent = `Estado actual: ${estadoVenta}`;

  // Condicionar acciones
  form.querySelector("button").disabled = estadoVenta !== "PENDIENTE";
  btnConcluir.style.display = estadoVenta === "PENDIENTE" ? "inline-block" : "none";
}

// 📌 Cargar detalles de la venta
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
        <td>
          ${estadoVenta === "PENDIENTE" ? `<button class="eliminar-btn" data-id="${d.id_detalle_venta}">Eliminar</button>` : ""}
        </td>
      </tr>
    `;
  }).join("");

  totalVentaEl.textContent = total.toFixed(2);

  // Activar botones de eliminación
  if (estadoVenta === "PENDIENTE") {
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
}

// 📌 Agregar producto a la venta
async function agregarProducto(e) {
  e.preventDefault();
  if (!ventaIdActual || estadoVenta !== "PENDIENTE") {
    alert("⚠️ Esta venta no está activa.");
    return;
  }

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

// 📌 Actualizar valor total en backend
async function actualizarValorVentaEnBackend() {
  const total = parseFloat(totalVentaEl.textContent);
  const data = { valor_venta: total };

  await fetch(`${API_BASE}/ventas/${ventaIdActual}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

// 📌 Concluir venta
async function concluirVenta(idVenta) {
  if (!confirm("¿Concluir esta venta? Una vez cerrada no se podrá editar.")) return;

  try {
    const res = await fetch(`${API_URL}/ventas/concluir/${idVenta}`, {
      method: "PUT"
    });

    const data = await res.json();

    if (res.ok) {
      if (data.estado === "CONCLUIDA") {
        alert("✅ Venta concluida correctamente.");
        window.location.reload();
      } else {
        alert("⚠️ Estado inesperado: " + data.estado);
      }
    } else {
      // Manejo de errores conocidos
      if (data.error === "Venta no encontrada") {
        alert("❌ La venta no existe.");
      } else if (data.error === "La venta ya fue concluida") {
        alert("⚠️ Esta venta ya está cerrada.");
      } else if (data.error === "La venta no tiene productos") {
        alert("❌ No puedes concluir una venta sin productos.");
      } else {
        alert("❌ Error inesperado: " + data.error);
      }
    }
  } catch (error) {
    alert("❌ No se pudo concluir la venta.");
    console.error(error);
  }
}
