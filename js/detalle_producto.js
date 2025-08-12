const API_BASE = "http://localhost:8080/pruebaApi/api/productos";

document.addEventListener("DOMContentLoaded", async () => {
  const id = obtenerIdDesdeURL();
  if (!id) {
    alert("⚠️ No se proporcionó un ID válido.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error("Producto no encontrado");

    const producto = await res.json();
    renderizarDetalle(producto);
  } catch (err) {
    console.error("❌ Error al cargar detalle:", err);
    alert("❌ No se pudo cargar el producto.");
  }
});

function obtenerIdDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderizarDetalle(p) {
  const contenedor = document.getElementById("contenedorDetalle");
  contenedor.innerHTML = `
    <div class="producto__card">
      <img src="${API_BASE}/${p.id_producto}/imagen" alt="Foto del producto" width="200">
      <h2>${p.nombre_producto}</h2>
      <p><strong>Precio:</strong> $${p.valor_producto.toFixed(2)}</p>
      <p><strong>Stock:</strong> ${p.stock} unidades</p>
      <p><strong>Categoría:</strong> ${p.nombre_categoria || p.fk_id_categoria_producto}</p>
      <p><strong>Fecha de creación:</strong> ${new Date(p.fecha_creacion).toLocaleDateString()}</p>
    </div>
  `;
}
