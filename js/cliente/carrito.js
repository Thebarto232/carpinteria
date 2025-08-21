const metodoPago = "Transferencia"; // Puedes hacerlo dinámico si lo deseas

let itemsConfirmados = [];
let idCarrito = null; // Se obtiene dinámicamente desde la sesión

document.addEventListener("DOMContentLoaded", async () => {
  try {
    idCarrito = await obtenerCarritoActivo(); // 🔄 Ya no se usa codUsuario
    console.log("🛒 Carrito activo obtenido:", idCarrito);

    cargarCarrito(idCarrito);

    document.getElementById("confirmar-compra").addEventListener("click", () => {
      if (itemsConfirmados.length === 0) {
        alert("Debes confirmar al menos un producto antes de finalizar la compra.");
        return;
      }
      finalizarCompra(metodoPago); // ✅ Ya no se pasa idCarrito

    });
  } catch (err) {
    console.error("❌ Error al inicializar carrito:", err.message);
    alert("No se pudo cargar tu carrito. Intenta más tarde.");
  }
});

// 🔍 Obtener carrito ACTIVO usando sesión
async function obtenerCarritoActivo() {
  const res = await fetch("http://localhost:8080/pruebaApi/api/carrito/carrito-activo", {
    credentials: "include" // 🔐 Esto envía la cookie de sesión
  });
  const data = await res.json();
  if (!res.ok || !data.id_carrito) throw new Error("No se pudo obtener el carrito activo");
  return data.id_carrito;
}

// 🗑️ Eliminar ítem del carrito y devolver stock
function eliminarItemDelCarrito(idItem, cardElement) {
  fetch(`http://localhost:8080/pruebaApi/api/carrito/item/${idItem}`, {
    method: "DELETE",
    credentials: "include"
  })
    .then(async res => {
      const data = await res.json();

      if (!res.ok) {
        console.warn("⚠️ Backend devolvió error:", data.error);
        throw new Error(data.error || "Error desconocido al eliminar el ítem.");
      }

      console.log("🗑️", data.mensaje);
      alert(data.mensaje);

      cardElement.remove();
      itemsConfirmados = itemsConfirmados.filter(i => i !== idItem);
    })
    .catch(err => {
      console.error("❌ Error al eliminar ítem:", err.message);
      alert("No se pudo eliminar el producto: " + err.message);
    });
}

// 📦 Renderizar carrito
function cargarCarrito(idCarrito) {
  const contenedor = document.getElementById("carrito-container");
  contenedor.innerHTML = "<p>Cargando carrito...</p>";

  fetch(`http://localhost:8080/pruebaApi/api/carrito/${idCarrito}`, {
    credentials: "include"
  })
    .then(res => res.json())
    .then(items => {
      contenedor.innerHTML = "";

      if (!items.length) {
        contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
        return;
      }

      items.forEach(item => {
        const subtotal = item.cantidad * item.precio_unitario;

        const card = document.createElement("div");
        card.classList.add("card__item");
        card.innerHTML = `
          <h3>${item.nombre_producto}</h3>
          <p>Cantidad: ${item.cantidad}</p>
          <p>Precio unitario: $${item.precio_unitario.toLocaleString()}</p>
          <p>Subtotal: $${subtotal.toLocaleString()}</p>
          <div class="acciones">
            <button class="btn__confirmar-item">Confirmar</button>
            <button class="btn__eliminar-item">Eliminar</button>
          </div>
        `;

        const btnConfirmar = card.querySelector(".btn__confirmar-item");
        const btnEliminar = card.querySelector(".btn__eliminar-item");

        btnConfirmar.addEventListener("click", () => {
          if (!itemsConfirmados.includes(item.id_item)) {
            itemsConfirmados.push(item.id_item);
            btnConfirmar.disabled = true;
            btnConfirmar.textContent = "Confirmado ✅";
            card.classList.add("item__confirmado");
          }
        });

        btnEliminar.addEventListener("click", () => {
          eliminarItemDelCarrito(item.id_item, card);
        });

        contenedor.appendChild(card);
      });
    })
    .catch(err => {
      console.error("❌ Error al cargar carrito:", err);
      contenedor.innerHTML = "<p>Error al cargar el carrito.</p>";
    });
}

// 🧾 Finalizar compra usando sesión
function finalizarCompra(metodoPago) {
  fetch("http://localhost:8080/pruebaApi/api/venta/finalizar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ metod_pago: metodoPago })
  })
    .then(async res => {
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

      if (!res.ok) throw new Error(data.error || "Error al confirmar la compra.");

      alert(data.mensaje || "Compra confirmada ✅");

      // 🧹 Limpiar estado local
      itemsConfirmados = [];

      // 🔄 Esperar a que el nuevo carrito esté disponible
      setTimeout(async () => {
        try {
          const nuevoId = await obtenerCarritoActivo();
          const contenedor = document.getElementById("carrito-container");

          if (!nuevoId || nuevoId === -1) {
            contenedor.innerHTML = "<p>No tienes compras pendientes.</p>";
          } else {
            idCarrito = nuevoId;
            contenedor.innerHTML = "<p>Nuevo carrito creado. Puedes seguir comprando.</p>";
          }

          // ✅ Redirigir al historial después de limpiar la vista
          window.location.href = "/cliente/historial.html";
        } catch (err) {
          console.error("❌ Error al obtener nuevo carrito:", err.message);
        }
      }, 500); // Espera breve para que el backend cree el nuevo carrito
    })
    .catch(err => {
      console.error("❌ Error al finalizar compra:", err.message);
      alert("Error al confirmar la compra: " + err.message);
    });
}

