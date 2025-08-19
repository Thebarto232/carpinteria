    const idCarrito = 1; // ⚠️ debe venir de sesión/login
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
        .then(res => {
          if (!res.ok) throw new Error("No se pudo eliminar el ítem.");
          return res.json();
        })
        .then(data => {
          console.log(data.mensaje);
          cardElement.remove();
          itemsConfirmados = itemsConfirmados.filter(i => i !== idItem);
        })
        .catch(err => {
          console.error("Error al eliminar ítem:", err);
          alert("No se pudo eliminar el producto.");
        });
    }

    // 📌 Renderizar carrito
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
          console.error("Error al cargar carrito:", err);
          contenedor.innerHTML = "<p>Error al cargar el carrito.</p>";
        });
    }

    // 📌 Finalizar compra
    function finalizarCompra(idCarrito, metodoPago) {
      fetch("http://localhost:8080/pruebaApi/api/venta/finalizar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fk_id_carrito: idCarrito,
          metod_pago: metodoPago   // ✅ corregido nombre exacto del campo
        })
      })
        .then(res => {
          if (!res.ok) throw new Error("Error en la respuesta del servidor");
          return res.json();
        })
        .then(data => {
          alert(data.mensaje || "Compra confirmada ✅");
          itemsConfirmados = [];
          window.location.href = "/cliente/historial.html";
        })
        .catch(err => {
          console.error("Error al finalizar compra:", err);
          alert("Error al confirmar la compra.");
        });
    }
    