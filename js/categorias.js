// 🔹 Validar que el usuario logueado sea ADMIN/PROVEEDOR (fk_id_rol = 1)
// const usuario = JSON.parse(localStorage.getItem("usuario"));
// if (!usuario || usuario.fk_id_rol !== 1) {
//   alert("Acceso denegado. Debes iniciar sesión como administrador/proveedor.");
//   window.location.href = "../../../index.html";
// }

document.addEventListener("DOMContentLoaded", () => {
  cargarCategorias();

  const buscarInput = document.querySelector("#buscarCategoria");
  buscarInput.addEventListener("input", filtrarCategorias);
});

let categoriasGlobal = [];
let modoEdicion = false;

const form = document.querySelector("#formCategoria");
const cancelarBtn = document.querySelector("#cancelarEdicion");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = parseInt(document.querySelector("#idCategoria").value);
  const descripcion = document.querySelector("#descripcionCategoria").value;

  const categoria = {
    id_categoria_producto: id,
    descripcion_producto: descripcion
  };

  const url = "http://localhost:8080/pruebaApi/api/categorias";
  const metodo = modoEdicion ? "PUT" : "POST";

  fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoria)
  })
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo guardar");
      return res.text();
    })
    .then(() => {
      alert(modoEdicion ? "✏️ Categoría actualizada" : "✅ Categoría guardada");
      form.reset();
      cancelarBtn.hidden = true;
      modoEdicion = false;
      cargarCategorias();
    })
    .catch((err) => {
      console.error("Error al guardar:", err);
    });
});

cancelarBtn.addEventListener("click", () => {
  form.reset();
  cancelarBtn.hidden = true;
  modoEdicion = false;
});

function cargarCategorias() {
  fetch("http://localhost:8080/pruebaApi/api/categorias")
    .then((res) => res.json())
    .then((categorias) => {
      categoriasGlobal = categorias;
      renderizarCategorias(categoriasGlobal);
    })
    .catch((err) => console.error("Error al cargar categorías:", err));
}

function renderizarCategorias(lista) {
  const tbody = document.querySelector("#tablaCategorias tbody");
  tbody.innerHTML = "";

  lista.forEach((c) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${c.id_categoria_producto}</td>
      <td>${c.descripcion_producto}</td>
      <td>${c.total_productos ?? "—"}</td>
      <td>
        <button onclick="editarCategoria(${c.id_categoria_producto})">✏️ Editar</button>
        <button onclick="eliminarCategoria(${c.id_categoria_producto})">🗑️ Eliminar</button>
      </td>`;
    tbody.appendChild(fila);
  });
}

function editarCategoria(id) {
  const categoria = categoriasGlobal.find((c) => c.id_categoria_producto === id);
  if (!categoria) return;

  document.querySelector("#idCategoria").value = categoria.id_categoria_producto;
  document.querySelector("#descripcionCategoria").value = categoria.descripcion_producto;
  modoEdicion = true;
  cancelarBtn.hidden = false;
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
      console.error("Error al eliminar categoría:", err);
    });
}

function filtrarCategorias(e) {
  const filtro = e.target.value.toLowerCase();
  const filtradas = categoriasGlobal.filter((c) =>
    c.descripcion_producto.toLowerCase().includes(filtro)
  );
  renderizarCategorias(filtradas);
}
