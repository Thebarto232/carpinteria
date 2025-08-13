document.addEventListener("DOMContentLoaded", () => {
  // 🔹 Validar que el usuario logueado sea ADMIN/PROVEEDOR (fk_id_rol = 1)
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || usuario.fk_id_rol !== 1) {
    alert("Acceso denegado. Debes iniciar sesión como administrador/proveedor.");
    window.location.href = "../../../index.html";
    return;
  }

  cargarCategorias();

  const buscarInput = document.querySelector("#buscarCategoria");
  buscarInput.addEventListener("input", filtrarCategorias);
});

let categoriasGlobal = [];
let modoEdicion = false;

const form = document.querySelector("#formCategoria");
const cancelarBtn = document.querySelector("#cancelarEdicion");
const submitBtn = document.querySelector("#btnGuardarCategoria"); // Asegúrate de tener este botón en tu HTML

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = parseInt(document.querySelector("#idCategoria").value);
  const descripcion = document.querySelector("#descripcionCategoria").value.trim();

  // 🔒 Validaciones defensivas
  if (isNaN(id) || id < 0) {
    alert("⚠️ ID inválido.");
    return;
  }

  if (!descripcion) {
    alert("⚠️ La descripción no puede estar vacía.");
    return;
  }

  if (descripcion.length > 50) {
    alert("⚠️ La descripción no puede superar los 50 caracteres.");
    return;
  }
  if (descripcion.length < 3) {
    alert("⚠️ La descripción debe tener al menos 3 caracteres.");
    return;
  }
  if (descripcion.length > 50) {
    alert("⚠️ La descripción no puede superar los 50 caracteres.");
    return;
  }
  if (descripcion.length < 3) {
    alert("⚠️ La descripción debe tener al menos 3 caracteres.");
    return;
  }
  if (descripcion.trim().length === 0) {
    alert("⚠️ La descripción no puede estar vacía.");
    return;
  }
  if (descripcion) {
    alert("⚠️  no puede editar un id existente");
  }
  if (descripcion) {
    alert("⚠️  no puede editar un id existente");
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
    if (existe) {
      alert("⚠️ La categoría ya existe.");
      return;
    }
  }

  // 🔄 Bloquear botón para evitar múltiples envíos
  submitBtn.disabled = true;

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

  // 🔒 Validación: no eliminar si tiene productos asociados
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
