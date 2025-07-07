document.addEventListener("DOMContentLoaded", cargarCategorias);

const form = document.querySelector("#formCategoria");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.querySelector("#idCategoria").value;
  const descripcion = document.querySelector("#descripcionCategoria").value;

  fetch("http://localhost:8080/pruebaApi/api/categorias", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_categoria_producto: parseInt(id),
      descripcion_producto: descripcion
    })
  })
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo guardar");
      return res.text();
    })
    .then(() => {
      alert("✅ Categoría guardada");
      form.reset();
      cargarCategorias();
    })
    .catch((err) => {
      console.error("Error:", err);
    });
});

function cargarCategorias() {
  fetch("http://localhost:8080/pruebaApi/api/categorias")
    .then((res) => res.json())
    .then((categorias) => {
      const tbody = document.querySelector("#tablaCategorias tbody");
      tbody.innerHTML = "";
      categorias.forEach((c) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${c.id_categoria_producto}</td>
          <td>${c.descripcion_producto}</td>
          <td>
            <button class="boton_eliminar" onclick="eliminarCategoria(${c.id_categoria_producto})">🗑️ Eliminar</button>
          </td>`;
        tbody.appendChild(fila);
      });
    });
}

function eliminarCategoria(id) {
  if (!confirm("¿Eliminar esta categoría?")) return;

  fetch(`http://localhost:8080/pruebaApi/api/categorias/${id}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo eliminar");
      alert("🗑️ Categoría eliminada");
      cargarCategorias();
    })
    .catch((err) => {
      console.error("Error:", err);
    });
}
