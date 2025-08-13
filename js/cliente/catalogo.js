// 📌 Función: crea una tarjeta visual para un producto
function crearCardProducto(producto) {
  const nombre = producto.nombre_producto || "Sin nombre";
  const categoria = producto.nombre_categoria || "Sin categoría";
  const stock = producto.stock ?? "N/D";
  const precio = producto.valor_producto ?? 0;
  const imgUrl = producto.imagen || "http://localhost:8080/pruebaApi/imagenes/productos/default.jpg";

  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <img src="${imgUrl}" alt="${nombre}">
    <div class="card-content">
      <h3>${nombre}</h3>
      <p>Categoría: ${categoria}</p>
      <p>Precio: $${precio.toLocaleString()}</p>
      ${stock <= 0
        ? `<p class="stock-agotado">Stock: 0 unidades (Agotado)</p>`
        : `<p>Stock: ${stock} unidades</p>`
      }
    </div>
  `;

  return card;
}

// 📌 Render dinámico de productos al cargar la vista cliente
document.addEventListener("DOMContentLoaded", () => {
  const catalogoContainer = document.getElementById("catalogo");
  const inputBusqueda = document.getElementById("busqueda");
  const selectCategoria = document.getElementById("categoria");

  let productosOriginales = [];

  fetch("http://localhost:8080/pruebaApi/api/productos")
    .then(res => {
      if (!res.ok) throw new Error("Error al cargar productos");
      return res.json();
    })
    .then(productos => {
      productosOriginales = productos.filter(p => validarProducto(p));
      renderizarCatalogo(productosOriginales);
    })
    .catch(err => {
      console.error("Error al cargar productos:", err);
      catalogoContainer.innerHTML = "<p>Error al cargar productos.</p>";
    });

  function validarProducto(p) {
    return p.id_producto && p.nombre_producto && p.nombre_categoria &&
           p.valor_producto != null && p.stock != null;
  }

  function renderizarCatalogo(lista) {
    catalogoContainer.innerHTML = "";

    lista.forEach(producto => {
      const card = crearCardProducto(producto);
      catalogoContainer.appendChild(card);
    });

    if (catalogoContainer.children.length === 0) {
      catalogoContainer.innerHTML = `<p>No hay productos que coincidan con los filtros.</p>`;
    }
  }

  function aplicarFiltros() {
    const texto = inputBusqueda.value.trim().toLowerCase();
    const categoria = selectCategoria.value;

    const filtrados = productosOriginales.filter(p => {
      const coincideNombre = p.nombre_producto.toLowerCase().includes(texto);
      const coincideCategoria = categoria === "" || p.nombre_categoria === categoria;
      return coincideNombre && coincideCategoria;
    });

    renderizarCatalogo(filtrados);
  }

  inputBusqueda.addEventListener("input", aplicarFiltros);
  selectCategoria.addEventListener("change", aplicarFiltros);
});
