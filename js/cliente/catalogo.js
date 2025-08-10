const API_URL = "http://localhost:8080/pruebaApi/api";
const URL_IMAGENES = "http://localhost:8080/pruebaApi/imagenes/productos/";
const main = document.querySelector("main");

// const usuario = JSON.parse(localStorage.getItem("usuario"));
// if (!usuario || usuario.fk_id_rol !== 2) {
//   alert("Acceso denegado.");
//   window.location.href = "/login.html";
// }

const clienteId = usuario.id_usuario;
let ventaActiva = null;
let totalVenta = 0;

async function obtenerOcrearVenta() {
  const ventaData = {
    fk_id_vendedor: null,
    fk_id_comprador: clienteId,
    fecha_venta: new Date().toISOString().split("T")[0],
    metod_pago: "SIN DEFINIR",
    valor_venta: 0,
    descuento_venta: 0,
    estado: "PENDIENTE"
  };

  const res = await fetch(`${API_URL}/ventas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ventaData)
  });

  if (res.ok) {
    ventaActiva = await res.json();
  } else {
    alert("❌ Error al crear la venta.");
  }
}

async function agregarProducto(producto) {
  if (!ventaActiva?.id_venta) return alert("❌ No hay venta activa.");

  const detalle = {
    fk_id_venta: ventaActiva.id_venta,
    fk_id_producto: producto.id_producto,
    cantidad_producto: 1,
    precio_unitario: producto.valor_producto,
    subtotal: producto.valor_producto
  };

  const res = await fetch(`${API_URL}/detalle_venta`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(detalle)
  });

  if (res.ok) {
    await res.json();
    await cargarResumenCompra();
    alert(`✅ Producto "${producto.nombre_producto}" agregado.`);
  } else {
    alert("❌ No se pudo agregar el producto.");
  }
}

const btnConcluir = document.createElement("button");
btnConcluir.textContent = "Concluir mi compra";
btnConcluir.className = "btn-concluir";
btnConcluir.disabled = true;
btnConcluir.style.marginTop = "20px";

btnConcluir.addEventListener("click", async () => {
  if (!ventaActiva?.id_venta || totalVenta === 0) {
    return alert("⚠️ No hay productos en la venta.");
  }

  const ventaActualizada = {
    fk_id_vendedor: ventaActiva.fk_id_vendedor,
    fk_id_comprador: ventaActiva.fk_id_comprador,
    fecha_venta: ventaActiva.fecha_venta,
    metod_pago: ventaActiva.metod_pago,
    valor_venta: totalVenta,
    descuento_venta: ventaActiva.descuento_venta,
    estado: ventaActiva.estado
  };

  const resUpdate = await fetch(`${API_URL}/ventas/${ventaActiva.id_venta}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ventaActualizada)
  });

  if (!resUpdate.ok) return alert("❌ Error al actualizar la venta.");

  const resConcluir = await fetch(`${API_URL}/ventas/concluir/${ventaActiva.id_venta}`, {
    method: "PUT"
  });

  if (!resConcluir.ok) {
    const error = await resConcluir.text();
    return alert(`❌ Error al concluir la venta: ${error}`);
  }

  const estado = await resConcluir.text();
  alert(`✅ Venta concluida. Estado: ${estado}`);
  window.location.reload();
});

async function cargarCatalogo() {
  const res = await fetch(`${API_URL}/productos`);
  const productos = await res.json();

  main.innerHTML = `
    <h2>Catálogo de productos</h2>
    <div class='catalogo'></div>
    <div id="resumen-compra" style="margin-top: 30px;">
      <h3>🧾 Resumen de tu compra</h3>
      <table id="tabla-resumen" border="1" cellpadding="5">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <p><strong>Total:</strong> $<span id="total-compra">0.00</span></p>
    </div>
  `;

  const contenedor = document.querySelector(".catalogo");

  productos.forEach(p => {
    const card = document.createElement("div");
    card.className = "producto-card";
    card.innerHTML = `
      <img src="${URL_IMAGENES + p.imagen}" alt="${p.nombre_producto}" class="producto-img" />
      <h3>${p.nombre_producto}</h3>
      <p>Precio: $${p.valor_producto.toFixed(2)}</p>
      <p>Stock: ${p.stock}</p>
      <button ${p.stock <= 0 ? "disabled" : ""} class="btn-agregar">Agregar</button>
    `;

    card.querySelector(".btn-agregar").addEventListener("click", () => agregarProducto(p));
    contenedor.appendChild(card);
  });

  main.appendChild(btnConcluir);
}

async function cargarResumenCompra() {
  if (!ventaActiva?.id_venta) return;

  const res = await fetch(`${API_URL}/detalle_venta?id_venta=${ventaActiva.id_venta}`);
  if (!res.ok) return;

  const data = await res.json();
  const tbody = document.querySelector("#tabla-resumen tbody");
  const totalSpan = document.getElementById("total-compra");

  tbody.innerHTML = "";
  let total = 0;

  if (data.length === 0) {
    btnConcluir.disabled = true;
    totalSpan.textContent = "0.00";
    return;
  }

  data.forEach(item => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.productoNombre}</td>
      <td>${item.cantidad_producto}</td>
      <td>$${item.precio_unitario.toFixed(2)}</td>
      <td>$${item.subtotal.toFixed(2)}</td>
    `;
    tbody.appendChild(fila);
    total += item.subtotal;
  });

  totalSpan.textContent = total.toFixed(2);
  totalVenta = total;
  btnConcluir.disabled = false;
}

(async () => {
  await obtenerOcrearVenta();
  await cargarCatalogo();
  await cargarResumenCompra();
})();
