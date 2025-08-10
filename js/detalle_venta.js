const API_BASE = "http://localhost:8080/pruebaApi/api";

document.addEventListener("DOMContentLoaded", () => {
  const selectVenta = document.querySelectorAll(".detalle-venta__select")[0];
  const selectProducto = document.querySelectorAll(".detalle-venta__select")[1];
  const inputCantidad = document.querySelector(".detalle-venta__input");
  const form = document.querySelector(".detalle-venta__form");
  const tbody = document.querySelector(".detalle-venta__tabla tbody");
  const estadoLabel = document.createElement("p");
  const totalLabel = document.createElement("p");
  const btnConcluir = document.createElement("button");

  estadoLabel.className = "estado-venta-label";
  totalLabel.className = "total-venta-label";
  btnConcluir.className = "detalle-venta__btn--concluir";
  btnConcluir.textContent = "Concluir Venta";
  btnConcluir.style.display = "none";

  form.parentElement.insertBefore(estadoLabel, form.nextSibling);
  form.parentElement.insertBefore(totalLabel, estadoLabel.nextSibling);
  form.parentElement.insertBefore(btnConcluir, totalLabel.nextSibling);

  let estadoVenta = "";
  let ventaIdActual = null;

  cargarVentas();
  cargarProductos();

  selectVenta.addEventListener("change", async () => {
    ventaIdActual = parseInt(selectVenta.value);
    await actualizarEstadoVenta();
    await cargarDetalles();
  });

  async function cargarVentas() {
    try {
      const res = await fetch(`${API_BASE}/ventas`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ventas = await res.json();
      selectVenta.innerHTML = `<option value="">Selecciona una venta</option>` +
        ventas.map(v => 
          `<option value="${v.id_venta}">Venta #${v.id_venta} - ${v.fecha_venta}</option>`
        ).join("");
    } catch (err) {
      console.error("Error cargando ventas:", err);
    }
  }

  async function cargarProductos() {
    try {
      const res = await fetch(`${API_BASE}/productos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const productos = await res.json();
      selectProducto.innerHTML = `<option value="">Selecciona un producto</option>` +
        productos.map(p => 
          `<option value="${p.id_producto}">${p.nombre_producto}</option>`
        ).join("");
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  }

  async function actualizarEstadoVenta() {
    if (!ventaIdActual) return;
    try {
      const res = await fetch(`${API_BASE}/ventas/buscar?id=${ventaIdActual}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const venta = await res.json();
      estadoVenta = venta.estado;
      estadoLabel.textContent = `Estado actual: ${estadoVenta}`;
      form.querySelector("button").disabled = estadoVenta !== "PENDIENTE";
      btnConcluir.style.display = estadoVenta === "PENDIENTE" ? "inline-block" : "none";
    } catch (err) {
      console.error("Error consultando estado de venta:", err);
      estadoLabel.textContent = "Estado actual: desconocido";
      btnConcluir.style.display = "none";
    }
  }

  async function cargarDetalles() {
    if (!ventaIdActual) return;
    try {
      const res = await fetch(`${API_BASE}/detalle_venta?id_venta=${ventaIdActual}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const detalles = await res.json();
      renderTabla(detalles);
    } catch (err) {
      console.error("Error cargando detalles de venta:", err);
      tbody.innerHTML = `<tr><td colspan="5">Error al cargar detalles.</td></tr>`;
    }
  }

  function renderTabla(detalles) {
    if (!Array.isArray(detalles) || detalles.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No hay productos en esta venta.</td></tr>`;
      totalLabel.textContent = "";
      return;
    }

    let total = 0;
    tbody.innerHTML = detalles.map(d => {
      total += d.subtotal ?? 0;
      return `
        <tr>
          <td>${d.productoNombre ?? "Sin nombre"}</td>
          <td>${d.cantidad_producto ?? 0}</td>
          <td>$${(d.precio_unitario ?? 0).toFixed(2)}</td>
          <td>$${(d.subtotal ?? 0).toFixed(2)}</td>
          <td>
            <button class="eliminar-btn" data-id="${d.id_detalle_venta}">Eliminar</button>
          </td>
        </tr>
      `;
    }).join("");

    totalLabel.textContent = `Total acumulado: $${total.toFixed(2)}`;

    document.querySelectorAll(".eliminar-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (confirm("¿Eliminar este detalle?")) {
          await eliminarDetalle(id);
          await actualizarEstadoVenta();
          await cargarDetalles();
        }
      });
    });
  }

  async function eliminarDetalle(id) {
    try {
      const res = await fetch(`${API_BASE}/detalle_venta/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error("Error eliminando detalle:", err);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!ventaIdActual || estadoVenta !== "PENDIENTE") return;

    const productoId = parseInt(selectProducto.value);
    const cantidad = parseInt(inputCantidad.value);

    if (!productoId || isNaN(cantidad) || cantidad <= 0) {
      alert("Selecciona un producto y una cantidad válida.");
      return;
    }

    const data = {
      fk_id_venta: ventaIdActual,
      fk_id_producto: productoId,
      cantidad_producto: cantidad
    };

    try {
      const res = await fetch(`${API_BASE}/detalle_venta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      inputCantidad.value = "";
      await actualizarEstadoVenta();
      await cargarDetalles();
    } catch (err) {
      console.error("Error agregando detalle:", err);
    }
  });

  btnConcluir.addEventListener("click", async () => {
    if (!ventaIdActual) return;

    if (!confirm("¿Estás seguro de concluir esta venta?")) return;

    try {
      const res = await fetch(`${API_BASE}/ventas/concluir/${ventaIdActual}`, {
        method: "PUT"
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const resultado = await res.json();
      alert(`Venta concluida. Estado: ${resultado.estado}`);
      await actualizarEstadoVenta();
      await cargarDetalles();
    } catch (err) {
      console.error("Error al concluir venta:", err);
      alert("No se pudo concluir la venta.");
    }
  });
});
