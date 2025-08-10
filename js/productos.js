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

const API_BASE = "http://localhost:8080/pruebaApi/api/productos";
const API_CATEGORIAS = "http://localhost:8080/pruebaApi/api/categorias";

let productoEditandoId = null;
const btn = document.querySelector(".productos__btn");

btn.addEventListener("click", guardarProducto);

async function guardarProducto(e) {
  e.preventDefault();

  const nombre = document.querySelector("#nombre").value.trim();
  const valor = parseFloat(document.querySelector("#valor").value);
  const stock = parseInt(document.querySelector("#stock").value);
  const categoria = parseInt(document.querySelector("#categoria").value);
  const fotoInput = document.querySelector("#foto");

  if (!nombre || isNaN(valor) || isNaN(stock) || isNaN(categoria)) {
    return alert("⚠️ Complete todos los campos correctamente.");
  }

  const producto = {
    nombre_producto: nombre,
    valor_producto: valor,
    stock: stock,
    fk_id_categoria_producto: categoria,
    fecha_creacion: new Date().toISOString().slice(0, 10),
  };

  const esEdicion = Boolean(productoEditandoId);
  const url = esEdicion ? `${API_BASE}/${productoEditandoId}` : API_BASE;
  const metodo = esEdicion ? "PUT" : "POST";

  try {
    const resProducto = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });

    if (!resProducto.ok) throw new Error("Error al guardar producto");

    const idProducto = esEdicion
      ? productoEditandoId
      : (await resProducto.json()).id_producto;

    // Subir imagen solo si se seleccionó una
    if (fotoInput.files.length > 0) {
      await subirImagen(idProducto, fotoInput.files[0]);
    }

    alert(esEdicion ? "✏️ Producto actualizado" : "✅ Producto guardado");
    limpiarFormulario();
    fetchProductos();
  } catch (err) {
    console.error("❌ Error:", err);
    alert("❌ Fallo al registrar producto o imagen");
  }
}

async function subirImagen(idProducto, archivo) {
  const formData = new FormData();
  formData.append("foto", archivo);

  const res = await fetch(`${API_BASE}/${idProducto}/imagen`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) throw new Error("Error al actualizar imagen");
}

function cargarCategorias() {
  fetch(API_CATEGORIAS)
    .then((res) => res.json())
    .then((categorias) => {
      const selectRegistro = document.getElementById("categoria");
      const selectFiltro = document.getElementById("filtroCategoria");

      const opciones = (select, texto) => {
        select.innerHTML = "";
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = texto;
        select.appendChild(opt);
      };

      opciones(selectRegistro, "-- Categoría --");
      opciones(selectFiltro, "-- Filtrar por categoría --");

      const idsInsertados = new Set();
      categorias.forEach((cat) => {
        if (!idsInsertados.has(cat.id_categoria_producto)) {
          idsInsertados.add(cat.id_categoria_producto);

          [selectRegistro, selectFiltro].forEach((select) => {
            const option = document.createElement("option");
            option.value = cat.id_categoria_producto;
            option.textContent = cat.descripcion_producto;
            select.appendChild(option);
          });
        }
      });
    })
    .catch((err) => console.error("❌ Error al cargar categorías:", err));
}

function fetchProductos(productosExternos = null) {
  if (productosExternos) {
    return renderizarProductos(productosExternos);
  }

  fetch(API_BASE)
    .then((res) => res.json())
    .then((productos) => renderizarProductos(productos))
    .catch((error) => console.error("❌ Error al cargar productos:", error));
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
      <td>
        <img src="${API_BASE}/${p.id_producto}/imagen" alt="Foto" width="60">
      </td>
      <td class="conten_botones">
        <button class="btn_editar" onclick="editarProducto(${p.id_producto})">Editar</button>
        <button class="btn_eliminar" onclick="eliminarProducto(${p.id_producto})">Eliminar</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

function editarProducto(id) {
  fetch(`${API_BASE}/${id}`)
    .then((res) => res.json())
    .then((p) => {
      document.querySelector("#nombre").value = p.nombre_producto;
      document.querySelector("#valor").value = p.valor_producto;
      document.querySelector("#stock").value = p.stock;
      document.querySelector("#categoria").value = p.fk_id_categoria_producto;
      productoEditandoId = id;
      btn.textContent = "Actualizar producto";
    })
    .catch((error) => console.error("❌ Error al obtener producto:", error));
}

function eliminarProducto(id) {
  if (!confirm("¿Estás seguro de eliminar este producto?")) return;

  fetch(`${API_BASE}/${id}`, { method: "DELETE" })
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo eliminar");
      alert("🗑️ Producto eliminado con éxito");
      fetchProductos();
    })
    .catch((error) => console.error("❌ Error al eliminar producto:", error));
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
  const categoria = document.getElementById("filtroCategoria").value;
  if (!categoria) return fetchProductos();

  try {
    const res = await fetch(`${API_BASE}/categoria/${categoria}`);
    const productosFiltrados = await res.json();
    fetchProductos(productosFiltrados);
  } catch (err) {
    console.error("Error al filtrar:", err);
    alert("No se pudo filtrar los productos.");
  }
}
