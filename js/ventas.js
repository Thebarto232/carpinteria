const API_URL = "http://localhost:8080/pruebaApi/api";

// Elementos del DOM
const formVenta = document.getElementById("form-venta");
const selectCarrito = document.getElementById("select-carrito");
const fechaVenta = document.getElementById("fecha-venta");
const metodoPagoInput = document.getElementById("metodo-pago");
const descuentoInput = document.getElementById("descuento");
const estadoSelect = document.getElementById("estado");

const tablaVentas = document.getElementById("tabla-ventas");
const ventasRegistradasEl = document.getElementById("ventas-registradas");
const valorTotalEl = document.getElementById("valor-total");

const modalCarrito = document.getElementById("modal-carrito");
const listaProductosCarrito = document.getElementById("lista-productos-carrito");
const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");

// ✅ Modal para editar estado
const modalEditarEstado = document.createElement("div");
modalEditarEstado.classList.add("modal", "modal--hidden");
modalEditarEstado.innerHTML = `
  <div class="modal__content">
    <h2 class="modal__title">Editar Estado de Venta</h2>
    <select id="select-nuevo-estado" class="form__select">
      <option value="PENDIENTE">PENDIENTE</option>
      <option value="COMPLETADA">COMPLETADA</option>
      <option value="CANCELADA">CANCELADA</option>
    </select>
    <div class="form__actions">
      <button id="btn-guardar-estado" class="button button--confirm">Guardar</button>
      <button id="btn-cerrar-estado" class="button button--cancel">Cancelar</button>
    </div>
  </div>
`;
document.body.appendChild(modalEditarEstado);
const selectNuevoEstado = document.getElementById("select-nuevo-estado");
const btnGuardarEstado = document.getElementById("btn-guardar-estado");
const btnCerrarEstado = document.getElementById("btn-cerrar-estado");

let ventaSeleccionadaId = null;

// 🗓️ Formatear fecha
function formatearFecha(fechaRaw) {
  const fecha = new Date(fechaRaw);
  return fecha.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

// 📦 Cargar carritos disponibles
async function cargarCarritos() {
  try {
    const res = await fetch(`${API_URL}/carrito/carritos-disponibles`);
    const carritos = await res.json();

    selectCarrito.innerHTML = "";

    if (!Array.isArray(carritos) || carritos.length === 0) {
      selectCarrito.innerHTML = `<option disabled selected>No hay carritos disponibles</option>`;
      return;
    }

    carritos.forEach(id => {
      selectCarrito.innerHTML += `<option value="${id}">Carrito #${id}</option>`;
    });
  } catch (error) {
    alert("❌ Error al cargar carritos disponibles.");
    console.error(error);
  }
}

// 🔄 Cambiar estado de venta
async function cambiarEstadoVenta(id, nuevoEstado) {
  try {
    const res = await fetch(`${API_URL}/ventas/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (!res.ok) throw new Error("Error al actualizar estado");

    alert(`✅ Estado actualizado a ${nuevoEstado}`);
    cargarVentas();
  } catch (err) {
    console.error(err);
    alert("❌ No se pudo actualizar el estado.");
  }
}

// 🧾 Registrar venta
formVenta.addEventListener("submit", async (e) => {
  e.preventDefault();

  const carritoId = selectCarrito.value;
  const fecha = fechaVenta.value;
  const metodoPago = metodoPagoInput.value.trim();
  const descuento = parseFloat(descuentoInput.value) || 0;
  const estado = estadoSelect.value;

  if (!carritoId || !fecha || !metodoPago || !estado) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  const ventaData = {
    fk_id_carrito: parseInt(carritoId),
    fecha_venta: fecha,
    metod_pago: metodoPago,
    descuento_venta: descuento,
    estado
  };

  try {
    const res = await fetch(`${API_URL}/ventas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ventaData)
    });

    if (!res.ok) throw new Error("Error al registrar la venta");

    alert("✅ Venta registrada correctamente.");
    formVenta.reset();
    cargarCarritos();
    cargarVentas();
  } catch (error) {
    alert("❌ No se pudo registrar la venta.");
    console.error(error);
  }
});

