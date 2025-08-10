const API_BASE = "http://localhost:8080/pruebaApi/api/productos";
const API_CATEGORIAS = "http://localhost:8080/pruebaApi/api/categorias";

let productoEditandoId = null;

document.addEventListener("DOMContentLoaded", () => {
  cargarCategorias();
  cargarProductos();

  document.querySelector(".productos__btn").addEventListener("click", guardarProducto);
  document.getElementById("filtroCategoria").addEventListener("change", filtrarPorCategoria);
});

async function cargarCategorias() {
  try {
    const res = await fetch(API_CATEGORIAS);
    const categorias = await res.json();

    const selectRegistro = document.getElementById("categoria");
    const selectFiltro = document.getElementById("filtroCategoria");

    [selectRegistro, selectFiltro].forEach(select => {
      select.innerHTML = `<option value="">${select === selectRegistro ? "-- Categoría --" : "-- Filtrar por categoría --"}</option>`;
    });

    categorias.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.id_categoria_producto;
      option.textContent = cat.descripcion_producto;
      selectRegistro.appendChild(option.cloneNode(true));
      selectFiltro.appendChild(option);
    });
  } catch (err) {
    console.error("❌ Error al cargar categorías:", err);
  }
}

async function cargarProductos(productosExternos = null) {
  try {
    const productos = productosExternos || await (await fetch(API_BASE)).json();
    renderizarProductos(productos);
  } catch (err) {
    console.error("❌ Error al cargar productos:", err);
  }
}

function renderizarProductos(productos) {
  const tabla = document.getElementById("tablaProductos");
  tabla.innerHTML = "";

  if (!productos.length) {
    tabla.innerHTML = `<tr><td colspan="8">No hay productos registrados.</td></tr>`;
    return;
  }

  productos.forEach(p => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.id_producto}</td>
      <td>${p.nombre_producto}</td>
      <td>$${p.valor_producto.toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>${p.nombre_categoria || p.fk_id_categoria_producto}</td>
      <td>${new Date(p.fecha_creacion).toLocaleDateString()}</td>
      <td><img src="${API_BASE}/${p.id_producto}/imagen" alt="Foto" width="60"></td>
      <td>
        <button onclick="editarProducto(${p.id_producto})">✏️</button>
        <button onclick="eliminarProducto(${p.id_producto})">🗑️</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

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
    stock,
    fk_id_categoria_producto: categoria,
    fecha_creacion: new Date().toISOString().slice(0, 10),
  };

  const esEdicion = Boolean(productoEditandoId);
  const url = esEdicion ? `${API_BASE}/${productoEditandoId}` : API_BASE;
  const metodo = esEdicion ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });

    if (!res.ok) throw new Error("Error al guardar producto");

    const idProducto = esEdicion ? productoEditandoId : (await res.json()).id_producto;

    if (fotoInput.files.length > 0) {
      await subirImagen(idProducto, fotoInput.files[0]);
    }

    alert(esEdicion ? "✏️ Producto actualizado" : "✅ Producto guardado");
    limpiarFormulario();
    cargarProductos();
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

function editarProducto(id) {
  fetch(`${API_BASE}/${id}`)
    .then(res => res.json())
    .then(p => {
      document.querySelector("#nombre").value = p.nombre_producto;
      document.querySelector("#valor").value = p.valor_producto;
      document.querySelector("#stock").value = p.stock;
      document.querySelector("#categoria").value = p.fk_id_categoria_producto;
      productoEditandoId = id;
      document.querySelector(".productos__btn").textContent = "Actualizar producto";
    })
    .catch(err => console.error("❌ Error al obtener producto:", err));
}

function eliminarProducto(id) {
  if (!confirm("¿Estás seguro de eliminar este producto?")) return;

  fetch(`${API_BASE}/${id}`, { method: "DELETE" })
    .then(res => {
      if (!res.ok) throw new Error("No se pudo eliminar");
      alert("🗑️ Producto eliminado con éxito");
      cargarProductos();
    })
    .catch(err => console.error("❌ Error al eliminar producto:", err));
}

function limpiarFormulario() {
  document.querySelector("#nombre").value = "";
  document.querySelector("#valor").value = "";
  document.querySelector("#stock").value = "";
  document.querySelector("#categoria").value = "";
  document.querySelector("#foto").value = "";
  productoEditandoId = null;
  document.querySelector(".productos__btn").textContent = "Registrar producto";
}

async function filtrarPorCategoria() {
  const categoria = document.getElementById("filtroCategoria").value;
  if (!categoria) return cargarProductos();

  try {
    const res = await fetch(`${API_BASE}/categoria/${categoria}`);
    const productosFiltrados = await res.json();
    cargarProductos(productosFiltrados);
  } catch (err) {
    console.error("❌ Error al filtrar:", err);
    alert("No se pudo filtrar los productos.");
  }
}
