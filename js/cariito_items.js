const API_URL = "http://localhost:8080/pruebaApi/api";

// Elementos del DOM
const selectCarrito = document.getElementById("select-carrito");
const tablaItems = document.getElementById("tabla-items");
const totalCarritoEl = document.getElementById("total-carrito");

// 📦 Cargar carritos disponibles
async function cargarCarritos() {
  try {
    const res = await fetch(`${API_URL}/carrito/carritos-disponibles`);
    if (!res.ok) throw new Error("Error al obtener carritos");

    const carritos = await res.json();
    selectCarrito.innerHTML = "";

    if (!Array.isArray(carritos) || carritos.length === 0) {
      selectCarrito.innerHTML = `<option disabled selected>No hay carritos disponibles</option>`;
      tablaItems.innerHTML = "";
      totalCarritoEl.textContent = "0.00";
      return;
    }

    carritos.forEach(c => {
      selectCarrito.innerHTML += `<option value="${c.id_carrito}">Carrito #${c.id_carrito}</option>`;
    });

    // Cargar el primero por defecto
    cargarItemsDelCarrito(carritos[0].id_carrito);
  } catch (error) {
    alert("❌ Error al cargar carritos.");
    console.error("Error en cargarCarritos:", error);
  }
}

// 🧾 Cargar productos del carrito
async function cargarItemsDelCarrito(idCarrito) {
  try {
    const res = await fetch(`${API_URL}/carrito/${idCarrito}`);
    if (!res.ok) throw new Error("Carrito no encontrado");

    const items = await res.json();
    tablaItems.innerHTML = "";
    let total = 0;

    if (!Array.isArray(items) || items.length === 0) {
      tablaItems.innerHTML = `<tr><td colspan="4">Este carrito no tiene productos.</td></tr>`;
      totalCarritoEl.textContent = "0.00";
      return;
    }

    items.forEach(item => {
      const subtotal = item.cantidad * item.precio_unitario;
      total += subtotal;

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${item.nombre_producto}</td>
        <td>${item.cantidad}</td>
        <td>$${item.precio_unitario.toFixed(2)}</td>
        <td>$${subtotal.toFixed(2)}</td>
      `;
      tablaItems.appendChild(fila);
    });

    totalCarritoEl.textContent = total.toFixed(2);
  } catch (error) {
    alert("❌ No se pudo cargar el carrito.");
    console.error("Error en cargarItemsDelCarrito:", error);
  }
}

// 🔄 Al cambiar el carrito seleccionado
selectCarrito.addEventListener("change", () => {
  const id = selectCarrito.value;
  if (id) cargarItemsDelCarrito(id);
});

// 🚀 Inicialización
cargarCarritos();
