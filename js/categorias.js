document.addEventListener("DOMContentLoaded", () => {
  cargarCategorias();

  const buscarInput = document.querySelector("#buscarCategoria");
  buscarInput.addEventListener("input", filtrarCategorias);
});

let categoriasGlobal = [];
let modoEdicion = false;

const form = document.querySelector("#formCategoria");
const cancelarBtn = document.querySelector("#cancelarEdicion");
const submitBtn = document.querySelector("#btnGuardarCategoria");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = parseInt(document.querySelector("#idCategoria").value);
  const descripcion = document.querySelector("#descripcionCategoria").value.trim();

  // 🔒 Validaciones defensivas
  if (isNaN(id) || id <= 0) {
    alert("⚠️ Debes ingresar un ID válido (mayor a 0).");
    return;
  }

  if (!descripcion || descripcion.length < 3 || descripcion.length > 50) {
    alert("⚠️ La descripción debe tener entre 3 y 50 caracteres.");
    return;
  }

  if (!/[a-zA-Z0-9]/.test(descripcion)) {
    alert("⚠️ La descripción debe contener al menos un carácter alfanumérico.");
    return;
  }

  const existe = categoriasGlobal.find((c) =>
    c.descripcion_producto.trim().toLowerCase() === descripcion.toLowerCase()
  );

  if (modoEdicion) {
    const original = categoriasGlobal.find((c) => c.id_categoria_producto === id);
    if (!original) {
      alert("❌ Categoría original no encontrada.");
      return;
    }

    if (existe && existe.id_categoria_producto !== id) {
      alert("⚠️ Ya existe otra categoría con esa descripción.");
      return;
    }

    if (original.descripcion_producto.trim().toLowerCase() === descripcion.toLowerCase()) {
      alert("⚠️ No se detectaron cambios en la descripción.");
      return;
    }
  } else {
    const idExistente = categoriasGlobal.find((c) => c.id_categoria_producto === id);
    if (idExistente) {
      alert("⚠️ Ya existe una categoría con ese ID.");
      return;
    }

    if (existe) {
      alert("⚠️ La categoría ya existe.");
      return;
    }
  }

  submitBtn.disabled = true;

  const categoria = {
    id_categoria_producto: id,
    descripcion_producto: descripcion
  };

  const url = modoEdicion
    ? `http://localhost:8080/pruebaApi/api/categorias/${id}`
    : "http://localhost:8080/pruebaApi/api/categorias";

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
    })
    .finally(() => {
      submitBtn.disabled = false;
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
  const categoria = categoriasGlobal.find((c) => c.id_categoria_producto === id);
  if (!categoria) {
    alert("❌ Categoría no encontrada.");
    return;
  }

  if (categoria.total_productos && categoria.total_productos > 0) {
    alert("⚠️ No se puede eliminar esta categoría porque tiene productos asociados.");
    return;
  }

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

function filtrarCategorias() {
  const texto = document.querySelector("#buscarCategoria").value.toLowerCase();
  const filtradas = categoriasGlobal.filter((c) =>
    c.descripcion_producto.toLowerCase().includes(texto)
  );
  renderizarCategorias(filtradas);
}
