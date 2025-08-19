  // 📌 Función: crea una tarjeta visual para un producto
  function crearCardProducto(producto) {
    const nombre = producto.nombre_producto || "Sin nombre";
    const categoria = producto.nombre_categoria || "Sin categoría";
    const stock = producto.stock ?? 0;
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
        <p class="stock-info">Stock: ${stock} unidades</p>
        ${
          stock <= 0
            ? `<p class="stock-agotado">Agotado</p>`
            : `
              <input type="number" class="input-cantidad" min="1" max="${stock}" value="1">
              <button class="btn-agregar" 
                data-id="${producto.id_producto}" 
                data-precio="${precio}" 
                data-stock="${stock}">
                Agregar al carrito
              </button>
            `
        }
      </div>
    `;

    return card;
  }

  // 📌 Función: enviar producto al backend y actualizar stock en pantalla
  // 📌 Función: enviar producto al backend (NO toca stock aquí)
  function agregarAlCarrito(btn, idProducto, precioUnitario, stockDisponible) {
    const inputCantidad = btn.parentElement.querySelector(".input-cantidad");
    const cantidad = parseInt(inputCantidad.value);

    if (cantidad > stockDisponible) {
      alert("No puedes agregar más de lo disponible.");
      return;
    }

    const item = {
      fk_id_carrito: 1, // ⚠️ Debe ser dinámico con sesión
      fk_id_producto: idProducto,
      cantidad: cantidad,
      precio_unitario: precioUnitario
    };

    fetch("http://localhost:8080/pruebaApi/api/carrito/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.mensaje || data.error);
        // 🚫 Ya no actualizamos el stock en pantalla aquí
        // El stock se refresca desde la BD al recargar catálogo
      })
      .catch(err => {
        console.error("Error al agregar al carrito:", err);
        alert("Error al agregar el producto.");
      });
  }


  // 📌 Render dinámico de productos al cargar la vista cliente
  document.addEventListener("DOMContentLoaded", () => {
    const catalogoContainer = document.getElementById("catalogo");

    fetch("http://localhost:8080/pruebaApi/api/productos")
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then(productos => {
        catalogoContainer.innerHTML = "";

        productos.forEach(producto => {
          const card = crearCardProducto(producto);
          catalogoContainer.appendChild(card);
        });

        // 🔗 Activar listeners de botones después del render
        document.querySelectorAll(".btn-agregar").forEach(btn => {
          btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            const precio = parseFloat(btn.dataset.precio);
            const stock = parseInt(btn.dataset.stock);
            agregarAlCarrito(btn, id, precio, stock);
          });
        });
      })
      .catch(err => {
        console.error("Error al cargar productos:", err);
        catalogoContainer.innerHTML = "<p>Error al cargar productos.</p>";
      });
  });
