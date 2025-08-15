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
        : `<p>Stock: ${stock} unidades</p>
           <button class="btn-agregar" data-id="${producto.id_producto}" data-precio="${precio}" data-stock="${stock}">Agregar al carrito</button>`
      }
    </div>
  `;

  return card;
}

// 📌 Función: enviar producto al backend
function agregarAlCarrito(idProducto, precioUnitario, stockDisponible) {
  if (stockDisponible <= 0) {
    alert("Este producto está agotado.");
    return;
  }

  const item = {
    fk_id_carrito: 1, // ⚠️ Este ID debe ser dinámico si hay sesión
    fk_id_producto: idProducto,
    cantidad: 1,
    precio_unitario: precioUnitario
  };

  fetch("http://localhost:8080/pruebaApi/api/carrito/agregar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(item)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje || data.error);
    })
    .catch(err => {
      console.error("Error al agregar al carrito:", err);
      alert("Error al agregar el producto.");
    });
}
// 📌 Renderizar carrito del cliente
function cargarCarrito(idCarrito) {
  const contenedor = document.getElementById("carrito");
  contenedor.innerHTML = "<p>Cargando carrito...</p>";

  fetch(`http://localhost:8080/pruebaApi/api/carrito/${idCarrito}`)
    .then(res => res.json())
    .then(items => {
      contenedor.innerHTML = "";
      let total = 0;

      items.forEach(item => {
        const subtotal = item.cantidad * item.precio_unitario;
        total += subtotal;

        const div = document.createElement("div");
        div.classList.add("item-carrito");
        div.innerHTML = `
          <h4>${item.nombre_producto}</h4>
          <p>Cantidad: ${item.cantidad}</p>
          <p>Precio unitario: $${item.precio_unitario.toLocaleString()}</p>
          <p>Subtotal: $${subtotal.toLocaleString()}</p>
          <button class="btn-eliminar" data-id="${item.id_item}">Eliminar</button>
        `;
        contenedor.appendChild(div);
      });

      const resumen = document.createElement("div");
      resumen.classList.add("resumen-carrito");
      resumen.innerHTML = `<h3>Total: $${total.toLocaleString()}</h3>`;
      contenedor.appendChild(resumen);

      activarBotonesEliminar();
    })
    .catch(err => {
      console.error("Error al cargar carrito:", err);
      contenedor.innerHTML = "<p>Error al cargar el carrito.</p>";
    });
}

// 📌 Eliminar ítem del carrito
function activarBotonesEliminar() {
  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => {
      const idItem = parseInt(btn.dataset.id);

      fetch(`http://localhost:8080/pruebaApi/api/carrito/item/${idItem}`, {
        method: "DELETE"
      })
        .then(res => res.json())
        .then(data => {
          alert(data.mensaje || "Ítem eliminado");
          cargarCarrito(1); // ⚠️ ID dinámico si hay sesión
        })
        .catch(err => {
          console.error("Error al eliminar ítem:", err);
          alert("Error al eliminar el ítem.");
        });
    });
  });
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

    // 🔗 Activar listeners de botones después del render
    document.querySelectorAll(".btn-agregar").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const precio = parseFloat(btn.dataset.precio);
        const stock = parseInt(btn.dataset.stock);
        agregarAlCarrito(id, precio, stock);
      });
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
