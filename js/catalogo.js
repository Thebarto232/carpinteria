const API_URL = "http://localhost:8080/pruebaApi/api";
const main = document.querySelector("main");

// 🧠 Obtener ID del cliente desde localStorage
const clienteId = parseInt(localStorage.getItem("id_usuario"));
if (!clienteId) {
  alert("No se encontró el ID del cliente. Inicia sesión nuevamente.");
  window.location.href = "/login.html";
}

// 🧾 Crear venta si no existe
let ventaActiva = null;

async function obtenerOcrearVenta() {
  const ventaData = {
    fk_id_vendedor: null, // Se asigna luego si es necesario
    fk_id_comprador: clienteId,
    fecha_venta: new Date().toISOString().split("T")[0],
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

  ventaActiva = await res.json();
}

// 🛒 Agregar producto a la venta
async function agregarProducto(producto) {
  const cantidad = 1; // Por ahora, cantidad fija
  const detalle = {
    fk_id_venta: ventaActiva.id_venta,
    fk_id_producto: producto.id_producto,
    cantidad: cantidad,
    precio_unitario: producto.valor_producto,
    subtotal: producto.valor_producto * cantidad
  };

  const res = await fetch(`${API_URL}/detalle_venta`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(detalle)
  });

  if (!res.ok) {
    alert("❌ No se pudo agregar el producto.");
    return;
  }

  alert(`✅ Producto "${producto.nombre_producto}" agregado a tu venta.`);
}

// 🛍️ Mostrar catálogo
async function cargarCatalogo() {
  const res = await fetch(`${API_URL}/productos`);
  const productos = await res.json();

  main.innerHTML = "<h2>Catálogo de productos</h2><div class='catalogo'></div>";
  const contenedor = document.querySelector(".catalogo");

  productos.forEach(p => {
    const card = document.createElement("div");
    card.className = "producto-card";
    card.innerHTML = `
      <img src="../img/${p.imagen}" alt="${p.nombre_producto}" class="producto-img" />
      <h3>${p.nombre_producto}</h3>
      <p>Precio: $${p.valor_producto.toFixed(2)}</p>
      <p>Stock: ${p.stock}</p>
      <button ${p.stock <= 0 ? "disabled" : ""} class="btn-agregar">Agregar</button>
    `;

    const btn = card.querySelector(".btn-agregar");
    btn.addEventListener("click", () => agregarProducto(p));

    contenedor.appendChild(card);
  });
}

// 🚀 Inicializar
(async () => {
  await obtenerOcrearVenta();
  await cargarCatalogo();
})();
