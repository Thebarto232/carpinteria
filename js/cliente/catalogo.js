const metodoPago = "Transferencia"; // Puedes hacerlo dinámico si lo deseas

// 🔍 Obtener carrito ACTIVO del usuario logueado (por sesión)
async function obtenerCarritoActivo() {
  const res = await fetch("http://localhost:8080/pruebaApi/api/carrito/carrito-activo", {
    credentials: "include"
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("Respuesta inválida del servidor al obtener carrito.");
  }

  if (!res.ok || !data.id_carrito) throw new Error(data.error || "No se pudo obtener el carrito activo");
  return data.id_carrito;
}

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
      ${stock <= 0
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

// 📌 Función: enviar producto al backend usando carrito por sesión
async function agregarAlCarrito(btn, idProducto, precioUnitario, stockDisponible) {
  const inputCantidad = btn.parentElement.querySelector(".input-cantidad");
  const cantidad = Number(inputCantidad.value);

  if (isNaN(cantidad) || cantidad <= 0) {
    alert("Cantidad inválida.");
    return;
  }

  if (cantidad > stockDisponible) {
    alert("No puedes agregar más de lo disponible.");
    return;
  }

  try {
    const idCarrito = await obtenerCarritoActivo();

    const item = {
      fk_id_carrito: Number(idCarrito),
      fk_id_producto: Number(idProducto),
      cantidad: Number(cantidad),
      precio_unitario: Number(precioUnitario)
      // ✅ No enviamos subtotal, el backend lo calcula
    };

    console.log("📤 Enviando al backend:", item);

    const res = await fetch("http://localhost:8080/pruebaApi/api/carrito/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(item)
    });

    let data;
    try {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text);
      }
    } catch (e) {
      throw new Error("Respuesta inválida del servidor: " + e.message);
    }

    if (!res.ok) throw new Error(data.error || "Error al agregar producto");

    alert(data.mensaje || "Producto agregado ✅");
  } catch (err) {
    console.error("❌ Error al agregar al carrito:", err.message);
    alert("No se pudo agregar el producto. Verifica stock o datos.");
  }
}

// 📌 Render dinámico de productos al cargar la vista cliente
document.addEventListener("DOMContentLoaded", () => {
  const catalogoContainer = document.getElementById("catalogo");

  fetch("http://localhost:8080/pruebaApi/api/productos", {
    credentials: "include"
  })
    .then(async res => {
      if (!res.ok) throw new Error("Error al cargar productos");

      let productos;
      try {
        productos = await res.json();
      } catch (e) {
        throw new Error("Respuesta inválida del servidor al cargar productos.");
      }

      catalogoContainer.innerHTML = "";

      productos.forEach(producto => {
        const card = crearCardProducto(producto);
        catalogoContainer.appendChild(card);
      });

      document.querySelectorAll(".btn-agregar").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = Number(btn.dataset.id);
          const precio = Number(btn.dataset.precio);
          const stock = Number(btn.dataset.stock);
          agregarAlCarrito(btn, id, precio, stock);
        });
      });
    })
    .catch(err => {
      console.error("❌ Error al cargar productos:", err.message);
      catalogoContainer.innerHTML = `<p class="mensaje-error">Error al cargar productos: ${err.message}</p>`;
    });
});
