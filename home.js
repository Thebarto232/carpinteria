// 📌 Cierre de sesión: limpia almacenamiento y redirige al login
document.querySelectorAll(".cerrar-sesion").forEach((btn) => {
  btn.addEventListener("click", () => {
    const isLoggedIn = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (!isLoggedIn) {
      alert("No hay sesión activa.");
      return;
    }

    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/js/validaciones/login/"; // ✅ Redirección segura
  });
});

// 📌 Función: crea una tarjeta visual para un producto
function crearCardProducto(producto) {
  // Validación defensiva de campos
  const nombre = producto.nombre_producto || "Sin nombre";
  const categoria = producto.nombre_categoria || "Sin categoría";
  const stock = producto.stock ?? "N/D";
  const precio = producto.valor_producto ?? 0;
  const imgUrl = producto.imagen || "http://localhost:8080/pruebaApi/api/productos/imagen"; // Imagen por defecto  


  // Estructura de la tarjeta
  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <img src="${imgUrl}" alt="${nombre}">
    <div class="card-content">
      <h3>${nombre}</h3>
      <p>Categoría: ${categoria}</p>
      <p>Stock: ${stock} unidades</p>
      <p>Precio: $${precio.toLocaleString()}</p>
    
    </div>
  `;

  return card;
}

{/* <button onclick="verProducto(${producto.id_producto})">Ver más</button> */}
// 📌 Render dinámico de productos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  const productosContainer = document.getElementById("productosContainer");

  fetch("http://localhost:8080/pruebaApi/api/productos")
    .then(res => res.json())
    .then(productos => {
      // Validación: lista vacía o sin datos
      if (!productos || productos.length === 0) {
        productosContainer.innerHTML = "<p>No hay productos registrados.</p>";
        return;
      }

      // Render de cada producto como tarjeta
      productos.forEach(producto => {
        const card = crearCardProducto(producto);
        productosContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error al cargar productos:", err);
      productosContainer.innerHTML = "<p>Error al cargar productos.</p>";
    });
});

// 📌 Redirección al detalle del producto
// ✅ Función global para redirigir al detalle del producto
function verProducto(id) {
  if (!id || isNaN(id)) {
    alert("ID de producto inválido.");
    return;
  }

  window.location.href = `detalle_producto.html?id=${id}`;
}
