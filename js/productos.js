document.addEventListener("DOMContentLoaded", () => {
  if (!window.categoriasCargadas) {
    cargarCategorias();
    window.categoriasCargadas = true;
  }

  fetchProductos();

  const filtroCategoria = document.getElementById("filtroCategoria");
  if (filtroCategoria) {
    filtroCategoria.addEventListener("change", filtrarPorCategoria);
  }
});

const btn = document.querySelector(".productos__btn");
let productoEditandoId = null;

btn.addEventListener("click", async (e) => {
  e.preventDefault();

  const nombre = document.querySelector("#nombre").value.trim();
  const valor = parseFloat(document.querySelector("#valor").value);
  const stock = parseInt(document.querySelector("#stock").value);
  const categoria = parseInt(document.querySelector("#categoria").value);
  const fotoInput = document.querySelector("#foto");

  if (!nombre || isNaN(valor) || isNaN(stock) || isNaN(categoria) || !fotoInput.files[0]) {
    alert("⚠️ Por favor, complete todos los campos correctamente, incluyendo la imagen.");
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

  try {
    const resProducto = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });

    if (!resProducto.ok) throw new Error("Error al guardar producto");

    const idProducto = productoEditandoId
      ? productoEditandoId
      : await resProducto.text(); // El backend debe devolver el ID del nuevo producto

    // 📸 Subir imagen a /foto
    const formData = new FormData();
    formData.append("foto", fotoInput.files[0]);
    formData.append("fk_id_producto", idProducto);

    const resFoto = await fetch("http://localhost:8080/pruebaApi/api/foto/upload", {
      method: "POST",
      body: formData,
    });

    if (!resFoto.ok) throw new Error("Error al subir la foto");

    alert(productoEditandoId ? "✏️ Producto actualizado con imagen" : "✅ Producto guardado con imagen");
    limpiarFormulario();
    fetchProductos();
  } catch (err) {
    console.error("❌ Error al guardar producto o imagen:", err);
    alert("❌ Fallo al registrar producto o imagen");
  }
});

function cargarCategorias() {
  fetch("http://localhost:8080/pruebaApi/api/categorias")
    .then((res) => {
      if (!res.ok) throw new Error("No se pudieron obtener categorías.");
      return res.json();
    })
    .then((categorias) => {
      const selectRegistro = document.getElementById("categoria");
      const selectFiltro = document.getElementById("filtroCategoria");

      if (selectRegistro.options.length > 0) selectRegistro.innerHTML = '';
      if (selectFiltro.options.length > 0) selectFiltro.innerHTML = '';

      const defaultReg = document.createElement("option");
      defaultReg.value = "";
      defaultReg.textContent = "-- Categoría --";
      selectRegistro.appendChild(defaultReg);

      const defaultFil = document.createElement("option");
      defaultFil.value = "";
      defaultFil.textContent = "-- Filtrar por categoría --";
      selectFiltro.appendChild(defaultFil);

      const idsInsertados = new Set();
      categorias.forEach((cat) => {
        if (!idsInsertados.has(cat.id_categoria_producto)) {
          idsInsertados.add(cat.id_categoria_producto);

          const option1 = document.createElement("option");
          option1.value = cat.id_categoria_producto;
          option1.textContent = cat.descripcion_producto;
          selectRegistro.appendChild(option1);

          const option2 = document.createElement("option");
          option2.value = cat.id_categoria_producto;
          option2.textContent = cat.descripcion_producto;
          selectFiltro.appendChild(option2);
        }
      });
    })
    .catch((err) => {
      console.error("❌ Error al cargar categorías:", err);
    });
}

function fetchProductos(productosExternos = null) {
  if (productosExternos) {
    renderizarProductos(productosExternos);
    return;
  }

  fetch("http://localhost:8080/pruebaApi/api/productos")
    .then((res) => {
      if (!res.ok) throw new Error("No se pudieron obtener productos.");
      return res.json();
    })
    .then((productos) => {
      renderizarProductos(productos);
    })
    .catch((error) => {
      console.error("❌ Error al cargar productos:", error);
    });
}

function renderizarProductos(productos) {
  const tabla = document.getElementById("tablaProductos");
  tabla.innerHTML = "";

  productos.forEach((p) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.id_producto}</td>
      <td>${p.nombre_producto}</td>
      <td>$${p.valor_producto.toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>${p.nombre_categoria || p.fk_id_categoria_producto}</td>
      <td>${new Date(p.fecha_creacion).toLocaleDateString()}</td>
      <td class="conten_botones">
        <button class="btn_editar" onclick="editarProducto(${p.id_producto})">Editar</button>
        <button class="btn_eliminar" onclick="eliminarProducto(${p.id_producto})">Eliminar</button>
      </td>
    `;
    tabla.appendChild(fila);
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
  document.querySelector("#foto").value = "";
  productoEditandoId = null;
  btn.textContent = "Registrar producto";
}

async function filtrarPorCategoria() {
  const filtroCategoria = document.getElementById("filtroCategoria");
  const categoriaSeleccionada = filtroCategoria.value;

  if (!categoriaSeleccionada) {
    fetchProductos();
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/pruebaApi/api/productos/categoria/${categoriaSeleccionada}`);
    if (!res.ok) throw new Error("No se pudieron obtener productos por categoría.");
    const productosFiltrados = await res.json();
    fetchProductos(productosFiltrados);
  } catch (err) {
    console.error("Error al filtrar por categoría:", err);
    alert("No se pudo filtrar los productos.");
  }
}
