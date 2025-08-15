const idCarrito = 1; // ⚠️ Este ID debe venir de sesión si tienes login
const metodoPago = "Transferencia"; // Puedes hacerlo dinámico luego

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


// 📌 Renderizar carrito como cards individuales
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
          <button class="btn__confirmar-item">Confirmar</button>
        `;

        const btnConfirmar = card.querySelector(".btn__confirmar-item");
        btnConfirmar.addEventListener("click", () => {
          btnConfirmar.disabled = true;
          btnConfirmar.textContent = "Confirmado ✅";
          card.classList.add("item__confirmado");

          itemsConfirmados.push(item);
        });

        contenedor.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error al cargar carrito:", err);
      contenedor.innerHTML = "<p>Error al cargar el carrito.</p>";
    });
}


// 📌 Finalizar compra con ítems confirmados
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
    .then(res => {
      if (!res.ok) throw new Error("Error en la respuesta del servidor");
      return res.json();
    })
    .then(data => {
      alert(data.mensaje || "Compra confirmada ✅");
      window.location.href = "/cliente/historial.html";
    })
    .catch(err => {
      console.error("Error al finalizar compra:", err);
      alert("Error al confirmar la compra.");
    });
}
