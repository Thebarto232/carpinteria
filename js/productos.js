document.addEventListener("DOMContentLoaded", () => {
  fetchProductos();
});
const btn = document.querySelector(".productos__btn");
let productoEditandoId = null;

btn.addEventListener("click", (e) => {
  e.preventDefault(); // Previene recarga del formulario

  const nombre = document.querySelector("#nombre").value.trim();
  const valor = parseFloat(document.querySelector("#valor").value);
  const stock = parseInt(document.querySelector("#stock").value);
  const categoria = parseInt(document.querySelector("#categoria").value);
  // Validación de campos
  if (!nombre || isNaN(valor) || isNaN(stock) || isNaN(categoria)) {
    alert("⚠️ Por favor, complete todos los campos correctamente.");
    return;
  }
  const producto = {
    nombre_producto: nombre,
    valor_producto: valor,
    stock: stock,
    fk_id_categoria_producto: categoria,
    fecha_creacion: new Date().toISOString().slice(0, 10),
  };
  const url = productoEditandoId
    ? `http://localhost:8080/pruebaApi/api/productos/${productoEditandoId}`
    : "http://localhost:8080/pruebaApi/api/productos";

  const metodo = productoEditandoId ? "PUT" : "POST";

  fetch(url, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(producto),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al guardar producto");
      return res.text();
    })
    .then(() => {
      alert(productoEditandoId ? "✏️ Producto actualizado" : "✅ Producto guardado");
      limpiarFormulario();
      fetchProductos();
    })
    .catch((err) => {
      console.error("❌ Error al guardar producto:", err);
      alert("❌ Fallo al registrar producto");
    });
});
function fetchProductos() {
  fetch("http://localhost:8080/pruebaApi/api/productos")
    .then((res) => {
      if (!res.ok) throw new Error("No se pudieron obtener productos.");
      return res.json();
    })
    .then((productos) => {
      const tabla = document.getElementById("tablaProductos");
      tabla.innerHTML = "";

      productos.forEach((p) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${p.id_producto}</td>
          <td>${p.nombre_producto}</td>
          <td>$${p.valor_producto.toFixed(2)}</td>
          <td>${p.stock}</td>
           <td>${p.fk_id_categoria_producto}</td>
          <td>${new Date(p.fecha_creacion).toLocaleDateString()}</td>
          <td class="conten_botones">
            <button class="btn_editar" onclick="editarProducto(${p.id_producto})">Editar</button>
            <button class="btn_eliminar" onclick="eliminarProducto(${p.id_producto})">Eliminar</button>
          </td>
        `;
        tabla.appendChild(fila);
      });
    })
    .catch((error) => {
      console.error("❌ Error al cargar productos:", error);
    });
}
function editarProducto(id) {
  fetch(`http://localhost:8080/pruebaApi/api/productos/${id}`)
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo obtener el producto");
      return res.json();
    })
    .then((p) => {
      document.querySelector("#nombre").value = p.nombre_producto;
      document.querySelector("#valor").value = p.valor_producto;
      document.querySelector("#stock").value = p.stock;
      document.querySelector("#categoria").value = p.fk_id_categoria_producto;
      productoEditandoId = id;
      btn.textContent = "Actualizar producto";
    })
    .catch((error) => {
      console.error("❌ Error al obtener producto para editar:", error);
    });
}

function eliminarProducto(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

  fetch(`http://localhost:8080/pruebaApi/api/productos/${id}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo eliminar");
      alert("🗑️ Producto eliminado con éxito");
      fetchProductos();
    })
    .catch((error) => {
      console.error("❌ Error al eliminar producto:", error);
    });
}
function limpiarFormulario() {
  document.querySelector("#nombre").value = "";
  document.querySelector("#valor").value = "";
  document.querySelector("#stock").value = "";
  document.querySelector("#categoria").value = "";
  productoEditandoId = null;
  btn.textContent = "Registrar producto";
}
