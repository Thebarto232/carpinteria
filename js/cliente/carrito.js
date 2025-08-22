const metodoPago = "Transferencia"; // Podrías hacerlo dinámico

let itemsConfirmados = [];
let idCarrito = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    idCarrito = await obtenerCarritoActivo();
    console.log("🛒 Carrito activo obtenido:", idCarrito);

    cargarCarrito(idCarrito);

    document.getElementById("confirmar-compra").addEventListener("click", () => {
      if (itemsConfirmados.length === 0) {
        alert("Debes confirmar al menos un producto antes de finalizar la compra.");
        return;
      }
      finalizarCompra(metodoPago); // 🚀 Ahora backend valida el cliente y carrito
    });
  } catch (err) {
    console.error("❌ Error al inicializar carrito:", err.message);
    alert("No se pudo cargar tu carrito. Intenta más tarde.");
  }
});

// 🔍 Carrito activo (vinculado al usuario logueado en sesión)
async function obtenerCarritoActivo() {
  const res = await fetch("http://localhost:8080/pruebaApi/api/carrito/carrito-activo", {
    credentials: "include"
  });
  const data = await res.json();
  if (!res.ok || !data.id_carrito) throw new Error("No se pudo obtener el carrito activo");
  return data.id_carrito;
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

// 🗑️ Eliminar ítem
function eliminarItemDelCarrito(idItem, cardElement) {
  fetch(`http://localhost:8080/pruebaApi/api/carrito/item/${idItem}`, {
    method: "DELETE",
    credentials: "include"
  })
    .then(async res => {
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error desconocido al eliminar el ítem.");

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

// 🧾 Finalizar compra
function finalizarCompra(metodoPago) {
  fetch("http://localhost:8080/pruebaApi/api/venta/finalizar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ metod_pago: metodoPago })
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al confirmar la compra.");

      alert(data.mensaje || "Compra confirmada ✅");

      itemsConfirmados = [];

      // 🔄 Refrescar carrito activo (o redirigir al historial)
      setTimeout(async () => {
        try {
          const nuevoId = await obtenerCarritoActivo();
          idCarrito = nuevoId;
          window.location.href = "/cliente/historial.html";
        } catch (err) {
          console.error("❌ Error al obtener nuevo carrito:", err.message);
        }
      }, 500);
    })
    .catch(err => {
      console.error("❌ Error al finalizar compra:", err.message);
      alert("Error al confirmar la compra: " + err.message);
    });
}
