const idCarrito = 1; // ⚠️ Este valor debe venir de sesión/login real
const metodoPago = "Transferencia";

let itemsConfirmados = [];

document.addEventListener("DOMContentLoaded", () => {
  cargarCarrito(idCarrito);

  document.getElementById("confirmar-compra").addEventListener("click", () => {
    if (itemsConfirmados.length === 0) {
      alert("Debes confirmar al menos un producto antes de finalizar la compra.");
      return;
    }
    finalizarCompra(idCarrito, metodoPago);
  });
});

// 🗑️ Eliminar ítem del carrito y devolver stock
function eliminarItemDelCarrito(idItem, cardElement) {
  fetch(`http://localhost:8080/pruebaApi/api/carrito/item/${idItem}`, {
    method: "DELETE"
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        throw new Error("Respuesta inválida del servidor.");
      }

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

  fetch(`http://localhost:8080/pruebaApi/api/carrito/${idCarrito}`)
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

// 🧾 Finalizar compra
function finalizarCompra(idCarrito, metodoPago) {
  fetch("http://localhost:8080/pruebaApi/api/venta/finalizar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fk_id_carrito: idCarrito,
      metod_pago: metodoPago
    })
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        throw new Error("Respuesta inválida del servidor.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Error al confirmar la compra.");
      }

      alert(data.mensaje || "Compra confirmada ✅");
      itemsConfirmados = [];
      window.location.href = "/cliente/historial.html";
    })
    .catch(err => {
      console.error("❌ Error al finalizar compra:", err.message);
      alert("Error al confirmar la compra: " + err.message);
    });
}
