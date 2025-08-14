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

// 🗓️ Formatear fecha
function formatearFecha(fechaRaw) {
  const fecha = new Date(fechaRaw);
  return fecha.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

// 📦 Cargar carritos disponible
// 📦 Cargar carritos disponibles
async function cargarCarritos() {
  try {
    const res = await fetch(`${API_URL}/carrito/carritos-disponibles`);
    const carritos = await res.json();

    selectCarrito.innerHTML = "";

    if (carritos.length === 0) {
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
        <td>${v.estado}</td>
        <td>
          <button class="button button--info btn-ver-carrito" data-carrito="${v.fk_id_carrito}">Ver productos</button>
        </td>
        <td>
          <button class="button button--danger btn-eliminar" data-id="${v.id_venta}">Eliminar</button>
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
tablaVentas.addEventListener("click", async (e) => {
  const ventaId = e.target.getAttribute("data-id");

  if (e.target.classList.contains("btn-eliminar")) {
    if (!ventaId || !confirm("¿Eliminar esta venta?")) return;

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

  if (e.target.classList.contains("btn-ver-carrito")) {
    const carritoId = e.target.getAttribute("data-carrito");
    if (!carritoId) return;

    try {
      const res = await fetch(`${API_URL}/carrito/${carritoId}`);
      const productos = await res.json();

      listaProductosCarrito.innerHTML = "";
      productos.forEach(p => {
        listaProductosCarrito.innerHTML += `
          <li class="carrito__item">
            ${p.nombre_producto} - Cantidad: ${p.cantidad} - Precio: $${p.precio_unitario}
          </li>
        `;
      });

      modalCarrito.classList.remove("modal--hidden");
    } catch (error) {
      alert("❌ No se pudo cargar el carrito.");
      console.error(error);
    }
  }
});

// 🔙 Cerrar modal de carrito
btnCerrarCarrito.addEventListener("click", () => {
  modalCarrito.classList.add("modal--hidden");
  listaProductosCarrito.innerHTML = "";
});

// Inicialización
cargarCarritos();
cargarVentas();
