// ../js/cliente/carrito.js
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function renderizarCarrito() {
  const container = document.getElementById('carrito-container');
  container.innerHTML = '';

  if (carrito.length === 0) {
    container.innerHTML = '<p>Tu carrito está vacío.</p>';
    return;
  }

  carrito.forEach((producto, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <img src="${producto.foto}" alt="${producto.nombre}">
      <div class="card-content">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <p><strong>$${producto.precio.toLocaleString()}</strong></p>
        <button onclick="eliminarProducto(${index})">Eliminar</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  renderizarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  localStorage.setItem('carrito', JSON.stringify(carrito));
  renderizarCarrito();
}

function finalizarCompra() {
  alert("Compra finalizada. (Simulación frontend)");
  vaciarCarrito();
}

document.addEventListener('DOMContentLoaded', renderizarCarrito);