// 📊 Cargar ventas y renderizar tabla
async function cargarVentas() {
  try {
    const res = await fetch(`${API_URL}/ventas`);
    const ventas = await res.json();

    if (!Array.isArray(ventas) || ventas.length === 0) {
      ventasRegistradasEl.textContent = 0;
      valorTotalEl.textContent = "0.00";
      tablaVentas.innerHTML = `<tr><td colspan="8" style="text-align:center;">📭 No hay ventas registradas</td></tr>`;
      return;
    }

    ventasRegistradasEl.textContent = ventas.length;
    valorTotalEl.textContent = ventas.reduce((acc, v) => {
      const valor = parseFloat(v.valor_venta);
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0).toFixed(2);

    tablaVentas.innerHTML = "";
    ventas.forEach(v => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${v.id_venta}</td>
        <td>${formatearFecha(v.fecha_venta)}</td>
        <td>${v.metod_pago}</td>
        <td>${v.descuento_venta.toFixed(2)}</td>
        <td>${v.valor_venta.toFixed(2)}</td>
        <td>
          <span class="estado-venta-text">${v.estado}</span>
          <button class="button button--secondary btn-editar-estado" data-id="${v.id_venta}">Editar</button>
        </td>
        <td>
          <button class="button button--info btn-ver-carrito" data-productos='${JSON.stringify(v.productos_comprados)}'>Ver productos</button>
        </td>
        
      `;

      tablaVentas.appendChild(fila);
    });
  } catch (error) {
    alert("❌ Error al cargar ventas.");
    console.error(error);
  }
}

// 🧹 Acciones de la tabla
tablaVentas.addEventListener("click", (e) => {
  const ventaId = e.target.getAttribute("data-id");

  // Eliminar
  if (e.target.classList.contains("btn-eliminar")) {
    if (!ventaId || !confirm("¿Eliminar esta venta?")) return;

    fetch(`${API_URL}/ventas/${ventaId}`, { method: "DELETE" })
      .then(res => {
        if (!res.ok) throw new Error("Error al eliminar");
        alert("✅ Venta eliminada.");
        cargarVentas();
      })
      .catch(err => {
        console.error(err);
        alert("❌ No se pudo eliminar la venta.");
      });
  }

  // Ver carrito
  if (e.target.classList.contains("btn-ver-carrito")) {
    const productosStr = e.target.getAttribute("data-productos");
    listaProductosCarrito.innerHTML = productosStr && productosStr.trim() !== ""
      ? `<li>${productosStr}</li>`
      : `<li>📭 Este carrito no tiene productos.</li>`;
    modalCarrito.classList.remove("modal--hidden");
  }

  // Editar estado
  if (e.target.classList.contains("btn-editar-estado")) {
    ventaSeleccionadaId = e.target.getAttribute("data-id");
    modalEditarEstado.classList.remove("modal--hidden");
  }
});

// 🔙 Cerrar modales
btnCerrarCarrito.addEventListener("click", () => {
  modalCarrito.classList.add("modal--hidden");
  listaProductosCarrito.innerHTML = "";
});
btnCerrarEstado.addEventListener("click", () => {
  modalEditarEstado.classList.add("modal--hidden");
});

// 💾 Guardar nuevo estado
btnGuardarEstado.addEventListener("click", () => {
  if (!ventaSeleccionadaId) return;
  const nuevoEstado = selectNuevoEstado.value;
  cambiarEstadoVenta(ventaSeleccionadaId, nuevoEstado);
  modalEditarEstado.classList.add("modal--hidden");
  ventaSeleccionadaId = null;
});

// Inicialización
cargarCarritos();
cargarVentas();
